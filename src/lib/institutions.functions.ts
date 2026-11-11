/**
 * University (B2B) licence administration. Callable by institution admins and
 * platform admins only — every database function re-checks the caller's role.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normaliseInviteCode } from "@/lib/licence";

const idSchema = z.object({ institutionId: z.string().uuid() });

export const listInstitutionMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { institutionId: string }) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [members, invites, codes] = await Promise.all([
      supabase.from("institution_members").select("user_id, role, joined_via, created_at").eq("institution_id", data.institutionId),
      supabase.from("institution_pending_invites").select("email, created_at").eq("institution_id", data.institutionId),
      supabase.from("institution_invite_codes").select("code, uses, max_uses, expires_at, active").eq("institution_id", data.institutionId),
    ]);
    for (const r of [members, invites, codes]) if (r.error) throw new Error(r.error.message);
    return { members: members.data ?? [], pendingInvites: invites.data ?? [], inviteCodes: codes.data ?? [] };
  });

export const addInstitutionMemberByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { institutionId: string; email: string }) =>
    idSchema.extend({ email: z.string().trim().toLowerCase().email().max(254) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.rpc("admin_add_institution_member", {
      _institution_id: data.institutionId,
      _email: data.email,
    });
    if (error) throw new Error(error.message);
    return { result: result as "added" | "invited" | "already_member" };
  });

export const createInstitutionInviteCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { institutionId: string; code: string; maxUses?: number | null; expiresAt?: string | null }) =>
    idSchema
      .extend({
        code: z.string().transform(normaliseInviteCode).pipe(z.string().regex(/^[A-Z0-9]{6,32}$/)),
        maxUses: z.number().int().positive().nullable().optional(),
        expiresAt: z.string().datetime().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: id, error } = await context.supabase.rpc("admin_create_institution_code", {
      _institution_id: data.institutionId,
      _code: data.code,
      _max_uses: data.maxUses ?? null,
      _expires_at: data.expiresAt ?? null,
    } as never);
    if (error) throw new Error(error.message);
    return { id };
  });

export const removeInstitutionMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { institutionId: string; userId: string }) => idSchema.extend({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("admin_remove_institution_member", {
      _institution_id: data.institutionId,
      _user_id: data.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
