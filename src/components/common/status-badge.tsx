import { Badge } from "@/components/ui/badge";
import { REQUEST_STATUS_META } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  const meta =
    REQUEST_STATUS_META[status as keyof typeof REQUEST_STATUS_META] ??
    REQUEST_STATUS_META.submitted;

  return <Badge tone={meta.color}>{meta.label}</Badge>;
}
