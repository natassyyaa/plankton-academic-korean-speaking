-- Students may add their own typed/spoken lines to their own active sessions. AI lines are written by the server only.
grant insert on public.session_messages to authenticated;
create policy "Users add own lines to own active sessions" on public.session_messages for insert to authenticated
  with check (
    user_id = auth.uid()
    and role = 'user'
    and source in ('typed', 'speech')
    and (recording_path is null or recording_path like auth.uid()::text || '/' || session_id::text || '/%')
    and exists (
      select 1 from public.practice_sessions s
      where s.id = session_id and s.user_id = auth.uid() and s.status = 'active'
    )
  );

-- Live updates for group rooms (RLS still limits rows to room members).
alter publication supabase_realtime add table public.group_rooms;
alter publication supabase_realtime add table public.group_room_members;
