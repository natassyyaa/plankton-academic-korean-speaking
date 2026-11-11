-- ========== Roles ==========
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ========== Profiles ==========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  university text not null default '',
  major text not null default '',
  korean_level text not null default 'topik3'
    check (korean_level in ('topik1','topik2','topik3','topik4','topik5','topik6','none')),
  interface_language text not null default 'en'
    check (interface_language in ('ko','en','zh','vi','id','mn')),
  learning_goals text[] not null default '{}',
  weekly_minutes integer not null default 120 check (weekly_minutes between 0 and 1440),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

-- ========== Credits (B2C) ==========
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  amount integer not null check (amount <> 0),
  reason text not null check (reason in ('signup_bonus','purchase','session_usage','refund','admin_grant')),
  session_id uuid,
  package_id text,
  amount_krw integer,
  note text,
  created_at timestamptz not null default now()
);
create index credit_transactions_user_idx on public.credit_transactions (user_id, created_at desc);
grant select on public.credit_transactions to authenticated;
grant all on public.credit_transactions to service_role;
alter table public.credit_transactions enable row level security;
create policy "Users read own credit history" on public.credit_transactions for select to authenticated using (user_id = auth.uid());

create or replace function public.credit_balance_of(_user_id uuid)
returns integer language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount), 0)::integer from public.credit_transactions where user_id = _user_id
$$;

create or replace function public.get_my_credit_balance()
returns integer language sql stable security definer set search_path = public as $$
  select public.credit_balance_of(auth.uid())
$$;

-- ========== Institutions (B2B licences) ==========
create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  seats integer not null default 100 check (seats > 0),
  licence_starts_at date,
  licence_ends_at date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.institution_domains (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  domain text not null unique check (domain = lower(domain) and domain ~ '^[a-z0-9.-]+\.[a-z]{2,}$'),
  created_at timestamptz not null default now()
);
create table public.institution_invite_codes (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  code text not null unique check (code = upper(code) and length(code) between 6 and 32),
  max_uses integer check (max_uses is null or max_uses > 0),
  uses integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now()
);
create table public.institution_members (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'student' check (role in ('student','admin')),
  joined_via text not null check (joined_via in ('invite_code','email_domain','admin')),
  created_at timestamptz not null default now(),
  unique (institution_id, user_id)
);
create index institution_members_user_idx on public.institution_members (user_id);
create table public.institution_pending_invites (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  email text not null check (email = lower(email)),
  invited_by uuid,
  created_at timestamptz not null default now(),
  unique (institution_id, email)
);

grant select on public.institutions, public.institution_domains, public.institution_invite_codes,
  public.institution_members, public.institution_pending_invites to authenticated;
grant all on public.institutions, public.institution_domains, public.institution_invite_codes,
  public.institution_members, public.institution_pending_invites to service_role;
alter table public.institutions enable row level security;
alter table public.institution_domains enable row level security;
alter table public.institution_invite_codes enable row level security;
alter table public.institution_members enable row level security;
alter table public.institution_pending_invites enable row level security;

create or replace function public.is_institution_member(_institution_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.institution_members where institution_id = _institution_id and user_id = _user_id)
$$;
create or replace function public.is_institution_admin(_institution_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.institution_members where institution_id = _institution_id and user_id = _user_id and role = 'admin')
    or public.has_role(_user_id, 'admin')
$$;

create policy "Members read their institution" on public.institutions for select to authenticated
  using (public.is_institution_member(id, auth.uid()) or public.has_role(auth.uid(), 'admin'));
create policy "Institution admins read domains" on public.institution_domains for select to authenticated
  using (public.is_institution_admin(institution_id, auth.uid()));
create policy "Institution admins read invite codes" on public.institution_invite_codes for select to authenticated
  using (public.is_institution_admin(institution_id, auth.uid()));
create policy "Users read own membership; admins read all members" on public.institution_members for select to authenticated
  using (user_id = auth.uid() or public.is_institution_admin(institution_id, auth.uid()));
create policy "Institution admins read pending invites" on public.institution_pending_invites for select to authenticated
  using (public.is_institution_admin(institution_id, auth.uid()));

create or replace function public.institution_licence_is_current(_institution_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.institutions i
    where i.id = _institution_id and i.active
      and (i.licence_starts_at is null or i.licence_starts_at <= current_date)
      and (i.licence_ends_at is null or i.licence_ends_at >= current_date)
  )
$$;

