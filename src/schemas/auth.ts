import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(0|\+84|84)\d{9,10}$/, "Số điện thoại chưa đúng định dạng Việt Nam.");

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z
    .string()
    .trim()
    .length(6, "OTP phải gồm 6 chữ số.")
    .regex(/^\d{6}$/, "OTP chỉ gồm 6 chữ số."),
  name: z.string().trim().max(100).optional(),
});
