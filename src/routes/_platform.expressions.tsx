import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/PageHeader";
import { LANGUAGES, useI18n } from "@/lib/i18n";
import { expressionCategories, expressions, type ExpressionCategory } from "@/lib/sample-data";

export const Route = createFileRoute("/_platform/expressions")({
  head: () => ({
    meta: [
      { title: "Expression Library — PLANKTON" },
      { name: "description", content: "Korean academic expressions for presentations, discussions, questions and professor communication, with translations." },
      { property: "og:title", content: "Expression Library — PLANKTON" },
      { property: "og:description", content: "Learn Korean academic expressions with translated meanings." },
    ],
  }),
  component: ExpressionsPage,
});

function ExpressionsPage() {
  const { lang } = useI18n();
  const [category, setCategory] = useState<ExpressionCategory | "all">("all");
  const [query, setQuery] = useState("");
  const langLabel = LANGUAGES.find((l) => l.code === lang)?.english ?? "English";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expressions.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (!q) return true;
      return [e.ko, e.romanization, e.example, ...Object.values(e.meaning)].some((s) => s?.toLowerCase().includes(q));
    });
  }, [category, query]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy — please select the text instead");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Expression Library"
        titleKo="표현 사전"
        description={`Useful Korean expressions for academic life. Meanings are shown in ${langLabel} — change it from the language menu at the top.`}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Tabs value={category} onValueChange={(v) => setCategory(v as ExpressionCategory | "all")} className="min-w-0 flex-1">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-secondary p-1 md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {expressionCategories.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative md:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Korean or meaning…" className="h-10 pl-9" aria-label="Search expressions" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">No expressions match “{query}”.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => {
            const cat = expressionCategories.find((c) => c.id === e.category)!;
            const meaning = e.meaning[lang] ?? e.meaning.en;
            return (
              <article key={e.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-elegant">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                    {cat.label} · <span className="font-kr">{cat.labelKo}</span>
                  </span>
                  <Button variant="ghost" size="icon" className="-mr-2 -mt-2" aria-label={`Copy ${e.ko}`} onClick={() => copy(e.ko)}>
                    <Copy />
                  </Button>
                </div>
                <p className="mt-3 font-kr text-lg font-bold leading-snug">{e.ko}</p>
                <p className="mt-0.5 text-xs italic text-muted-foreground">{e.romanization}</p>
                <p className="mt-3 text-sm font-medium text-primary">{meaning}</p>
                {lang !== "en" && lang !== "ko" && !e.meaning[lang] && (
                  <p className="text-xs text-muted-foreground">({langLabel} translation coming soon)</p>
                )}
                <div className="mt-4 rounded-xl bg-muted/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Example</p>
                  <p className="mt-1 font-kr text-sm">{e.example}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
