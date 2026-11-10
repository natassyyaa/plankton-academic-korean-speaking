import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, DoorOpen, LogOut, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, SectionCard } from "@/components/common/PageHeader";
import { PreviewNotice, SampleBadge } from "@/components/common/SampleBadge";
import { defaultPresentationSections, sampleGroupMembers } from "@/lib/sample-data";
import { generateRoomCode, isValidRoomCode, normaliseRoomCode } from "@/lib/room-code";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_platform/group")({
  head: () => ({
    meta: [
      { title: "Group Presentation — PLANKTON" },
      { name: "description", content: "Create or join a group presentation room, assign speaking sections and plan time together." },
      { property: "og:title", content: "Group Presentation — PLANKTON" },
      { property: "og:description", content: "Plan and rehearse group presentations in Korean." },
    ],
  }),
  component: GroupPage,
});

type Room = { code: string; name: string; totalMin: number; source: "created" | "joined" };

function GroupPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [name, setName] = useState("");
  const [totalMin, setTotalMin] = useState("20");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const create = () => {
    setRoom({ code: generateRoomCode(), name: name.trim() || "Untitled group presentation", totalMin: Number(totalMin), source: "created" });
  };

  const join = () => {
    const c = normaliseRoomCode(code);
    if (!isValidRoomCode(c)) {
      setCodeError("Room codes have 6 letters or numbers, e.g. K7PL2Q.");
      return;
    }
    setCodeError("");
    setRoom({ code: c, name: "Sample group room", totalMin: 20, source: "joined" });
  };

  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="Group Presentation"
        titleKo="조별 발표"
        description="Plan who says what, share the script and balance speaking time."
      />

      {!room ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <SectionCard>
            <Tabs defaultValue="create">
              <TabsList className="mb-5 grid w-full grid-cols-2">
                <TabsTrigger value="create"><Plus className="mr-1.5 size-4" /> Create room</TabsTrigger>
                <TabsTrigger value="join"><DoorOpen className="mr-1.5 size-4" /> Join with code</TabsTrigger>
              </TabsList>
              <TabsContent value="create" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name">Presentation title</Label>
                  <Input id="room-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 마케팅원론 기말 발표" className="h-11 font-kr" />
                </div>
                <div className="space-y-2">
                  <Label>Total presentation time</Label>
                  <Select value={totalMin} onValueChange={setTotalMin}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["10", "15", "20", "30"].map((m) => (
                        <SelectItem key={m} value={m}>{m} minutes</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={create} className="h-11 w-full rounded-full bg-teal text-teal-foreground hover:bg-teal/90">
                  Create room
                </Button>
              </TabsContent>
              <TabsContent value="join" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-code">Room code</Label>
                  <Input
                    id="room-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="K7PL2Q"
                    maxLength={8}
                    className="h-12 text-center font-display text-xl uppercase tracking-[0.4em]"
                    aria-invalid={!!codeError}
                  />
                  {codeError && <p className="text-sm text-destructive">{codeError}</p>}
                </div>
                <Button onClick={join} className="h-11 w-full rounded-full">
                  Join room
                </Button>
              </TabsContent>
            </Tabs>
          </SectionCard>
          <div className="space-y-4">
            <div className="rounded-2xl bg-ocean p-6 text-navy-foreground shadow-elegant">
              <Users className="size-8 text-teal" />
              <h2 className="mt-4 text-xl font-bold">Rehearse as a team</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-navy-foreground/80">
                <li>• Assign each section to a speaker</li>
                <li>• Write the script together</li>
                <li>• Split the time fairly before the big day</li>
              </ul>
            </div>
            <PreviewNotice>
              Rooms are a local preview: they live only in your browser, and other students can't
              join until accounts and real-time sync are connected.
            </PreviewNotice>
          </div>
        </div>
      ) : (
        <RoomView room={room} onLeave={() => setRoom(null)} />
      )}
    </>
  );
}

