import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  invert?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-2">
        {eyebrow ? (
          <p className={cn("section-kicker", invert && "section-kicker-cyan")}>
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "font-display text-3xl font-semibold tracking-[-0.03em] md:text-4xl",
            invert ? "text-white" : "text-[var(--ink-950)]",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "text-sm leading-7 md:text-base",
              invert ? "text-white/72" : "text-[var(--ink-600)]",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