-- Returns the institution whose licence currently covers the user, or null.
create or replace function public.active_licence_for(_user_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select m.institution_id from public.institution_members m
  where m.user_id = _user_id and public.institution_licence_is_current(m.institution_id)
  order by m.created_at limit 1
$$;

create or replace function public.institution_has_free_seat(_institution_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select (select count(*) from public.institution_members where institution_id = _institution_id and role = 'student')
       < (select seats from public.institutions where id = _institution_id)
$$;

-- Student redeems an invite code.
create or replace function public.redeem_institution_code(_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _c public.institution_invite_codes%rowtype;
begin
  if _uid is null then raise exception 'not_authenticated'; end if;
  select * into _c from public.institution_invite_codes
    where code = upper(regexp_replace(_code, '[\s-]', '', 'g')) for update;
  if not found or not _c.active or (_c.expires_at is not null and _c.expires_at < now())
     or (_c.max_uses is not null and _c.uses >= _c.max_uses) then
    raise exception 'invalid_code';
  end if;
  if not public.institution_licence_is_current(_c.institution_id) then raise exception 'licence_inactive'; end if;
  if public.is_institution_member(_c.institution_id, _uid) then return _c.institution_id; end if;
  if not public.institution_has_free_seat(_c.institution_id) then raise exception 'no_seats'; end if;
  insert into public.institution_members (institution_id, user_id, joined_via) values (_c.institution_id, _uid, 'invite_code');
  update public.institution_invite_codes set uses = uses + 1 where id = _c.id;
  return _c.institution_id;
end; $$;

-- Links the signed-in user to institutions via confirmed email domain or pending admin invites.
create or replace function public.sync_my_institution_access()
returns void language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _email text;
  _confirmed timestamptz;
  _inst uuid;
begin
  if _uid is null then raise exception 'not_authenticated'; end if;
  select lower(email), email_confirmed_at into _email, _confirmed from auth.users where id = _uid;
  if _email is null or _confirmed is null then return; end if;

  for _inst in select institution_id from public.institution_pending_invites where email = _email loop
    if not public.is_institution_member(_inst, _uid) and public.institution_has_free_seat(_inst) then
      insert into public.institution_members (institution_id, user_id, joined_via) values (_inst, _uid, 'admin');
    end if;
    delete from public.institution_pending_invites where institution_id = _inst and email = _email;
  end loop;

  for _inst in select d.institution_id from public.institution_domains d
               where d.domain = split_part(_email, '@', 2) loop
    if not public.is_institution_member(_inst, _uid)
       and public.institution_licence_is_current(_inst)
       and public.institution_has_free_seat(_inst) then
      insert into public.institution_members (institution_id, user_id, joined_via) values (_inst, _uid, 'email_domain');
    end if;
  end loop;
end; $$;

-- Institution admin adds a student by email (direct if account exists, else pending invite).
create or replace function public.admin_add_institution_member(_institution_id uuid, _email text)
returns text language plpgsql security definer set search_path = public as $$
declare
  _target uuid;
  _norm text := lower(trim(_email));
begin
  if not public.is_institution_admin(_institution_id, auth.uid()) then raise exception 'forbidden'; end if;
  if _norm !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid_email'; end if;
  select id into _target from auth.users where lower(email) = _norm and email_confirmed_at is not null;
  if _target is not null then
    if public.is_institution_member(_institution_id, _target) then return 'already_member'; end if;
    if not public.institution_has_free_seat(_institution_id) then raise exception 'no_seats'; end if;
    insert into public.institution_members (institution_id, user_id, joined_via) values (_institution_id, _target, 'admin');
    return 'added';
  end if;
  insert into public.institution_pending_invites (institution_id, email, invited_by)
    values (_institution_id, _norm, auth.uid()) on conflict (institution_id, email) do nothing;
  return 'invited';
end; $$;

create or replace function public.admin_create_institution_code(_institution_id uuid, _code text, _max_uses integer, _expires_at timestamptz)
returns uuid language plpgsql security definer set search_path = public as $$
declare _id uuid;
begin
  if not public.is_institution_admin(_institution_id, auth.uid()) then raise exception 'forbidden'; end if;
  insert into public.institution_invite_codes (institution_id, code, max_uses, expires_at, created_by)
    values (_institution_id, upper(_code), _max_uses, _expires_at, auth.uid()) returning id into _id;
  return _id;
end; $$;

create or replace function public.admin_remove_institution_member(_institution_id uuid, _user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_institution_admin(_institution_id, auth.uid()) then raise exception 'forbidden'; end if;
  delete from public.institution_members where institution_id = _institution_id and user_id = _user_id;
end; $$;

-- ========== Presentation files ==========
create table public.presentation_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null check (kind in ('script','slides')),
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes integer not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);
create index presentation_files_user_idx on public.presentation_files (user_id, created_at desc);
grant select, delete on public.presentation_files to authenticated;
grant all on public.presentation_files to service_role;
alter table public.presentation_files enable row level security;
create policy "Users read own files" on public.presentation_files for select to authenticated using (user_id = auth.uid());
create policy "Users delete own files" on public.presentation_files for delete to authenticated using (user_id = auth.uid());

-- ========== Practice sessions ==========
create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null check (type in ('speaking','presentation','qna','group')),
  scenario text,
  topic text not null default '',
  difficulty text check (difficulty in ('basic','intermediate','advanced')),
  status text not null default 'active' check (status in ('active','completed','abandoned')),
  billing text not null check (billing in ('credit','licence')),
  institution_id uuid,
  target_seconds integer,
  duration_seconds integer,
  script_text text,
  script_file_id uuid references public.presentation_files(id) on delete set null,
  slides_file_id uuid references public.presentation_files(id) on delete set null,
  ai_turns integer not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index practice_sessions_user_idx on public.practice_sessions (user_id, created_at desc);
grant select on public.practice_sessions to authenticated;
grant all on public.practice_sessions to service_role;
alter table public.practice_sessions enable row level security;
create policy "Users read own sessions" on public.practice_sessions for select to authenticated using (user_id = auth.uid());

create table public.session_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('user','assistant','system')),
  content text not null check (length(content) between 1 and 8000),
  translation text,
  source text not null default 'typed' check (source in ('typed','speech','ai')),
  recording_path text,
  created_at timestamptz not null default now()
);
create index session_messages_session_idx on public.session_messages (session_id, created_at);
grant select on public.session_messages to authenticated;
grant all on public.session_messages to service_role;
alter table public.session_messages enable row level security;
create policy "Users read own messages" on public.session_messages for select to authenticated using (user_id = auth.uid());

create table public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.practice_sessions(id) on delete cascade,
  user_id uuid not null,
  overall_score integer check (overall_score between 0 and 100),
  grammar integer check (grammar between 0 and 100),
  vocabulary integer check (vocabulary between 0 and 100),
  fluency integer check (fluency between 0 and 100),
  pronunciation integer check (pronunciation between 0 and 100),
  academic integer check (academic between 0 and 100),
  organisation integer check (organisation between 0 and 100),
  summary text not null,
  strengths jsonb not null default '[]',
  improvements jsonb not null default '[]',
  corrections jsonb not null default '[]',
  model text not null,
  created_at timestamptz not null default now()
);
grant select on public.feedback_reports to authenticated;
grant all on public.feedback_reports to service_role;
alter table public.feedback_reports enable row level security;
create policy "Users read own reports" on public.feedback_reports for select to authenticated using (user_id = auth.uid());

