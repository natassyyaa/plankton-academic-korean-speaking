import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, SectionCard } from "@/components/common/PageHeader";
import { SampleBadge } from "@/components/common/SampleBadge";
import { PracticeTypeIcon } from "@/components/practice/PracticeTypeIcon";
import { practiceTypeLabels, sampleHistory, type PracticeType } from "@/lib/sample-data";

export const Route = createFileRoute("/_platform/history")({
  head: () => ({
    meta: [
      { title: "Practice History — PLANKTON" },
      { name: "description", content: "Review your past speaking, presentation, Q&A and group practice sessions." },
      { property: "og:title", content: "Practice History — PLANKTON" },
      { property: "og:description", content: "All your academic Korean practice sessions in one place." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [filter, setFilter] = useState<PracticeType | "all">("all");
  const items = sampleHistory.filter((h) => filter === "all" || h.type === filter);
  const totalMin = items.reduce((s, h) => s + h.durationMin, 0);

  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Practice History"
        titleKo="연습 기록"
        description="Every session you complete will appear here with its feedback report."
        actions={<SampleBadge label="Sample sessions" />}
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as PracticeType | "all")}>
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-secondary p-1">
          <TabsTrigger value="all">All</TabsTrigger>
          {(Object.keys(practiceTypeLabels) as PracticeType[]).map((t) => (
            <TabsTrigger key={t} value={t}>{practiceTypeLabels[t]}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <SectionCard title={`${items.length} sessions · ${totalMin} minutes`}>
        <ul className="divide-y">
          {items.map((h) => (
            <li key={h.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3">
                <PracticeTypeIcon type={h.type} />
                <div className="min-w-0">
                  <p className="font-semibold">{h.title}</p>
                  <p className="font-kr text-sm text-muted-foreground">{h.titleKo}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground sm:w-auto">
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {practiceTypeLabels[h.type]}
                </span>
                <span className="tabular-nums">{h.date}</span>
                <span className="tabular-nums">{h.durationMin} min</span>
                <Button asChild variant="ghost" size="sm" className="ml-auto">
                  <Link to="/feedback">
                    Example report <ArrowRight />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
