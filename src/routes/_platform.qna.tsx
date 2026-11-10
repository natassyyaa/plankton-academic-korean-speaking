import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, GraduationCap, Mic, RotateCcw, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeader, SectionCard } from "@/components/common/PageHeader";
import { PreviewNotice, SampleBadge } from "@/components/common/SampleBadge";
import { sampleProfessorQuestions, type Difficulty } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_platform/qna")({
  head: () => ({
    meta: [
      { title: "Professor Q&A — PLANKTON" },
      { name: "description", content: "Practise answering a professor's follow-up questions about your presentation in Korean." },
      { property: "og:title", content: "Professor Q&A — PLANKTON" },
      { property: "og:description", content: "Simulate professor questions at basic, intermediate or advanced difficulty." },
    ],
  }),
  component: QnaPage,
});

const difficulties: { id: Difficulty; label: string; ko: string; text: string }[] = [
  { id: "basic", label: "Basic", ko: "기초", text: "Clarifying and summary questions" },
  { id: "intermediate", label: "Intermediate", ko: "중급", text: "Method, reasoning and limitations" },
  { id: "advanced", label: "Advanced", ko: "고급", text: "Thesis-defence style challenges" },
];

type Turn = { q: { ko: string; en: string }; answer?: string };

function QnaPage() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [turns, setTurns] = useState<Turn[] | null>(null);
  const [answer, setAnswer] = useState("");

  const questions = sampleProfessorQuestions[difficulty];
  const currentIndex = turns ? turns.findIndex((t) => !t.answer) : -1;
  const finished = turns !== null && currentIndex === -1;

  const start = () => setTurns([{ q: questions[0]! }]);
  const reset = () => {
    setTurns(null);
    setAnswer("");
  };

  const submit = () => {
    if (!turns || !answer.trim()) return;
    const next = turns.map((t, i) => (i === currentIndex ? { ...t, answer: answer.trim() } : t));
    if (next.length < questions.length) next.push({ q: questions[next.length]! });
    setTurns(next);
    setAnswer("");
  };

  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="Professor Q&A"
        titleKo="교수님 질의응답"
        description="Prepare for the questions that come after your presentation."
      />

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="space-y-5">
          <SectionCard title="Presentation topic">
            <Label htmlFor="qna-topic" className="sr-only">Presentation topic</Label>
            <Input
              id="qna-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 소비자 행동 연구"
              className="h-11 font-kr"
              disabled={turns !== null}
            />
          </SectionCard>

          <SectionCard title="Question difficulty">
            <div className="space-y-2" role="radiogroup" aria-label="Question difficulty">
              {difficulties.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="radio"
                  aria-checked={difficulty === d.id}
                  disabled={turns !== null}
                  onClick={() => setDifficulty(d.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    difficulty === d.id ? "border-teal bg-accent" : "hover:bg-muted",
                  )}
                >
                  <span className={cn("size-4 rounded-full border-2", difficulty === d.id ? "border-teal bg-teal" : "border-input")} />
                  <span className="flex-1">
                    <span className="text-sm font-semibold">{d.label}</span>
                    <span className="ml-1.5 font-kr text-xs text-muted-foreground">{d.ko}</span>
                    <span className="block text-xs text-muted-foreground">{d.text}</span>
                  </span>
                </button>
              ))}
            </div>
            {turns === null ? (
              <Button onClick={start} className="mt-5 h-11 w-full rounded-full bg-teal text-teal-foreground hover:bg-teal/90">
                Start Q&A session
              </Button>
            ) : (
              <Button variant="outline" onClick={reset} className="mt-5 h-11 w-full rounded-full">
                <RotateCcw /> New session
              </Button>
            )}
          </SectionCard>

          <PreviewNotice>
            Questions are a fixed sample set — not generated from your topic yet. Your answers stay
            in this browser and are not evaluated.
          </PreviewNotice>
        </div>

        <div className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border bg-card shadow-soft">
          <div className="flex items-center gap-3 border-b bg-tide px-5 py-3.5">
            <div className="flex size-10 items-center justify-center rounded-full bg-ocean text-navy-foreground">
              <GraduationCap className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Professor Park</p>
              <p className="text-xs text-muted-foreground">AI professor · sample persona</p>
            </div>
            {turns && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                {Math.min(turns.filter((t) => t.answer).length + (finished ? 0 : 1), questions.length)} / {questions.length}
              </span>
            )}
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 md:px-6">
            {turns === null ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-sky text-sky-foreground">
                  <GraduationCap className="size-7" />
                </div>
                <p className="font-semibold">Ready when you are</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Enter your topic, choose a difficulty and start the session. The professor will ask
                  one question at a time.
                </p>
              </div>
            ) : (
              <>
                {topic && (
                  <p className="mx-auto w-fit rounded-full border border-dashed px-3 py-1 font-kr text-xs text-muted-foreground">
                    주제: {topic}
                  </p>
                )}
                {turns.map((t, i) => (
                  <div key={i} className="space-y-3">
                    <div className="max-w-[85%] space-y-1">
                      <SampleBadge label="Sample question" />
                      <div className="rounded-2xl rounded-bl-md bg-secondary px-4 py-2.5 font-kr text-[15px] text-secondary-foreground">
                        {t.q.ko}
                      </div>
                      <p className="px-1 text-xs text-muted-foreground">{t.q.en}</p>
                    </div>
                    {t.answer && (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 font-kr text-[15px] text-primary-foreground">
                          {t.answer}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {finished && (
                  <div className="rounded-2xl border border-dashed border-teal/50 bg-accent/60 p-5 text-center">
                    <p className="font-semibold text-accent-foreground">Session complete</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Real feedback on your answers will be available once AI is connected. Meanwhile,
                      see how a report will look.
                    </p>
                    <Button asChild variant="outline" className="mt-4 rounded-full">
                      <Link to="/feedback">
                        View example report <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t p-4">
            <Label htmlFor="answer" className="mb-2 block text-sm font-medium">Your answer</Label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              disabled={turns === null || finished}
              placeholder="결론부터 말씀드리면… (Start with your conclusion)"
              className="resize-none font-kr"
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button variant="outline" disabled className="rounded-full">
                      <Mic /> Answer by voice
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Voice answers are coming soon</TooltipContent>
              </Tooltip>
              <Button
                onClick={submit}
                disabled={turns === null || finished || !answer.trim()}
                className="rounded-full bg-teal text-teal-foreground hover:bg-teal/90"
              >
                Submit answer <SendHorizontal />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
