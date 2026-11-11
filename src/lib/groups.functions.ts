import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { defaultPresentationSections } from "@/lib/sample-data";
import { isValidRoomCode, normaliseRoomCode } from "@/lib/room-code";

export type RoomSection = { id: string; title: string; titleKo: string; assigneeUserId: string | null; minutes: number };

const DEFAULT_SCRIPT = "[서론]\n안녕하십니까. 저희 조는 …에 대해 발표하겠습니다.\n\n[연구 배경]\n\n[연구 결과]\n\n[결론 및 질의응답]\n";

const displayName = z.string().trim().min(1).max(80);

async function myDisplayName(supabase: any, userId: string, email?: string) {
  const { data } = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle();
  return (data?.full_name?.trim() || email?.split("@")[0] || "Student").slice(0, 80);
}

export const createGroupRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; totalMinutes: number }) =>
    z.object({ name: z.string().trim().max(200), totalMinutes: z.number().int().min(1).max(180) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const name = data.name || "Untitled group presentation";
    const per = Math.max(1, Math.round(data.totalMinutes / defaultPresentationSections.length));
    const sections: RoomSection[] = defaultPresentationSections.map((s) => ({
      id: s.id,
      title: s.title,
      titleKo: s.titleKo,
      assigneeUserId: context.userId,
      minutes: per,
    }));
    const me = await myDisplayName(context.supabase, context.userId, (context.claims as { email?: string }).email);
    const { data: roomId, error } = await context.supabase.rpc("create_group_room", {
      _name: name,
      _total_minutes: data.totalMinutes,
      _display_name: displayName.parse(me),
      _sections: sections,
      _script: DEFAULT_SCRIPT,
    } as never);
    if (error) throw new Error(error.message);
    return { roomId: roomId as unknown as string };
  });

export const joinGroupRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => {
    const code = normaliseRoomCode(String(input?.code ?? ""));
    if (!isValidRoomCode(code)) throw new Error("room_not_found");
    return { code };
  })
  .handler(async ({ data, context }) => {
    const me = await myDisplayName(context.supabase, context.userId, (context.claims as { email?: string }).email);
    const { data: roomId, error } = await context.supabase.rpc("join_group_room", { _code: data.code, _display_name: me });
    if (error) throw new Error(error.message);
    return { roomId: roomId as unknown as string };
  });

export const listMyGroupRooms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("group_room_members")
      .select("role, group_rooms(id, code, name, total_minutes, updated_at)")
      .eq("user_id", context.userId)
      .order("joined_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).filter((r) => r.group_rooms).map((r) => ({ ...r.group_rooms!, role: r.role }));
  });

export const getGroupRoom = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { roomId: string }) => z.object({ roomId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const [room, members] = await Promise.all([
      context.supabase.from("group_rooms").select("*").eq("id", data.roomId).maybeSingle(),
      context.supabase.from("group_room_members").select("id, user_id, display_name, role, joined_at").eq("room_id", data.roomId).order("joined_at"),
    ]);
    if (room.error) throw new Error(room.error.message);
    if (!room.data) throw new Error("room_not_found");
    return {
      room: { ...room.data, sections: (room.data.sections ?? []) as unknown as RoomSection[] },
      members: members.data ?? [],
      myUserId: context.userId,
    };
  });

const sectionSchema = z.object({
  id: z.string().max(20),
  title: z.string().max(120),
  titleKo: z.string().max(120),
  assigneeUserId: z.string().uuid().nullable(),
  minutes: z.number().int().min(0).max(180),
});

export const updateGroupRoomPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { roomId: string; sections?: RoomSection[]; script?: string }) =>
    z
      .object({
        roomId: z.string().uuid(),
        sections: z.array(sectionSchema).max(20).optional(),
        script: z.string().max(50000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch: { sections?: RoomSection[]; script?: string } = {};
    if (data.sections) patch.sections = data.sections;
    if (data.script !== undefined) patch.script = data.script;
    if (!Object.keys(patch).length) return { ok: true };
    const { data: rows, error } = await context.supabase
      .from("group_rooms")
      .update(patch as never)
      .eq("id", data.roomId)
      .select("id");
    if (error) throw new Error(error.message);
    if (!rows?.length) throw new Error("forbidden");
    return { ok: true };
  });

/** Leaves a room. When the owner leaves, the room is deleted for everyone. */
export const leaveGroupRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { roomId: string }) => z.object({ roomId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: room } = await context.supabase.from("group_rooms").select("owner_id").eq("id", data.roomId).maybeSingle();
    if (!room) throw new Error("room_not_found");
    const res =
      room.owner_id === context.userId
        ? await context.supabase.from("group_rooms").delete().eq("id", data.roomId)
        : await context.supabase.from("group_room_members").delete().eq("room_id", data.roomId).eq("user_id", context.userId);
    if (res.error) throw new Error(res.error.message);
    return { deleted: room.owner_id === context.userId };
  });

export const removeGroupMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { roomId: string; memberId: string }) =>
    z.object({ roomId: z.string().uuid(), memberId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("group_room_members")
      .delete()
      .eq("room_id", data.roomId)
      .eq("id", data.memberId)
      .select("id");
    if (error) throw new Error(error.message);
    if (!rows?.length) throw new Error("forbidden");
    return { ok: true };
  });