function RoomView({ room, onLeave }: { room: Room; onLeave: () => void }) {
  const [assignments, setAssignments] = useState<Record<string, string>>(() =>
    Object.fromEntries(defaultPresentationSections.map((s, i) => [s.id, sampleGroupMembers[i % sampleGroupMembers.length]!.id])),
  );
  const [minutes, setMinutes] = useState<Record<string, number>>(() =>
    Object.fromEntries(defaultPresentationSections.map((s) => [s.id, Math.round(room.totalMin / defaultPresentationSections.length)])),
  );
  const [script, setScript] = useState("[서론]\n안녕하십니까. 저희 조는 …에 대해 발표하겠습니다.\n\n[연구 배경]\n\n[연구 결과]\n\n[결론 및 질의응답]\n");

  const allocated = Object.values(minutes).reduce((a, b) => a + b, 0);
  const diff = room.totalMin - allocated;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      toast.success("Room code copied");
    } catch {
      toast.error("Couldn't copy — please copy the code manually");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-soft md:flex-row md:items-center">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">
            {room.source === "created" ? "Your room · local preview" : "Joined room · sample content"}
          </p>
          <h2 className="font-kr text-xl font-bold">{room.name}</h2>
          <p className="text-sm text-muted-foreground">{room.totalMin} minute presentation</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-secondary px-4 py-2 font-display text-lg font-bold tracking-[0.3em]">{room.code}</div>
          <Button variant="outline" size="icon" onClick={copyCode} aria-label="Copy room code"><Copy /></Button>
          <Button variant="ghost" onClick={onLeave}><LogOut /> Leave</Button>
        </div>
      </div>

      <SectionCard title="Group members" action={<SampleBadge label="Sample members" />}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sampleGroupMembers.map((m, i) => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border p-3">
              <div className={cn("flex size-11 items-center justify-center rounded-full text-sm font-bold", i === 0 ? "bg-teal-gradient text-teal-foreground" : "bg-sky text-sky-foreground")}>
                {m.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.role} · {m.country}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <SectionCard
          title="Speaking sections & time allocation"
          description="Assign a speaker and minutes to each part"
        >
          <div className="space-y-5">
            {defaultPresentationSections.map((s) => (
              <div key={s.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold">
                    {s.title} <span className="ml-1 font-kr text-sm font-normal text-muted-foreground">{s.titleKo}</span>
                  </p>
                  <Select value={assignments[s.id] ?? ""} onValueChange={(v) => setAssignments((a) => ({ ...a, [s.id]: v }))}>
                    <SelectTrigger className="h-9 w-44" aria-label={`Speaker for ${s.title}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sampleGroupMembers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Slider
                    value={[minutes[s.id] ?? 0]}
                    min={0}
                    max={room.totalMin}
                    step={1}
                    onValueChange={([v]) => setMinutes((m) => ({ ...m, [s.id]: v ?? 0 }))}
                    aria-label={`Minutes for ${s.title}`}
                    className="flex-1"
                  />
                  <span className="w-14 text-right text-sm font-semibold tabular-nums">{minutes[s.id]} min</span>
                </div>
              </div>
            ))}
          </div>
          <div
            className={cn(
              "mt-5 rounded-xl px-4 py-3 text-sm font-medium",
              diff === 0 ? "bg-accent text-accent-foreground" : "bg-warning text-warning-foreground",
            )}
          >
            {allocated} of {room.totalMin} minutes allocated
            {diff > 0 && ` · ${diff} min left to assign`}
            {diff < 0 && ` · ${-diff} min over the limit`}
            {diff === 0 && " · perfectly balanced"}
          </div>
        </SectionCard>

        <SectionCard title="Shared script" description="Edits stay on this device until real-time sync is added">
          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={18}
            className="font-kr leading-relaxed"
            aria-label="Shared script"
          />
        </SectionCard>
      </div>
    </>
  );
}