-- Starts a session: covered by a current institution licence, otherwise uses 1 credit. Atomic per user.
create or replace function public.start_practice_session(
  _type text, _scenario text, _topic text, _difficulty text, _target_seconds integer,
  _script_text text, _script_file_id uuid, _slides_file_id uuid
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _inst uuid;
  _id uuid;
begin
  if _uid is null then raise exception 'not_authenticated'; end if;
  perform pg_advisory_xact_lock(hashtext('credits:' || _uid::text));
  if _script_file_id is not null and not exists (select 1 from public.presentation_files where id = _script_file_id and user_id = _uid) then
    raise exception 'file_not_found';
  end if;
  if _slides_file_id is not null and not exists (select 1 from public.presentation_files where id = _slides_file_id and user_id = _uid) then
    raise exception 'file_not_found';
  end if;
  _inst := public.active_licence_for(_uid);
  insert into public.practice_sessions (user_id, type, scenario, topic, difficulty, billing, institution_id,
      target_seconds, script_text, script_file_id, slides_file_id)
    values (_uid, _type, _scenario, coalesce(_topic, ''), _difficulty,
      case when _inst is null then 'credit' else 'licence' end, _inst,
      _target_seconds, _script_text, _script_file_id, _slides_file_id)
    returning id into _id;
  if _inst is null then
    if public.credit_balance_of(_uid) < 1 then raise exception 'insufficient_credits'; end if;
    insert into public.credit_transactions (user_id, amount, reason, session_id) values (_uid, -1, 'session_usage', _id);
  end if;
  return _id;
end; $$;

-- ========== Group presentation rooms ==========
create table public.group_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  name text not null check (length(name) between 1 and 200),
  total_minutes integer not null default 20 check (total_minutes between 1 and 180),
  script text not null default '' check (length(script) <= 50000),
  sections jsonb not null default '[]',
  owner_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.group_room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.group_rooms(id) on delete cascade,
  user_id uuid not null,
  display_name text not null check (length(display_name) between 1 and 80),
  role text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  unique (room_id, user_id)
);
create index group_room_members_user_idx on public.group_room_members (user_id);

