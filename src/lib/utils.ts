import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const FUEL_SERVICE_KEYS = new Set(["refill_gasoline", "refill_diesel"]);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function normalizeVietnamesePhone(phone: string) {
  const trimmed = phone.replace(/\s+/g, "");

  if (trimmed.startsWith("+84")) {
    return `0${trimmed.slice(3)}`;
  }

  if (trimmed.startsWith("84") && trimmed.length >= 11) {
    return `0${trimmed.slice(2)}`;
  }

  return trimmed;
}

export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isFuelServiceKey(serviceKey: string) {
  return FUEL_SERVICE_KEYS.has(serviceKey);
}

export function generateRequestCode(date = new Date()) {
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(100 + Math.random() * 900));

  return `RSQ-${y}${m}${d}-${rand}`;
}

export function coerceOptionalString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}
