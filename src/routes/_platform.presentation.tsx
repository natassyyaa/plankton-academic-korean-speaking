import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Square, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PageHeader, SectionCard } from "@/components/common/PageHeader";
import { PreviewNotice } from "@/components/common/SampleBadge";
import { FileDropzone } from "@/components/common/FileDropzone";
import { formatClock, useStopwatch } from "@/hooks/use-stopwatch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_platform/presentation")({
  head: () => ({
    meta: [
      { title: "Presentation Simulator — PLANKTON" },
      { name: "description", content: "Upload your script and slides, set a target time and rehearse your Korean presentation." },
      { property: "og:title", content: "Presentation Simulator — PLANKTON" },
      { property: "og:description", content: "Rehearse academic Korean presentations with a speaking timer." },
    ],
  }),
  component: PresentationPage,
});

const DURATIONS = [3, 5, 10, 15];

function PresentationPage() {
  const [scriptFile, setScriptFile] = useState<File | null>(null);
  const [slidesFile, setSlidesFile] = useState<File | null>(null);
  const [scriptText, setScriptText] = useState("");
  const [topic, setTopic] = useState("");
  const [targetMin, setTargetMin] = useState(5);
  const [rehearsing, setRehearsing] = useState(false);
  const watch = useStopwatch();

  // Plain-text scripts are read locally so you can follow along while rehearsing.
  useEffect(() => {
    if (!scriptFile || !scriptFile.name.toLowerCase().endsWith(".txt")) return;
    scriptFile.text().then(setScriptText).catch(() => {});
  }, [scriptFile]);

  const targetSec = targetMin * 60;
  const remaining = targetSec - watch.seconds;
  const pct = Math.min(100, (watch.seconds / targetSec) * 100);
  const overtime = remaining < 0;

  const startRehearsal = () => {
    watch.reset();
    setRehearsing(true);
    watch.start();
  };
  const endRehearsal = () => {
    watch.pause();
    setRehearsing(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="Presentation Simulator"
        titleKo="발표 시뮬레이터"
        description="Prepare your materials, set a target time and rehearse out loud."
      />

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <SectionCard title="1. Presentation topic">
            <Label htmlFor="topic" className="sr-only">Presentation topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 한국 MZ세대의 소비 패턴 변화 (e.g. Changing consumption patterns of Korean Gen Z)"
              className="h-11 font-kr"
            />
          </SectionCard>

          <SectionCard title="2. Your materials" description="Files stay in your browser — nothing is uploaded in this preview.">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Script</p>
                <FileDropzone
                  label="Upload script"
                  hint=".txt, .docx or .pdf"
                  accept=".txt,.doc,.docx,.pdf"
                  file={scriptFile}
                  onFile={setScriptFile}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Slides</p>
                <FileDropzone
                  label="Upload PPT / PDF"
                  hint=".ppt, .pptx or .pdf"
                  accept=".ppt,.pptx,.pdf"
                  file={slidesFile}
                  onFile={setSlidesFile}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="script-text">Or paste your script</Label>
              <Textarea
                id="script-text"
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                rows={6}
                placeholder="안녕하십니까. 지금부터 발표를 시작하겠습니다…"
                className="font-kr"
              />
              <p className="text-xs text-muted-foreground">
                {scriptText.replace(/\s/g, "").length} characters
                {scriptText && ` · roughly ${Math.max(1, Math.round(scriptText.replace(/\s/g, "").length / 250))} min at a calm pace`}
              </p>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="3. Speaking timer">
            <p className="mb-2 text-sm font-medium">Target length</p>
            <ToggleGroup
              type="single"
              value={String(targetMin)}
              onValueChange={(v) => v && setTargetMin(Number(v))}
              className="justify-start"
              disabled={rehearsing}
            >
              {DURATIONS.map((d) => (
                <ToggleGroupItem key={d} value={String(d)} className="rounded-full px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  {d} min
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <div
              className={cn(
                "mt-6 rounded-2xl p-6 text-center",
                overtime ? "bg-destructive/10" : "bg-ocean text-navy-foreground",
              )}
            >
              <p className={cn("flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-wide", overtime ? "text-destructive" : "text-navy-foreground/75")}>
                <Timer className="size-3.5" /> {overtime ? "Over time" : rehearsing ? "Time remaining" : "Ready"}
              </p>
              <p className={cn("mt-2 font-display text-6xl font-bold tabular-nums", overtime && "text-destructive")}>
                {formatClock(remaining)}
              </p>
              <p className={cn("mt-1 text-sm", overtime ? "text-destructive" : "text-navy-foreground/75")}>
                Elapsed {formatClock(watch.seconds)}
              </p>
              <Progress value={pct} className={cn("mt-4 h-2", overtime ? "" : "bg-navy-foreground/20 [&>div]:bg-teal")} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {!rehearsing ? (
                <Button size="lg" onClick={startRehearsal} className="h-12 flex-1 rounded-full bg-teal text-base text-teal-foreground hover:bg-teal/90">
                  <Play /> Start rehearsal
                </Button>
              ) : (
                <>
                  {watch.running ? (
                    <Button variant="outline" onClick={watch.pause} className="h-11 flex-1 rounded-full">
                      <Pause /> Pause
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={watch.start} className="h-11 flex-1 rounded-full">
                      <Play /> Resume
                    </Button>
                  )}
                  <Button onClick={endRehearsal} className="h-11 flex-1 rounded-full">
                    <Square /> Finish
                  </Button>
                </>
              )}
              {!rehearsing && watch.seconds > 0 && (
                <Button variant="ghost" onClick={watch.reset} className="h-12 rounded-full">
                  <RotateCcw /> Reset
                </Button>
              )}
            </div>
            {!rehearsing && watch.seconds > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                Last rehearsal: {formatClock(watch.seconds)} of {targetMin}:00 target.
              </p>
            )}
          </SectionCard>

          <PreviewNotice>
            The timer works now. Speech recording and AI analysis of your pace, pronunciation and
            expressions will be added in a later stage.
          </PreviewNotice>
        </div>
      </div>

      {rehearsing && (
        <SectionCard title={topic || "Rehearsal"} description="Read along while the timer runs">
          {scriptText ? (
            <p className="whitespace-pre-wrap font-kr text-lg leading-loose">{scriptText}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Paste your script above to see it here during rehearsal.</p>
          )}
        </SectionCard>
      )}
    </>
  );
}
