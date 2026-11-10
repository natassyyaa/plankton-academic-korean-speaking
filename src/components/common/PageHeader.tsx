import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  titleKo,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  titleKo?: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          {title}
          {titleKo && (
            <span className="ml-3 align-middle font-kr text-base font-medium text-muted-foreground md:text-lg">
              {titleKo}
            </span>
          )}
        </h1>
        {description && <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border bg-card p-5 shadow-soft md:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-card-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
