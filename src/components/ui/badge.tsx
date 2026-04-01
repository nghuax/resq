import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "slate" | "amber" | "sky" | "blue" | "teal" | "orange" | "emerald" | "rose";
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  slate: "bg-slate-100 text-slate-700",
  amber: "bg-amber-100 text-amber-700",
  sky: "bg-sky-100 text-sky-700",
  blue: "bg-blue-100 text-blue-700",
  teal: "bg-teal-100 text-teal-700",
  orange: "bg-orange-100 text-orange-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
};

export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.12em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
