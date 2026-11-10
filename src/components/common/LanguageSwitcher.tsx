import { Languages } from "lucide-react";
import { LANGUAGES, useI18n, type LangCode } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <Select value={lang} onValueChange={(v) => setLang(v as LangCode)}>
      <SelectTrigger aria-label={t("common.language")} className={cn("h-9 w-auto gap-2 rounded-full bg-card", className)}>
        <Languages className="size-4 text-teal" />
        <SelectValue>{LANGUAGES.find((l) => l.code === lang)?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {LANGUAGES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.label}
            <span className="ml-1 text-xs text-muted-foreground">· {l.english}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
