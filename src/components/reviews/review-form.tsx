"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";
import { reviewFormSchema } from "@/schemas/review";

type ReviewFormValues = z.input<typeof reviewFormSchema>;

const ratingOptions = [5, 4, 3, 2, 1];

export function ReviewForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      overallRating: 5,
      professionalismRating: 5,
      arrivalSpeedRating: 5,
      serviceQualityRating: 5,
      communicationRating: 5,
      comment: "",
    },
  });

  function onSubmit(values: ReviewFormValues) {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        await apiFetch(`/api/requests/${requestId}/review`, {
          method: "POST",
          body: JSON.stringify(values),
        });
        setSuccessMessage("Cảm ơn bạn, đánh giá đã được ghi nhận.");
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Không thể gửi đánh giá.",
        );
      }
    });
  }

  const renderRatingSelect = (
    fieldName:
      | "overallRating"
      | "professionalismRating"
      | "arrivalSpeedRating"
      | "serviceQualityRating"
      | "communicationRating",
    label: string,
  ) => (
    <FormField
      label={label}
      error={form.formState.errors[fieldName]?.message as string | undefined}
    >
      <Select {...form.register(fieldName)}>
        {ratingOptions.map((rating) => (
          <option key={rating} value={rating}>
            {rating} sao
          </option>
        ))}
      </Select>
    </FormField>
  );

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-[var(--ink-950)]">
          Đánh giá trải nghiệm
        </h3>
        <p className="text-sm leading-7 text-[var(--ink-600)]">
          Mỗi yêu cầu hoàn thành được đánh giá một lần để giúp ResQ cải thiện đội
          ngũ fixer và quy trình hỗ trợ.
        </p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          {renderRatingSelect("overallRating", "Đánh giá tổng thể")}
          {renderRatingSelect("professionalismRating", "Tính chuyên nghiệp")}
          {renderRatingSelect("arrivalSpeedRating", "Tốc độ đến nơi")}
          {renderRatingSelect("serviceQualityRating", "Chất lượng xử lý")}
          {renderRatingSelect("communicationRating", "Giao tiếp")}
        </div>

        <FormField label="Nhận xét thêm" error={form.formState.errors.comment?.message}>
          <Textarea
            placeholder="Fixer đến nhanh, xử lý gọn gàng, báo giá rõ ràng..."
            {...form.register("comment")}
          />
        </FormField>

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
          {isPending ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
      </form>
    </Card>
  );
}
