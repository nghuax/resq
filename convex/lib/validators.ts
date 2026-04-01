// @ts-nocheck
import { v } from "convex/values";

export const userRoleValidator = v.union(
  v.literal("customer"),
  v.literal("fixer"),
  v.literal("admin"),
);

export const sessionStatusValidator = v.union(
  v.literal("active"),
  v.literal("revoked"),
  v.literal("expired"),
);

export const vehicleTypeValidator = v.union(
  v.literal("motorbike"),
  v.literal("car"),
  v.literal("truck"),
  v.literal("van"),
);

export const fuelTypeValidator = v.union(
  v.literal("gasoline"),
  v.literal("diesel"),
  v.literal("electric"),
  v.literal("hybrid"),
  v.literal("unknown"),
);

export const requestStatusValidator = v.union(
  v.literal("submitted"),
  v.literal("processing"),
  v.literal("fixer_matched"),
  v.literal("fixer_on_the_way"),
  v.literal("arrived"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("cancelled"),
);

export const paymentMethodValidator = v.union(
  v.literal("cash"),
  v.literal("ewallet"),
  v.literal("card"),
  v.literal("bank_transfer"),
);

export const paymentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("failed"),
  v.literal("refunded"),
);

export const notificationTypeValidator = v.union(
  v.literal("request_update"),
  v.literal("system"),
  v.literal("payment"),
  v.literal("otp"),
);

export const notificationChannelValidator = v.union(
  v.literal("app"),
  v.literal("sms"),
  v.literal("email"),
);
