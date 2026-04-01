"use client";

import type { CarRegistrationDetails, Vehicle } from "@prisma/client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FUEL_TYPE_OPTIONS, VEHICLE_TYPE_OPTIONS } from "@/lib/constants";
import { apiFetch } from "@/lib/api-client";
import { vehicleFormSchema } from "@/schemas/vehicle";

type VehicleWithRegistration = Vehicle & {
  carRegistration: CarRegistrationDetails | null;
};

type VehicleFormInput = z.input<typeof vehicleFormSchema>;
type VehicleFormValues = z.output<typeof vehicleFormSchema>;

export function VehicleForm({
  onCreated,
  submitLabel = "Lưu phương tiện",
  compact = false,
}: {
  onCreated?: (vehicle: VehicleWithRegistration) => void;
  submitLabel?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<VehicleFormInput, undefined, VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      vehicleType: "motorbike",
      brand: "",
      model: "",
      licensePlate: "",
      year: undefined,
      fuelType: "gasoline",
      notes: "",
      isDefault: false,
      carRegistration: {
        registrationNumber: "",
        ownerName: "",
        registrationProvinceCity: "",
        inspectionExpiryDate: "",
        chassisNumber: "",
        engineNumber: "",
      },
    },
  });

  const vehicleType = useWatch({
    control: form.control,
    name: "vehicleType",
  });

  function onSubmit(values: VehicleFormValues) {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const created = await apiFetch<VehicleWithRegistration>("/api/vehicles", {
          method: "POST",
          body: JSON.stringify(values),
        });
        setSuccessMessage("Đã lưu phương tiện thành công.");
        form.reset({
          vehicleType: "motorbike",
          brand: "",
          model: "",
          licensePlate: "",
          year: undefined,
          fuelType: "gasoline",
          notes: "",
          isDefault: false,
          carRegistration: {
            registrationNumber: "",
            ownerName: "",
            registrationProvinceCity: "",
            inspectionExpiryDate: "",
            chassisNumber: "",
            engineNumber: "",
          },
        });
        onCreated?.(created);
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Không thể lưu phương tiện.",
        );
      }
    });
  }

  const content = (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Loại phương tiện"
          error={form.formState.errors.vehicleType?.message}
        >
          <Select {...form.register("vehicleType")}>
            {VEHICLE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Loại nhiên liệu" error={form.formState.errors.fuelType?.message}>
          <Select {...form.register("fuelType")}>
            {FUEL_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Hãng xe" error={form.formState.errors.brand?.message}>
          <Input placeholder="Honda, Toyota..." {...form.register("brand")} />
        </FormField>

        <FormField label="Dòng xe" error={form.formState.errors.model?.message}>
          <Input placeholder="Vios, SH 150i..." {...form.register("model")} />
        </FormField>

        <FormField
          label="Biển số"
          error={form.formState.errors.licensePlate?.message}
        >
          <Input placeholder="51H-123.45" {...form.register("licensePlate")} />
        </FormField>

        <FormField label="Năm sản xuất" error={form.formState.errors.year?.message}>
          <Input placeholder="2022" type="number" {...form.register("year")} />
        </FormField>
      </div>

      <FormField label="Ghi chú" error={form.formState.errors.notes?.message}>
        <Textarea
          rows={4}
          placeholder="Ví dụ: xe thường để dưới hầm, cần gọi trước khi vào."
          {...form.register("notes")}
        />
      </FormField>

      <label className="flex items-center gap-3 rounded-2xl bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-700)]">
        <Checkbox {...form.register("isDefault")} />
        Đặt làm phương tiện mặc định
      </label>

      {vehicleType === "car" ? (
        <div className="space-y-4 rounded-[24px] bg-[var(--sand-50)] p-4">
          <div>
            <p className="font-medium text-[var(--ink-900)]">
              Thông tin đăng ký ô tô
            </p>
            <p className="text-sm text-[var(--ink-500)]">
              Các trường này là tùy chọn nhưng hữu ích khi hỗ trợ kiểm tra giấy tờ.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Số đăng ký"
              error={form.formState.errors.carRegistration?.registrationNumber?.message}
            >
              <Input {...form.register("carRegistration.registrationNumber")} />
            </FormField>
            <FormField
              label="Chủ sở hữu"
              error={form.formState.errors.carRegistration?.ownerName?.message}
            >
              <Input {...form.register("carRegistration.ownerName")} />
            </FormField>
            <FormField
              label="Tỉnh/thành đăng ký"
              error={
                form.formState.errors.carRegistration?.registrationProvinceCity
                  ?.message
              }
            >
              <Input
                {...form.register("carRegistration.registrationProvinceCity")}
              />
            </FormField>
            <FormField
              label="Hạn đăng kiểm"
              error={
                form.formState.errors.carRegistration?.inspectionExpiryDate
                  ?.message
              }
            >
              <Input
                type="date"
                {...form.register("carRegistration.inspectionExpiryDate")}
              />
            </FormField>
            <FormField
              label="Số khung"
              error={form.formState.errors.carRegistration?.chassisNumber?.message}
            >
              <Input {...form.register("carRegistration.chassisNumber")} />
            </FormField>
            <FormField
              label="Số máy"
              error={form.formState.errors.carRegistration?.engineNumber?.message}
            >
              <Input {...form.register("carRegistration.engineNumber")} />
            </FormField>
          </div>
        </div>
      ) : null}

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
        {isPending ? "Đang lưu..." : submitLabel}
      </Button>
    </form>
  );

  if (compact) {
    return content;
  }

  return <Card className="space-y-4">{content}</Card>;
}
