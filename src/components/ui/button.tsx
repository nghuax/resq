import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--brand-600)] text-white shadow-[0_24px_60px_-28px_rgba(4,38,153,0.72)] hover:bg-[var(--brand-700)]",
  secondary:
    "bg-white/95 text-[var(--night-950)] ring-1 ring-[rgba(8,11,13,0.08)] hover:bg-white",
  ghost:
    "bg-transparent text-[var(--ink-700)] hover:bg-white/75 hover:text-[var(--night-950)]",
  danger: "bg-[var(--danger-500)] text-white hover:bg-[var(--danger-600)]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-400)] disabled:pointer-events-none disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
