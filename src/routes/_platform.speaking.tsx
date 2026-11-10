import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookUser, Check, Lightbulb, MessageCircle, RotateCcw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard } from "@/components/common/PageHeader";
import { PreviewNotice, SampleBadge } from "@/components/common/SampleBadge";
import { AI_PLACEHOLDER_TEXT, ChatPanel, newId, type ChatMessage } from "@/components/practice/ChatPanel";
import { speakingScenarios, type ScenarioId } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_platform/speaking")({
  head: () => ({
    meta: [
      { title: "Academic Speaking — PLANKTON" },
      { name: "description", content: "Practise classroom discussions, professor communication, group projects and expressing opinions in Korean." },
      { property: "og:title", content: "Academic Speaking — PLANKTON" },
      { property: "og:description", content: "Role-play academic conversations in Korean with an AI professor or classmate." },
    ],
  }),
  component: SpeakingPage,
});

const scenarioIcons: Record<ScenarioId, typeof Users> = {
  classroom: MessageCircle,
  professor: BookUser,
  group: Users,
  opinion: Lightbulb,
};

function openingFor(id: ScenarioId): ChatMessage[] {
  const s = speakingScenarios.find((x) => x.id === id)!;
  return [
    { id: newId(), from: "system", text: `Scenario: ${s.title} (${s.titleKo})` },
    { id: newId(), from: "ai", text: s.opening, translation: s.openingEn, tag: "Sample opening line" },
  ];
}

function SpeakingPage() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("professor");
  const [messages, setMessages] = useState<ChatMessage[]>(() => openingFor("professor"));
  const scenario = speakingScenarios.find((s) => s.id === scenarioId)!;
  const userTurns = messages.filter((m) => m.from === "user");

  const choose = (id: ScenarioId) => {
    setScenarioId(id);
    setMessages(openingFor(id));
  };

  const send = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: newId(), from: "user", text },
      { id: newId(), from: "system", text: AI_PLACEHOLDER_TEXT },
    ]);
  };

  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="Academic Speaking"
        titleKo="학술 말하기"
        description="Choose a scenario and practise a real academic conversation in Korean."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {speakingScenarios.map((s) => {
          const Icon = scenarioIcons[s.id];
          const active = s.id === scenarioId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => choose(s.id)}
              aria-pressed={active}
              className={cn(
                "relative rounded-2xl border p-5 text-left shadow-soft transition-all hover:-translate-y-0.5",
                active ? "border-teal bg-accent ring-2 ring-teal/30" : "bg-card hover:border-teal/40",
              )}
            >
              {active && (
                <span className="absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-teal text-teal-foreground">
                  <Check className="size-3.5" />
                </span>
              )}
              <div className={cn("mb-4 flex size-11 items-center justify-center rounded-xl", active ? "bg-teal text-teal-foreground" : "bg-sky text-sky-foreground")}>
                <Icon className="size-5" />
              </div>
              <p className="font-semibold">{s.title}</p>
              <p className="font-kr text-sm text-muted-foreground">{s.titleKo}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
            </button>
          );
        })}
      </div>

      <PreviewNotice>
        The AI professor and classmates aren't connected yet. You can type replies to try the
        flow — your messages stay in this browser and aren't analysed or saved.
      </PreviewNotice>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <ChatPanel persona={scenario.persona} messages={messages} onSend={send} />

        <div className="space-y-5">
          <SectionCard
            title="Conversation history"
            description="This session"
            action={
              <Button variant="ghost" size="icon" aria-label="Restart conversation" onClick={() => choose(scenarioId)}>
                <RotateCcw />
              </Button>
            }
          >
            {userTurns.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your replies will be listed here as you practise.</p>
            ) : (
              <ol className="space-y-2">
                {userTurns.map((m, i) => (
                  <li key={m.id} className="flex gap-2 text-sm">
                    <span className="font-semibold text-teal">{i + 1}.</span>
                    <span className="font-kr">{m.text}</span>
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>

          <SectionCard title="Useful expressions" action={<SampleBadge label="Tips" />}>
            <ul className="space-y-3 text-sm">
              <li>
                <p className="font-kr font-semibold">혹시 ~해 주실 수 있을까요?</p>
                <p className="text-muted-foreground">Could you possibly…? (polite request)</p>
              </li>
              <li>
                <p className="font-kr font-semibold">제 생각에는 ~것 같습니다.</p>
                <p className="text-muted-foreground">In my opinion, it seems that…</p>
              </li>
              <li>
                <p className="font-kr font-semibold">다시 한번 말씀해 주시겠어요?</p>
                <p className="text-muted-foreground">Could you say that once more?</p>
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
