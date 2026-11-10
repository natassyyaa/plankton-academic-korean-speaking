import { FlaskConical, Info } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Marks content that is placeholder/sample data, not real results. */
export function SampleBadge({ className, label }: { className?: string; label?: string }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-warning-foreground/20 bg-warning px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning-foreground",
        className,
      )}
    >
      <FlaskConical className="size-3" />
      {label ?? t("common.sampleData")}
    </span>
  );
}

/** Inline notice explaining that a feature is a preview and not connected yet. */
export function PreviewNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-dashed border-teal/40 bg-accent/60 px-4 py-3 text-sm text-accent-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
