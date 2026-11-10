import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, SectionCard } from "@/components/common/PageHeader";
import { PreviewNotice } from "@/components/common/SampleBadge";
import { LANGUAGES, useI18n, type LangCode } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_platform/settings")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — PLANKTON" },
      { name: "description", content: "Update your profile, Korean proficiency, interface language and learning goals." },
      { property: "og:title", content: "Profile & Settings — PLANKTON" },
      { property: "og:description", content: "Personalise your PLANKTON learning experience." },
    ],
  }),
  component: SettingsPage,
});

const LEVELS = [
  { value: "topik1", label: "TOPIK 1 · Beginner" },
  { value: "topik2", label: "TOPIK 2 · Beginner-High" },
  { value: "topik3", label: "TOPIK 3 · Intermediate" },
  { value: "topik4", label: "TOPIK 4 · Intermediate-High" },
  { value: "topik5", label: "TOPIK 5 · Advanced" },
  { value: "topik6", label: "TOPIK 6 · Advanced-High" },
  { value: "none", label: "No TOPIK yet" },
];

const GOALS = [
  { id: "discussion", label: "Speak up in seminars", ko: "수업 토론 참여" },
  { id: "presentation", label: "Give confident presentations", ko: "발표 자신감" },
  { id: "professor", label: "Communicate with professors", ko: "교수님과 소통" },
  { id: "thesis", label: "Prepare a thesis defence", ko: "논문 심사 준비" },
  { id: "group", label: "Lead group projects", ko: "조별 과제 리드" },
  { id: "pronunciation", label: "Improve pronunciation", ko: "발음 향상" },
];

type Profile = {
  name: string;
  university: string;
  major: string;
  level: string;
  goals: string[];
  weeklyMinutes: number;
};

const STORAGE_KEY = "plankton.profile";
const EMPTY: Profile = { name: "", university: "", major: "", level: "topik3", goals: [], weeklyMinutes: 120 };

function SettingsPage() {
  const { lang, setLang } = useI18n();
  const [profile, setProfile] = useState<Profile>(EMPTY);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* ignore malformed local data */
    }
  }, []);

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => setProfile((p) => ({ ...p, [key]: value }));

  const toggleGoal = (id: string) =>
    update("goals", profile.goals.includes(id) ? profile.goals.filter((g) => g !== id) : [...profile.goals, id]);

  const save = (e: FormEvent) => {
    e.preventDefault();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    toast.success("Saved on this device", { description: "Your settings will sync to your account once sign-in is added." });
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Profile & Settings"
        titleKo="프로필 및 설정"
        description="Tell us about yourself so practice can be tailored to you."
        actions={
          <Button type="submit" className="rounded-full bg-teal text-teal-foreground hover:bg-teal/90">
            <Save /> Save changes
          </Button>
        }
      />

      <PreviewNotice>Accounts aren't connected yet, so your settings are saved in this browser only.</PreviewNotice>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Profile information">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={profile.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input id="university" value={profile.university} onChange={(e) => update("university", e.target.value)} placeholder="e.g. Seoul National University" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="major">Major / programme</Label>
              <Input id="major" value={profile.major} onChange={(e) => update("major", e.target.value)} placeholder="e.g. Business Administration (MA)" className="h-11" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Language">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Korean proficiency</Label>
              <Select value={profile.level} onValueChange={(v) => update("level", v)}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preferred interface language</Label>
              <p className="text-xs text-muted-foreground">Menus and translations change instantly. Practice always stays in Korean.</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLang(l.code as LangCode)}
                    aria-pressed={lang === l.code}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                      lang === l.code ? "border-teal bg-accent font-semibold text-accent-foreground" : "hover:bg-muted",
                    )}
                  >
                    {l.label}
                    <span className="block text-xs font-normal text-muted-foreground">{l.english}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Learning goals" description="Pick everything you'd like to work on">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GOALS.map((g) => {
            const checked = profile.goals.includes(g.id);
            return (
              <label
                key={g.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                  checked ? "border-teal bg-accent" : "hover:bg-muted",
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleGoal(g.id)} />
                <span>
                  <span className="block text-sm font-semibold">{g.label}</span>
                  <span className="font-kr text-xs text-muted-foreground">{g.ko}</span>
                </span>
              </label>
            );
          })}
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <Label>Weekly practice goal</Label>
            <span className="text-sm font-semibold tabular-nums">{profile.weeklyMinutes} min</span>
          </div>
          <Slider
            value={[profile.weeklyMinutes]}
            min={30}
            max={420}
            step={15}
            onValueChange={([v]) => update("weeklyMinutes", v ?? 30)}
            aria-label="Weekly practice goal in minutes"
          />
        </div>
      </SectionCard>
    </form>
  );
}
