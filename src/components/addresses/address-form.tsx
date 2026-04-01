"use client";

import type { SavedAddress } from "@prisma/client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { savedAddressSchema } from "@/schemas/address";
import { apiFetch } from "@/lib/api-client";

type AddressFormValues = z.input<typeof savedAddressSchema>;

export function AddressForm({
  onCreated,
}: {
  onCreated?: (address: SavedAddress) => void;
}) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(savedAddressSchema),
    defaultValues: {
      label: "",
      addressLine: "",
      ward: "",
      district: "",
      cityProvince: "TP. Hồ Chí Minh",
      landmark: "",
      latitude: 10.7769,
      longitude: 106.7009,
      isDefault: false,
    },
  });

  function onSubmit(values: AddressFormValues) {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const created = await apiFetch<SavedAddress>("/api/addresses", {
          method: "POST",
          body: JSON.stringify(values),
        });
        setSuccessMessage("Đã lưu địa chỉ.");
        onCreated?.(created);
        form.reset({
          label: "",
          addressLine: "",
          ward: "",
          district: "",
          cityProvince: "TP. Hồ Chí Minh",
          landmark: "",
          latitude: 10.7769,
          longitude: 106.7009,
          isDefault: false,
        });
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Không thể lưu địa chỉ.",
        );
      }
    });
  }

  return (
    <Card className="space-y-4">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Nhãn địa chỉ" error={form.formState.errors.label?.message}>
            <Input placeholder="Nhà riêng, văn phòng..." {...form.register("label")} />
          </FormField>
          <FormField
            label="Địa chỉ cụ thể"
            error={form.formState.errors.addressLine?.message}
          >
            <Input
              placeholder="Số nhà, tên đường"
              {...form.register("addressLine")}
            />
          </FormField>
          <FormField label="Phường/xã" error={form.formState.errors.ward?.message}>
            <Input {...form.register("ward")} />
          </FormField>
          <FormField label="Quận/huyện" error={form.formState.errors.district?.message}>
            <Input {...form.register("district")} />
          </FormField>
          <FormField
            label="Tỉnh/thành phố"
            error={form.formState.errors.cityProvince?.message}
          >
            <Input {...form.register("cityProvince")} />
          </FormField>
          <FormField label="Mốc gần đó" error={form.formState.errors.landmark?.message}>
            <Input placeholder="Ví dụ: gần cây xăng..." {...form.register("landmark")} />
          </FormField>
          <FormField label="Vĩ độ" error={form.formState.errors.latitude?.message}>
            <Input type="number" step="any" {...form.register("latitude")} />
          </FormField>
          <FormField label="Kinh độ" error={form.formState.errors.longitude?.message}>
            <Input type="number" step="any" {...form.register("longitude")} />
          </FormField>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-700)]">
          <Checkbox {...form.register("isDefault")} />
          Đặt làm địa chỉ mặc định
        </label>

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
          {isPending ? "Đang lưu..." : "Lưu địa chỉ"}
        </Button>
      </form>
    </Card>
  );
}
