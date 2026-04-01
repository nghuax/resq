"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { FIXER_ALLOWED_STATUS_UPDATES } from "@/lib/constants";
import { apiFetch } from "@/lib/api-client";

const labels: Record<(typeof FIXER_ALLOWED_STATUS_UPDATES)[number], string> = {
  fixer_on_the_way: "Đang tới",
  arrived: "Đã tới nơi",
  in_progress: "Đang xử lý",
  completed: "Hoàn thành",
};

export function FixerJobActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateStatus(status: (typeof FIXER_ALLOWED_STATUS_UPDATES)[number]) {
    const note =
      window.prompt("Ghi chú nhanh cho khách/admin (không bắt buộc):") ?? "";
    const etaMinutes =
      status === "fixer_on_the_way"
        ? Number(window.prompt("ETA dự kiến (phút, không bắt buộc):") ?? "")
        : undefined;

    startTransition(async () => {
      try {
        setErrorMessage(null);
        await apiFetch(`/api/fixer/jobs/${requestId}/status`, {
          method: "PATCH",
          body: JSON.stringify({
            status,
            note,
            etaMinutes: Number.isFinite(etaMinutes) ? etaMinutes : undefined,
          }),
        });
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Không thể cập nhật trạng thái.",
        );
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {FIXER_ALLOWED_STATUS_UPDATES.map((status) => (
          <Button
            key={status}
            variant={status === "completed" ? "primary" : "secondary"}
            onClick={() => updateStatus(status)}
            disabled={isPending}
          >
            {labels[status]}
          </Button>
        ))}
      </div>
      {errorMessage ? (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
