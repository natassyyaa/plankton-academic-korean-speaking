import { Link, createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ArrowRight,
  BookOpenText,
  CalendarCheck,
  Flame,
  GraduationCap,
  MessagesSquare,
  Presentation,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader, SectionCard } from "@/components/common/PageHeader";
import { SampleBadge } from "@/components/common/SampleBadge";
import { PracticeTypeIcon } from "@/components/practice/PracticeTypeIcon";
import {
  practiceTypeLabels,
  sampleHistory,
  sampleSkillScores,
  sampleUser,
  sampleWeeklyActivity,
  skillLabels,
  type SkillKey,
} from "@/lib/sample-data";

export const Route = createFileRoute("/_platform/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PLANKTON" },
      { name: "description", content: "Your academic Korean speaking progress, streak and recent practice at a glance." },
      { property: "og:title", content: "Dashboard — PLANKTON" },
      { property: "og:description", content: "Track your academic Korean speaking practice and progress." },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  { to: "/speaking", label: "Start a conversation", ko: "대화 연습", icon: MessagesSquare },
  { to: "/presentation", label: "Rehearse a presentation", ko: "발표 리허설", icon: Presentation },
  { to: "/qna", label: "Practise professor Q&A", ko: "질의응답", icon: GraduationCap },
  { to: "/group", label: "Open a group room", ko: "조별 발표", icon: Users },
] as const;

function Dashboard() {
  const weeklyTotal = sampleWeeklyActivity.reduce((sum, d) => sum + d.minutes, 0);
  const goalPct = Math.min(100, Math.round((weeklyTotal / sampleUser.weeklyGoalMinutes) * 100));

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`안녕하세요, ${sampleUser.name}!`}
        description="Welcome back. Here's an overview of your academic Korean speaking practice."
        actions={<SampleBadge label="All figures are sample data" />}
      />

      {/* Top row: profile + stats */}
      <div className="grid gap-5 lg:grid-cols-[1.1fr_2fr]">
        <section className="relative flex flex-col overflow-hidden rounded-2xl bg-ocean p-6 text-navy-foreground shadow-elegant">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-navy-foreground/15 font-display text-xl font-bold">
              {sampleUser.initials}
            </div>
            <div>
              <p className="text-lg font-semibold">{sampleUser.name}</p>
              <p className="text-sm text-navy-foreground/75">{sampleUser.university}</p>
              <p className="text-sm text-navy-foreground/75">{sampleUser.major}</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-navy-foreground/10 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-navy-foreground/75">Korean proficiency</span>
              <span className="font-semibold">{sampleUser.level}</span>
            </div>
            <p className="mt-0.5 text-xs text-navy-foreground/70">{sampleUser.levelLabel} · {sampleUser.levelProgress}% to next level</p>
            <Progress value={sampleUser.levelProgress} className="mt-3 h-2 bg-navy-foreground/20 [&>div]:bg-teal" />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-navy-foreground/10 p-3">
              <dt className="text-xs text-navy-foreground/70">Semester</dt>
              <dd className="font-semibold">{sampleUser.semester}</dd>
            </div>
            <div className="rounded-xl bg-navy-foreground/10 p-3">
              <dt className="text-xs text-navy-foreground/70">Native language</dt>
              <dd className="font-semibold">{sampleUser.nativeLanguage}</dd>
            </div>
            <div className="col-span-2 rounded-xl bg-navy-foreground/10 p-3">
              <dt className="text-xs text-navy-foreground/70">This week</dt>
              <dd className="font-semibold">{sampleUser.minutesThisWeek} minutes of speaking practice</dd>
            </div>
          </dl>
          <Button asChild variant="secondary" size="sm" className="mt-5 w-fit rounded-full lg:mt-auto">
            <Link to="/settings">Edit profile</Link>
          </Button>
        </section>

        <div className="grid gap-5 sm:grid-cols-3">
          <StatCard icon={CalendarCheck} label="Total practice sessions" value={String(sampleUser.totalSessions)} sub="since September" />
          <StatCard icon={Flame} label="Practice streak" value={`${sampleUser.streakDays} days`} sub="keep it going!" accent />
          <StatCard icon={Trophy} label="Weekly goal" value={`${goalPct}%`} sub={`${weeklyTotal} / ${sampleUser.weeklyGoalMinutes} min`}>
            <Progress value={goalPct} className="mt-3 h-1.5" />
          </StatCard>

          <SectionCard
            className="sm:col-span-3"
            title="Weekly practice activity"
            description="Minutes practised per day"
            action={<SampleBadge />}
          >
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sampleWeeklyActivity} margin={{ left: -20, right: 8, top: 4 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }}
                    formatter={(v: number) => [`${v} min`, "Practice"]}
                  />
                  <Bar dataKey="minutes" fill="var(--teal)" radius={[8, 8, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="group flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-teal/50 hover:shadow-elegant"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-teal group-hover:text-teal-foreground">
              <a.icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{a.label}</p>
              <p className="font-kr text-xs text-muted-foreground">{a.ko}</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <SectionCard
          title="Progress report"
          description="Skill areas from your latest feedback"
          action={<SampleBadge />}
        >
          <div className="space-y-4">
            {(Object.keys(sampleSkillScores) as SkillKey[]).map((k) => (
              <div key={k}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {skillLabels[k].en}
                    <span className="ml-1.5 font-kr text-xs text-muted-foreground">{skillLabels[k].ko}</span>
                  </span>
                  <span className="font-semibold text-muted-foreground">{sampleSkillScores[k]}</span>
                </div>
                <Progress value={sampleSkillScores[k]} className="h-2" />
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-6 w-full rounded-full">
            <Link to="/feedback">Open example feedback report</Link>
          </Button>
        </SectionCard>

        <SectionCard
          title="Recent practice history"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/history">
                See all <ArrowRight />
              </Link>
            </Button>
          }
        >
          <div className="mb-3">
            <SampleBadge />
          </div>
          <ul className="divide-y">
            {sampleHistory.slice(0, 5).map((h) => (
              <li key={h.id} className="flex items-center gap-3 py-3">
                <PracticeTypeIcon type={h.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{h.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {practiceTypeLabels[h.type]} · {h.date} · {h.durationMin} min
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="shrink-0">
                  <Link to="/feedback">Report</Link>
                </Button>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <Link
        to="/expressions"
        className="flex flex-col items-start gap-4 rounded-2xl border bg-tide p-6 shadow-soft sm:flex-row sm:items-center"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <BookOpenText className="size-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Expression of the day</p>
          <p className="mt-1 font-kr text-lg font-semibold">결론부터 말씀드리면…</p>
          <p className="text-sm text-muted-foreground">"To start with the conclusion…" — great for answering professors clearly.</p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Browse library <ArrowRight className="size-4" />
        </span>
      </Link>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  children,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className={`flex size-10 items-center justify-center rounded-xl ${accent ? "bg-teal-gradient text-teal-foreground" : "bg-sky text-sky-foreground"}`}>
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
      {children}
    </div>
  );
}
