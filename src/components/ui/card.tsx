import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[32px] border border-[rgba(8,11,13,0.08)] bg-white/88 p-5 shadow-[0_28px_70px_-36px_rgba(12,22,44,0.35)] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
