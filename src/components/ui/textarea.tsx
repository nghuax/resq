import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-28 w-full rounded-2xl border border-black/8 bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-900)] outline-none transition placeholder:text-[var(--ink-400)] focus:border-[var(--brand-400)] focus:bg-white focus:ring-4 focus:ring-[color:rgba(15,118,110,0.12)]",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
