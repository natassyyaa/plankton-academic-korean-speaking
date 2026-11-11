import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isLicenceCurrent, isPlausibleInviteCode, normaliseInviteCode } from "@/lib/licence";

const profileSchema = z.object({
  full_name: z.string().trim().max(120),
  university: z.string().trim().max(160),
  major: z.string().trim().max(160),
  korean_level: z.enum(["topik1", "topik2", "topik3", "topik4", "topik5", "topik6", "none"]),
  interface_language: z.enum(["ko", "en", "zh", "vi", "id", "mn"]),
  learning_goals: z.array(z.string().max(40)).max(12),
  weekly_minutes: z.number().int().min(0).max(1440),
});
export type ProfileInput = z.infer<typeof profileSchema>;

/** Profile, credit balance, university licence and recent credit history for the signed-in student. */
export const getAccountSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    // Pick up university access granted by email domain or by an admin invite.
    const sync = await supabase.rpc("sync_my_institution_access");
    if (sync.error) console.error("[account] licence sync failed", sync.error.message);

    const [profile, balance, memberships, history] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.rpc("get_my_credit_balance"),
      supabase
        .from("institution_members")
        .select("role, joined_via, created_at, institutions(id, name, active, licence_starts_at, licence_ends_at)")
        .eq("user_id", userId),
      supabase
        .from("credit_transactions")
        .select("id, amount, reason, created_at, note")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    for (const r of [profile, balance, memberships, history]) if (r.error) throw new Error(r.error.message);

    const licences = (memberships.data ?? [])
      .filter((m) => m.institutions)
      .map((m) => ({
        institutionId: m.institutions!.id,
        name: m.institutions!.name,
        role: m.role,
        joinedVia: m.joined_via,
        endsAt: m.institutions!.licence_ends_at,
        current: isLicenceCurrent(m.institutions!),
      }));

    return {
      email: (claims as { email?: string }).email ?? "",
      profile: profile.data,
      credits: balance.data ?? 0,
      licences,
      activeLicence: licences.find((l) => l.current) ?? null,
      creditHistory: history.data ?? [],
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ProfileInput) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const redeemLicenceCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => {
    const code = normaliseInviteCode(String(input?.code ?? ""));
    if (!isPlausibleInviteCode(code)) throw new Error("invalid_code");
    return { code };
  })
  .handler(async ({ data, context }) => {
    const { data: institutionId, error } = await context.supabase.rpc("redeem_institution_code", { _code: data.code });
    if (error) throw new Error(error.message);
    return { institutionId };
  });
