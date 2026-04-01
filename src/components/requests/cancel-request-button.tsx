"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="danger"
      onClick={() => {
        const reason = window.prompt("Nhập lý do hủy (không bắt buộc):") ?? "";

        startTransition(async () => {
          await apiFetch(`/api/requests/${requestId}/cancel`, {
            method: "PATCH",
            body: JSON.stringify({ reason }),
          });
          router.refresh();
        });
      }}
      disabled={isPending}
    >
      {isPending ? "Đang hủy..." : "Hủy yêu cầu"}
    </Button>
  );
}
