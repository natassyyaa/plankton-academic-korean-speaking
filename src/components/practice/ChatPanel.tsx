import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Mic, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  from: "ai" | "user" | "system";
  text: string;
  translation?: string;
  /** Shown above AI bubbles, e.g. "Sample opening line". */
  tag?: string;
};

export type Persona = { name: string; role: string };

let counter = 0;
export const newId = () => `m${Date.now()}-${counter++}`;

/**
 * Conversation UI shared by Academic Speaking and Professor Q&A.
 * The AI is not connected: user messages are kept locally and a clearly
 * labelled placeholder appears where the AI reply will go.
 */
export function ChatPanel({
  persona,
  messages,
  onSend,
  placeholder = "한국어로 답해 보세요… (Type your answer in Korean)",
  className,
}: {
  persona: Persona;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <div className={cn("flex min-h-[520px] flex-col overflow-hidden rounded-2xl border bg-card shadow-soft", className)}>
      <div className="flex items-center gap-3 border-b bg-tide px-5 py-3.5">
        <div className="flex size-10 items-center justify-center rounded-full bg-ocean text-navy-foreground">
          <Bot className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{persona.name}</p>
          <p className="text-xs text-muted-foreground">{persona.role}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6" aria-live="polite">
        {messages.map((m) =>
          m.from === "system" ? (
            <p
              key={m.id}
              className="mx-auto max-w-md rounded-lg border border-dashed bg-muted/60 px-3 py-2 text-center text-xs text-muted-foreground"
            >
              {m.text}
            </p>
          ) : (
            <div key={m.id} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
              <div className="max-w-[85%] space-y-1">
                {m.tag && (
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-warning-foreground">{m.tag}</p>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 font-kr text-[15px] leading-relaxed",
                    m.from === "user"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-secondary text-secondary-foreground",
                  )}
                >
                  {m.text}
                </div>
                {m.translation && <p className="px-1 text-xs text-muted-foreground">{m.translation}</p>}
              </div>
            </div>
          ),
        )}
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 border-t bg-card p-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Button type="button" variant="outline" size="icon" disabled aria-label="Voice input (coming soon)" className="size-11 rounded-full">
                <Mic />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Voice input is coming soon — no audio is recorded yet</TooltipContent>
        </Tooltip>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={placeholder}
          className="min-h-11 resize-none rounded-xl font-kr"
        />
        <Button type="submit" size="icon" aria-label="Send" disabled={!draft.trim()} className="size-11 rounded-full bg-teal text-teal-foreground hover:bg-teal/90">
          <SendHorizontal />
        </Button>
      </form>
    </div>
  );
}

export const AI_PLACEHOLDER_TEXT =
  "AI not connected yet — the AI's reply and live corrections will appear here in a later stage.";
