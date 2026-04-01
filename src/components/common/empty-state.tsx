import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="border-dashed bg-white/80 text-center">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--ink-900)]">{title}</h3>
        <p className="text-sm leading-7 text-[var(--ink-600)]">{description}</p>
        {actionHref && actionLabel ? (
          <Link href={actionHref}>
            <Button>{actionLabel}</Button>
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
