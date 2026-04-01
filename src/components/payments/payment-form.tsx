"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/constants";
import { apiFetch } from "@/lib/api-client";
import { payRequestSchema } from "@/schemas/payment";

type PaymentFormValues = z.input<typeof payRequestSchema>;

export function PaymentForm({
  requestId,
  totalLabel,
}: {
  requestId: string;
  totalLabel: string;
}) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(payRequestSchema),
    defaultValues: {
      method: "cash",
    },
  });

  function onSubmit(values: PaymentFormValues) {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        await apiFetch(`/api/requests/${requestId}/pay`, {
          method: "POST",
          body: JSON.stringify(values),
        });
        setSuccessMessage("Thanh toán mô phỏng thành công.");
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Thanh toán thất bại.",
        );
      }
    });
  }

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-[var(--ink-950)]">
          Thanh toán cho yêu cầu này
        </h3>
        <p className="text-sm text-[var(--ink-600)]">
          Tổng thanh toán hiện tại:{" "}
          <span className="font-semibold text-[var(--brand-700)]">{totalLabel}</span>
        </p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-3">
          {PAYMENT_METHOD_OPTIONS.map((method) => (
            <label
              key={method.value}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/6 bg-[var(--sand-50)] px-4 py-4"
            >
              <input
                type="radio"
                value={method.value}
                className="h-4 w-4"
                {...form.register("method")}
              />
              <div>
                <p className="font-medium text-[var(--ink-900)]">{method.label}</p>
                <p className="text-sm text-[var(--ink-500)]">
                  {method.value === "bank_transfer"
                    ? "Placeholder cho tích hợp thực tế."
                    : "Luồng thanh toán mô phỏng cho MVP."}
                </p>
              </div>
            </label>
          ))}
        </div>

        {successMessage ? (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}
        {errorMessage ? (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Đang xử lý..." : "Xác nhận thanh toán"}
        </Button>
      </form>
    </Card>
  );
}
