import { FUEL_TYPE_OPTIONS, PAYMENT_METHOD_OPTIONS, REQUEST_STATUS_META, SERVICE_CATALOG, VEHICLE_TYPE_OPTIONS } from "@/lib/constants";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
});

export function formatCurrencyVnd(value: number) {
  return currencyFormatter.format(value);
}

export function formatDateTimeVi(value: string | Date | null | undefined) {
  if (!value) {
    return "Chưa có";
  }

  return dateTimeFormatter.format(new Date(value));
}

export function formatDateVi(value: string | Date | null | undefined) {
  if (!value) {
    return "Chưa có";
  }

  return dateFormatter.format(new Date(value));
}

export function formatVehicleType(value: string) {
  return (
    VEHICLE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

export function formatFuelType(value: string) {
  return FUEL_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function formatPaymentMethod(value: string) {
  return (
    PAYMENT_METHOD_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

export function formatStatus(value: keyof typeof REQUEST_STATUS_META | string) {
  return REQUEST_STATUS_META[value as keyof typeof REQUEST_STATUS_META]?.label ?? value;
}

export function formatServiceName(serviceKey: string) {
  return (
    SERVICE_CATALOG.find((service) => service.key === serviceKey)?.nameVi ??
    serviceKey
  );
}
