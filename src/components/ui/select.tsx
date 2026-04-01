import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-12 w-full rounded-2xl border border-black/8 bg-[var(--sand-50)] px-4 text-sm text-[var(--ink-900)] outline-none transition focus:border-[var(--brand-400)] focus:bg-white focus:ring-4 focus:ring-[color:rgba(15,118,110,0.12)]",
      className,
      !props.value && "text-[var(--ink-500)]",
    )}
    {...props}
  />
));

Select.displayName = "Select";
