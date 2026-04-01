import { env } from "@/lib/env";
import { generateOtpCode } from "@/lib/utils";

type OtpRecord = {
  code: string;
  expiresAt: number;
  attempts: number;
};

const OTP_TTL_MS = 5 * 60 * 1000;

declare global {
  var resqOtpStore: Map<string, OtpRecord> | undefined;
}

function getStore() {
  if (!globalThis.resqOtpStore) {
    globalThis.resqOtpStore = new Map();
  }

  return globalThis.resqOtpStore;
}

export function createOtpChallenge(phone: string) {
  const code =
    process.env.NODE_ENV === "production"
      ? generateOtpCode()
      : env.OTP_DEV_FALLBACK_CODE;

  getStore().set(phone, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });

  return {
    code,
    expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
  };
}

export function verifyOtpChallenge(phone: string, otp: string) {
  const record = getStore().get(phone);

  if (!record) {
    return { ok: false, reason: "Không tìm thấy OTP. Vui lòng gửi lại mã." };
  }

  if (record.expiresAt < Date.now()) {
    getStore().delete(phone);
    return { ok: false, reason: "Mã OTP đã hết hạn." };
  }

  if (record.attempts >= 5) {
    getStore().delete(phone);
    return { ok: false, reason: "Bạn đã nhập sai quá nhiều lần." };
  }

  record.attempts += 1;
  getStore().set(phone, record);

  if (record.code !== otp) {
    return { ok: false, reason: "Mã OTP chưa chính xác." };
  }

  getStore().delete(phone);
  return { ok: true };
}