create or replace function public.is_room_member(_room_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.group_room_members where room_id = _room_id and user_id = _user_id)
$$;

grant select, delete on public.group_rooms to authenticated;
grant update (name, total_minutes, script, sections) on public.group_rooms to authenticated;
grant select, delete on public.group_room_members to authenticated;
grant all on public.group_rooms, public.group_room_members to service_role;
alter table public.group_rooms enable row level security;
alter table public.group_room_members enable row level security;
create policy "Members read room" on public.group_rooms for select to authenticated using (public.is_room_member(id, auth.uid()));
create policy "Members edit room plan" on public.group_rooms for update to authenticated
  using (public.is_room_member(id, auth.uid())) with check (public.is_room_member(id, auth.uid()));
create policy "Owner deletes room" on public.group_rooms for delete to authenticated using (owner_id = auth.uid());
create policy "Members see each other" on public.group_room_members for select to authenticated using (public.is_room_member(room_id, auth.uid()));
create policy "Leave room or owner removes member" on public.group_room_members for delete to authenticated
  using (
    (user_id = auth.uid() and role <> 'owner')
    or exists (select 1 from public.group_rooms r where r.id = room_id and r.owner_id = auth.uid() and group_room_members.role <> 'owner')
  );
create trigger group_rooms_updated_at before update on public.group_rooms for each row execute function public.set_updated_at();

create or replace function public.create_group_room(_name text, _total_minutes integer, _display_name text, _sections jsonb, _script text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _code text;
  _id uuid;
  _alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  _i int;
begin
  if _uid is null then raise exception 'not_authenticated'; end if;
  loop
    _code := '';
    for _i in 1..6 loop
      _code := _code || substr(_alphabet, 1 + floor(random() * length(_alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.group_rooms where code = _code);
  end loop;
  insert into public.group_rooms (code, name, total_minutes, owner_id, sections, script)
    values (_code, _name, _total_minutes, _uid, coalesce(_sections, '[]'::jsonb), coalesce(_script, ''))
    returning id into _id;
  insert into public.group_room_members (room_id, user_id, display_name, role) values (_id, _uid, _display_name, 'owner');
  return _id;
end; $$;

create or replace function public.join_group_room(_code text, _display_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _room uuid;
begin
  if _uid is null then raise exception 'not_authenticated'; end if;
  select id into _room from public.group_rooms where code = upper(regexp_replace(_code, '[\s-]', '', 'g'));
  if _room is null then raise exception 'room_not_found'; end if;
  if (select count(*) from public.group_room_members where room_id = _room) >= 12
     and not public.is_room_member(_room, _uid) then
    raise exception 'room_full';
  end if;
  insert into public.group_room_members (room_id, user_id, display_name)
    values (_room, _uid, _display_name) on conflict (room_id, user_id) do nothing;
  return _room;
end; $$;

-- ========== Signup: profile + 3 free credits ==========
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
    on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  insert into public.credit_transactions (user_id, amount, reason, note)
    values (new.id, 3, 'signup_bonus', 'Welcome credits');
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Lock down function execution to signed-in users only.
revoke execute on function public.start_practice_session(text, text, text, text, integer, text, uuid, uuid) from public, anon;
revoke execute on function public.redeem_institution_code(text) from public, anon;
revoke execute on function public.sync_my_institution_access() from public, anon;
revoke execute on function public.admin_add_institution_member(uuid, text) from public, anon;
revoke execute on function public.admin_create_institution_code(uuid, text, integer, timestamptz) from public, anon;
revoke execute on function public.admin_remove_institution_member(uuid, uuid) from public, anon;
revoke execute on function public.create_group_room(text, integer, text, jsonb, text) from public, anon;
revoke execute on function public.join_group_room(text, text) from public, anon;
revoke execute on function public.get_my_credit_balance() from public, anon;
revoke execute on function public.credit_balance_of(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
