import * as React from "react";

import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "h-5 w-5 rounded border border-black/20 text-[var(--brand-600)] focus:ring-[var(--brand-300)]",
      className,
    )}
    {...props}
  />
));

Checkbox.displayName = "Checkbox";
