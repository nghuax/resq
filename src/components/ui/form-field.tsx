import type { ReactNode } from "react";

export function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--ink-800)]">{label}</span>
        {hint ? (
          <span className="text-xs text-[var(--ink-500)]">{hint}</span>
        ) : null}
      </div>
      {children}
      {error ? <p className="text-xs text-[var(--danger-500)]">{error}</p> : null}
    </label>
  );
}
