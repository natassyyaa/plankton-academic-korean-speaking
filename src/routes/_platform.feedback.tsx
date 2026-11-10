import { Link, createFileRoute } from "@tanstack/react-router";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader, SectionCard } from "@/components/common/PageHeader";
import { PreviewNotice, SampleBadge } from "@/components/common/SampleBadge";
import { sampleFeedbackReport, skillLabels, type SkillKey } from "@/lib/sample-data";

export const Route = createFileRoute("/_platform/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback Report — PLANKTON" },
      { name: "description", content: "See feedback on grammar, vocabulary, fluency, pronunciation, academic expressions and answer organisation." },
      { property: "og:title", content: "Feedback Report — PLANKTON" },
      { property: "og:description", content: "Personalised feedback on your academic Korean speaking." },
    ],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const r = sampleFeedbackReport;
  const keys = Object.keys(r.scores) as SkillKey[];
  const radarData = keys.map((k) => ({ skill: skillLabels[k].en, score: r.scores[k] }));
  const avg = Math.round(keys.reduce((s, k) => s + r.scores[k], 0) / keys.length);

  return (
    <>
      <PageHeader
        eyebrow="Feedback report"
        title={r.sessionTitle}
        titleKo={r.sessionTitleKo}
        description={`Professor Q&A · ${r.date}`}
        actions={<SampleBadge label="Example report" />}
      />

      <PreviewNotice>
        This is an <strong>example report</strong> to show the layout. The scores and comments are
        sample content, not an assessment of your speaking.
      </PreviewNotice>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <SectionCard title="Overview">
          <div className="flex items-center gap-5">
            <div className="flex size-24 flex-col items-center justify-center rounded-3xl bg-ocean text-navy-foreground shadow-elegant">
              <span className="font-display text-3xl font-bold">{avg}</span>
              <span className="text-[11px] text-navy-foreground/75">sample avg.</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A balanced profile with a clear area to work on: <strong className="text-foreground">academic expressions</strong>.
            </p>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Radar dataKey="score" stroke="var(--teal)" fill="var(--teal)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <div className="grid gap-4 sm:grid-cols-2">
          {keys.map((k) => (
            <div key={k} className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">
                  {skillLabels[k].en}
                  <span className="ml-1.5 font-kr text-xs font-normal text-muted-foreground">{skillLabels[k].ko}</span>
                </p>
                <span className="font-display text-xl font-bold text-primary">{r.scores[k]}</span>
              </div>
              <Progress value={r.scores[k]} className="mt-2 h-1.5" />
              <p className="mt-3 text-sm text-muted-foreground">{r.details[k]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        <SectionCard title="Strengths">
          <ul className="space-y-3">
            {r.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                {s}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Improvement suggestions">
          <div className="space-y-4">
            {r.improvements.map((imp) => (
              <div key={imp.tip} className="rounded-xl border bg-muted/40 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="size-4 text-teal" /> {imp.tip}
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="rounded-lg bg-destructive/5 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-destructive">Before</p>
                    <p className="mt-1 font-kr text-sm">{imp.before}</p>
                  </div>
                  <div className="rounded-lg bg-accent p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">Try instead</p>
                    <p className="mt-1 font-kr text-sm">{imp.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="rounded-full bg-teal text-teal-foreground hover:bg-teal/90">
          <Link to="/qna">
            Practise Q&A again <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/expressions">Study academic expressions</Link>
        </Button>
      </div>
    </>
  );
}
