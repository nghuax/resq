"use client";

import type {
  CarRegistrationDetails,
  SavedAddress,
  ServiceType,
  Vehicle,
} from "@prisma/client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Fuel, MapPin, ShieldCheck, Wrench } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { StatusBadge } from "@/components/common/status-badge";
import { LocationPickerMap } from "@/components/requests/location-picker-map";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { apiFetch } from "@/lib/api-client";
import {
  FUEL_TYPE_OPTIONS,
  REQUEST_STATUS_META,
} from "@/lib/constants";
import { formatCurrencyVnd, formatServiceName, formatVehicleType } from "@/lib/format";
import { requestHelpWizardSchema } from "@/schemas/request";

type VehicleWithRegistration = Vehicle & {
  carRegistration: CarRegistrationDetails | null;
};

type RequestWizardInput = z.input<typeof requestHelpWizardSchema>;
type RequestWizardValues = z.output<typeof requestHelpWizardSchema>;
type ServiceKey = RequestWizardInput["serviceTypeKey"];

const steps = [
  "Chọn xe",
  "Chọn dịch vụ",
  "Đặt vị trí",
  "Mô tả sự cố",
  "Xác nhận",
] as const;

export function RequestHelpWizard({
  initialVehicles,
  addresses,
  services,
  contactPhone,
}: {
  initialVehicles: VehicleWithRegistration[];
  addresses: SavedAddress[];
  services: ServiceType[];
  contactPhone: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [locationMode, setLocationMode] = useState<"saved" | "gps" | "manual">(
    addresses.length ? "saved" : "gps",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  const defaultService = services.find((service) => service.key === "roadside_help") ?? services[0];
  const selectedAddressId = defaultAddress?.id;
  const defaultServiceKey = (defaultService?.key ?? "roadside_help") as ServiceKey;

  const form = useForm<RequestWizardInput, undefined, RequestWizardValues>({
    resolver: zodResolver(requestHelpWizardSchema),
    defaultValues: {
      vehicleId: vehicles.find((vehicle) => vehicle.isDefault)?.id ?? vehicles[0]?.id,
      serviceTypeKey: defaultServiceKey,
      fuelDetails: {
        fuelType: "gasoline",
        litersRequested: 1,
        preferredGrade: "",
      },
      location: {
        savedAddressId: selectedAddressId,
        label: defaultAddress?.label ?? "Vị trí hiện tại",
        addressLine: defaultAddress?.addressLine ?? "",
        ward: defaultAddress?.ward ?? "",
        district: defaultAddress?.district ?? "",
        cityProvince: defaultAddress?.cityProvince ?? "TP. Hồ Chí Minh",
        landmark: defaultAddress?.landmark ?? "",
        latitude: defaultAddress?.latitude ?? 10.7769,
        longitude: defaultAddress?.longitude ?? 106.7009,
        saveAsAddress: false,
        saveLabel: "",
      },
      note: "",
      contactPhone,
      scheduledAt: "",
      photoNames: [],
    },
  });

  const watchedServiceKey = useWatch({
    control: form.control,
    name: "serviceTypeKey",
  });
  const watchedVehicleId = useWatch({
    control: form.control,
    name: "vehicleId",
  });
  const watchedFuelDetails = useWatch({
    control: form.control,
    name: "fuelDetails",
  });
  const watchedLocation = useWatch({
    control: form.control,
    name: "location",
  });
  const watchedSaveAsAddress = useWatch({
    control: form.control,
    name: "location.saveAsAddress",
  });
  const watchedPhotoNames = useWatch({
    control: form.control,
    name: "photoNames",
  });
  const watchedFuelLiters = Number(watchedFuelDetails?.litersRequested ?? 0);
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === watchedVehicleId);
  const selectedService =
    services.find((service) => service.key === watchedServiceKey) ??
    services[0];
  const isFuelService =
    watchedServiceKey === "refill_gasoline" || watchedServiceKey === "refill_diesel";

  const estimatedTotal = useMemo(() => {
    if (!selectedService) {
      return 0;
    }

    const fuelRate = watchedServiceKey === "refill_diesel" ? 24000 : 23000;
    return selectedService.basePriceVnd + (isFuelService ? watchedFuelLiters * fuelRate : 0);
  }, [isFuelService, selectedService, watchedFuelLiters, watchedServiceKey]);

  useEffect(() => {
    if (!defaultAddress || locationMode !== "saved") {
      return;
    }

    form.setValue("location.savedAddressId", defaultAddress.id);
  }, [defaultAddress, form, locationMode]);

  function applySavedAddress(addressId: string) {
    const address = addresses.find((item) => item.id === addressId);

    if (!address) {
      return;
    }

    form.setValue("location.savedAddressId", address.id);
    form.setValue("location.label", address.label);
    form.setValue("location.addressLine", address.addressLine);
    form.setValue("location.ward", address.ward);
    form.setValue("location.district", address.district);
    form.setValue("location.cityProvince", address.cityProvince);
    form.setValue("location.landmark", address.landmark ?? "");
    form.setValue("location.latitude", address.latitude);
    form.setValue("location.longitude", address.longitude);
  }

  async function goNextStep() {
    setErrorMessage(null);

    if (step === 0) {
      if (!form.getValues("vehicleId")) {
        setErrorMessage("Vui lòng chọn phương tiện hoặc thêm xe mới.");
        return;
      }
    }

    if (step === 1) {
      const fields = isFuelService
        ? ([
            "serviceTypeKey",
            "fuelDetails.fuelType",
            "fuelDetails.litersRequested",
          ] as const)
        : (["serviceTypeKey"] as const);
      const valid = await form.trigger(fields);

      if (!valid) {
        setErrorMessage("Vui lòng kiểm tra lại dịch vụ và thông tin nhiên liệu.");
        return;
      }
    }

    if (step === 2) {
      const valid = await form.trigger([
        "location.label",
        "location.addressLine",
        "location.ward",
        "location.district",
        "location.cityProvince",
        "location.latitude",
        "location.longitude",
      ] as const);

      if (!valid) {
        setErrorMessage("Vui lòng hoàn thiện vị trí cứu hộ.");
        return;
      }
    }

    if (step === 3) {
      const valid = await form.trigger(["contactPhone", "scheduledAt"] as const);

      if (!valid) {
        setErrorMessage("Vui lòng kiểm tra lại thông tin liên hệ.");
        return;
      }
    }

    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function onSubmit(values: RequestWizardValues) {
    if (!values.vehicleId) {
      setErrorMessage("Vui lòng chọn phương tiện.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const payload = {
          vehicleId: values.vehicleId,
          serviceTypeKey: values.serviceTypeKey,
          fuelDetails: isFuelService ? values.fuelDetails : undefined,
          location: values.location,
          note: values.note,
          contactPhone: values.contactPhone,
          scheduledAt: values.scheduledAt,
          photoNames: values.photoNames,
        };

        const created = await apiFetch<{ id: string }>(`/api/requests`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccessMessage("Đã tạo yêu cầu thành công.");
        router.push(`/requests/${created.id}/tracking`);
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Không thể tạo yêu cầu cứu hộ.",
        );
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Card className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-5">
            {steps.map((label, index) => {
              const isActive = index === step;
              const isComplete = index < step;

              return (
                <div
                  key={label}
                  className={`rounded-2xl px-4 py-4 text-sm transition ${
                    isActive
                      ? "bg-[var(--brand-600)] text-white"
                      : isComplete
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-[var(--sand-50)] text-[var(--ink-500)]"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                    Bước {index + 1}
                  </p>
                  <p className="mt-1 font-medium">{label}</p>
                </div>
              );
            })}
          </div>

          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {step === 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--ink-950)]">
                      Chọn phương tiện
                    </h3>
                    <p className="text-sm text-[var(--ink-500)]">
                      Chọn xe đã lưu hoặc thêm nhanh ngay trong luồng.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowVehicleForm((current) => !current)}
                  >
                    {showVehicleForm ? "Ẩn form thêm xe" : "Thêm xe mới"}
                  </Button>
                </div>

                <div className="grid gap-3">
                  {vehicles.map((vehicle) => {
                        const selected = watchedVehicleId === vehicle.id;

                    return (
                      <button
                        key={vehicle.id}
                        type="button"
                        className={`rounded-[24px] border px-4 py-4 text-left transition ${
                          selected
                            ? "border-[var(--brand-400)] bg-teal-50"
                            : "border-black/6 bg-white hover:border-[var(--brand-300)]"
                        }`}
                        onClick={() => form.setValue("vehicleId", vehicle.id)}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-[var(--ink-900)]">
                              {vehicle.brand} {vehicle.model}
                            </p>
                            <p className="text-sm text-[var(--ink-500)]">
                              {vehicle.licensePlate} · {formatVehicleType(vehicle.vehicleType)}
                            </p>
                          </div>
                          {vehicle.isDefault ? (
                            <StatusBadge status="submitted" />
                          ) : null}
                        </div>
                        {vehicle.carRegistration ? (
                          <p className="mt-2 text-xs text-[var(--ink-500)]">
                            Đăng ký: {vehicle.carRegistration.registrationNumber || "Chưa có"}
                          </p>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {showVehicleForm ? (
                  <Card className="border-dashed bg-[var(--sand-50)]">
                    <VehicleForm
                      compact
                      submitLabel="Thêm xe vào yêu cầu"
                      onCreated={(vehicle) => {
                        setVehicles((current) => [vehicle, ...current]);
                        form.setValue("vehicleId", vehicle.id);
                        setShowVehicleForm(false);
                      }}
                    />
                  </Card>
                ) : null}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--ink-950)]">
                    Chọn dịch vụ
                  </h3>
                  <p className="text-sm text-[var(--ink-500)]">
                    Chọn loại hỗ trợ phù hợp để ResQ điều phối đúng fixer.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {services.map((service) => {
                    const selected = watchedServiceKey === service.key;

                    return (
                      <button
                        key={service.id}
                        type="button"
                        className={`rounded-[24px] border px-4 py-4 text-left transition ${
                          selected
                            ? "border-[var(--brand-400)] bg-teal-50"
                            : "border-black/6 bg-white hover:border-[var(--brand-300)]"
                        }`}
                        onClick={() =>
                          form.setValue("serviceTypeKey", service.key as ServiceKey)
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <p className="font-medium text-[var(--ink-900)]">
                              {service.nameVi}
                            </p>
                            <p className="text-sm leading-6 text-[var(--ink-500)]">
                              {service.descriptionVi}
                            </p>
                          </div>
                          {service.isFuelService ? (
                            <Fuel className="h-5 w-5 text-[var(--accent-500)]" />
                          ) : (
                            <Wrench className="h-5 w-5 text-[var(--brand-600)]" />
                          )}
                        </div>
                        <p className="mt-3 text-sm font-semibold text-[var(--brand-700)]">
                          Từ {formatCurrencyVnd(service.basePriceVnd)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {isFuelService ? (
                  <div className="grid gap-4 rounded-[24px] bg-[var(--sand-50)] p-4 md:grid-cols-3">
                    <FormField
                      label="Loại nhiên liệu"
                      error={form.formState.errors.fuelDetails?.fuelType?.message}
                    >
                      <Select {...form.register("fuelDetails.fuelType")}>
                        {FUEL_TYPE_OPTIONS.filter(
                          (option) =>
                            option.value === "gasoline" || option.value === "diesel",
                        ).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                    <FormField
                      label="Số lít cần tiếp"
                      error={form.formState.errors.fuelDetails?.litersRequested?.message}
                    >
                      <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        {...form.register("fuelDetails.litersRequested")}
                      />
                    </FormField>
                    <FormField
                      label="Mức nhiên liệu"
                      hint="Tùy chọn"
                      error={form.formState.errors.fuelDetails?.preferredGrade?.message}
                    >
                      <Input
                        placeholder="RON 95, DO 0.05S..."
                        {...form.register("fuelDetails.preferredGrade")}
                      />
                    </FormField>
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--ink-950)]">
                    Xác định vị trí
                  </h3>
                  <p className="text-sm text-[var(--ink-500)]">
                    Chọn địa chỉ đã lưu, lấy GPS hiện tại hoặc tự nhập điểm gặp fixer.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(["saved", "gps", "manual"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        locationMode === mode
                          ? "bg-[var(--brand-600)] text-white"
                          : "bg-[var(--sand-50)] text-[var(--ink-600)]"
                      }`}
                      onClick={() => setLocationMode(mode)}
                    >
                      {mode === "saved"
                        ? "Địa chỉ đã lưu"
                        : mode === "gps"
                          ? "GPS hiện tại"
                          : "Nhập thủ công"}
                    </button>
                  ))}
                </div>

                {locationMode === "saved" && addresses.length ? (
                  <FormField label="Chọn địa chỉ đã lưu">
                    <Select
                  value={watchedLocation?.savedAddressId}
                  onChange={(event) => applySavedAddress(event.target.value)}
                >
                      {addresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.label} - {address.district}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Tên điểm đón"
                    error={form.formState.errors.location?.label?.message}
                  >
                    <Input {...form.register("location.label")} />
                  </FormField>
                  <FormField
                    label="Địa chỉ"
                    error={form.formState.errors.location?.addressLine?.message}
                  >
                    <Input {...form.register("location.addressLine")} />
                  </FormField>
                  <FormField
                    label="Phường/xã"
                    error={form.formState.errors.location?.ward?.message}
                  >
                    <Input {...form.register("location.ward")} />
                  </FormField>
                  <FormField
                    label="Quận/huyện"
                    error={form.formState.errors.location?.district?.message}
                  >
                    <Input {...form.register("location.district")} />
                  </FormField>
                  <FormField
                    label="Tỉnh/thành phố"
                    error={form.formState.errors.location?.cityProvince?.message}
                  >
                    <Input {...form.register("location.cityProvince")} />
                  </FormField>
                  <FormField
                    label="Mốc gần đó"
                    error={form.formState.errors.location?.landmark?.message}
                  >
                    <Input {...form.register("location.landmark")} />
                  </FormField>
                </div>

                <LocationPickerMap
                  value={{
                    latitude: Number(watchedLocation?.latitude ?? 10.7769),
                    longitude: Number(watchedLocation?.longitude ?? 106.7009),
                  }}
                  onChange={(position) => {
                    form.setValue("location.latitude", position.latitude, {
                      shouldValidate: true,
                    });
                    form.setValue("location.longitude", position.longitude, {
                      shouldValidate: true,
                    });
                  }}
                />

                <label className="flex items-center gap-3 rounded-2xl bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-700)]">
                  <Checkbox {...form.register("location.saveAsAddress")} />
                  Lưu vị trí này vào địa chỉ đã lưu
                </label>

                {watchedSaveAsAddress ? (
                  <FormField
                    label="Nhãn lưu địa chỉ"
                    error={form.formState.errors.location?.saveLabel?.message}
                  >
                    <Input
                      placeholder="Ví dụ: Điểm giao hàng, khách hàng A"
                      {...form.register("location.saveLabel")}
                    />
                  </FormField>
                ) : null}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--ink-950)]">
                    Mô tả sự cố
                  </h3>
                  <p className="text-sm text-[var(--ink-500)]">
                    Cung cấp thêm chi tiết để fixer chuẩn bị đúng dụng cụ trước khi tới.
                  </p>
                </div>

                <FormField label="Mô tả tình trạng xe">
                  <Textarea
                    placeholder="Ví dụ: xe tắt máy đột ngột, đèn taplo chớp liên tục..."
                    {...form.register("note")}
                  />
                </FormField>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Số điện thoại liên hệ"
                    error={form.formState.errors.contactPhone?.message}
                  >
                    <Input {...form.register("contactPhone")} />
                  </FormField>
                  <FormField
                    label="Thời gian hẹn"
                    hint="Tùy chọn"
                    error={form.formState.errors.scheduledAt?.message}
                  >
                    <Input type="datetime-local" {...form.register("scheduledAt")} />
                  </FormField>
                </div>

                <FormField label="Ảnh hiện trường" hint="Tùy chọn, chỉ lưu tên file ở MVP">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                      const names = Array.from(event.target.files ?? []).map(
                        (file) => file.name,
                      );
                      form.setValue("photoNames", names);
                    }}
                  />
                </FormField>

                {watchedPhotoNames?.length ? (
                  <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-3 text-sm text-[var(--ink-600)]">
                    {watchedPhotoNames.join(", ")}
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--ink-950)]">
                    Xác nhận yêu cầu
                  </h3>
                  <p className="text-sm text-[var(--ink-500)]">
                    Kiểm tra nhanh trước khi gửi tới hệ thống điều phối ResQ.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-[var(--sand-50)]">
                    <p className="text-sm font-medium text-[var(--ink-500)]">Phương tiện</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--ink-900)]">
                      {selectedVehicle
                        ? `${selectedVehicle.brand} ${selectedVehicle.model}`
                        : "Chưa chọn"}
                    </p>
                    <p className="text-sm text-[var(--ink-500)]">
                      {selectedVehicle?.licensePlate}
                    </p>
                  </Card>

                  <Card className="bg-[var(--sand-50)]">
                    <p className="text-sm font-medium text-[var(--ink-500)]">Dịch vụ</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--ink-900)]">
                      {formatServiceName(watchedServiceKey)}
                    </p>
                      {isFuelService ? (
                      <p className="text-sm text-[var(--ink-500)]">
                        {watchedFuelLiters} lít · {watchedFuelDetails?.fuelType}
                      </p>
                    ) : null}
                  </Card>

                  <Card className="bg-[var(--sand-50)]">
                    <p className="text-sm font-medium text-[var(--ink-500)]">Vị trí</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--ink-900)]">
                      {watchedLocation?.label}
                    </p>
                    <p className="text-sm text-[var(--ink-500)]">
                      {watchedLocation?.addressLine}, {watchedLocation?.district}
                    </p>
                  </Card>

                  <Card className="bg-[linear-gradient(180deg,_rgba(20,184,166,0.12),_rgba(255,255,255,0.92))]">
                    <p className="text-sm font-medium text-[var(--ink-500)]">
                      Ước tính chi phí
                    </p>
                    <p className="mt-2 font-display text-3xl font-semibold text-[var(--brand-700)]">
                      {formatCurrencyVnd(estimatedTotal)}
                    </p>
                    <p className="text-sm text-[var(--ink-500)]">
                      Giá cuối cùng có thể thay đổi theo hiện trạng thực tế.
                    </p>
                  </Card>
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

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep((current) => Math.max(current - 1, 0))}
                disabled={step === 0 || isPending}
              >
                Quay lại
              </Button>

              {step < steps.length - 1 ? (
                <Button type="button" onClick={goNextStep} disabled={isPending}>
                  Tiếp tục
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Đang gửi yêu cầu..." : "Gửi yêu cầu cứu hộ"}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="space-y-4 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(239,246,245,0.95))]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-teal-100 p-3 text-teal-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-[var(--ink-900)]">Tóm tắt hiện tại</p>
              <p className="text-sm text-[var(--ink-500)]">
                Cập nhật theo dữ liệu bạn đang nhập
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-[var(--ink-600)]">
            <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-3">
              <p className="font-medium text-[var(--ink-900)]">Phương tiện</p>
              <p>
                {selectedVehicle
                  ? `${selectedVehicle.brand} ${selectedVehicle.model} · ${selectedVehicle.licensePlate}`
                  : "Chưa chọn phương tiện"}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-3">
              <p className="font-medium text-[var(--ink-900)]">Dịch vụ</p>
              <p>{formatServiceName(watchedServiceKey)}</p>
              {isFuelService ? (
                <p>
                  {watchedFuelLiters} lít {watchedFuelDetails?.fuelType}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-3">
              <p className="font-medium text-[var(--ink-900)]">Vị trí</p>
              <p>{watchedLocation?.label}</p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--brand-600)]" />
                {Number(watchedLocation?.latitude ?? 0).toFixed(5)},{" "}
                {Number(watchedLocation?.longitude ?? 0).toFixed(5)}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--sand-50)] px-4 py-3">
              <p className="font-medium text-[var(--ink-900)]">Giá dự kiến</p>
              <p className="font-semibold text-[var(--brand-700)]">
                {formatCurrencyVnd(estimatedTotal)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="text-sm font-medium text-[var(--ink-900)]">
            Trạng thái hỗ trợ sau khi gửi
          </p>
          <div className="space-y-2">
            {Object.entries(REQUEST_STATUS_META).map(([status, meta]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-2xl bg-[var(--sand-50)] px-4 py-3 text-sm"
              >
                <span className="text-[var(--ink-600)]">{meta.label}</span>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
