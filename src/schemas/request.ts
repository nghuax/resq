import { z } from "zod";

import { SERVICE_CATALOG } from "@/lib/constants";
import { phoneSchema } from "@/schemas/auth";
import { fuelTypeSchema, vehicleFormSchema } from "@/schemas/vehicle";

export const serviceTypeKeySchema = z.enum(
  SERVICE_CATALOG.map((service) => service.key) as [
    (typeof SERVICE_CATALOG)[number]["key"],
    ...(typeof SERVICE_CATALOG)[number]["key"][],
  ],
);

export const requestStatusSchema = z.enum([
  "submitted",
  "processing",
  "fixer_matched",
  "fixer_on_the_way",
  "arrived",
  "in_progress",
  "completed",
  "cancelled",
]);

export const requestFuelDetailsSchema = z.object({
  fuelType: fuelTypeSchema,
  litersRequested: z.coerce
    .number()
    .positive("Số lít cần lớn hơn 0.")
    .max(200, "Số lít yêu cầu quá lớn cho MVP."),
  preferredGrade: z.string().trim().max(60).optional().or(z.literal("")),
});

export const requestLocationSchema = z.object({
  savedAddressId: z.string().trim().optional(),
  label: z.string().trim().min(1, "Vui lòng nhập tên điểm đón.").max(80),
  addressLine: z.string().trim().min(1, "Vui lòng nhập địa chỉ.").max(160),
  ward: z.string().trim().min(1, "Vui lòng nhập phường/xã.").max(80),
  district: z.string().trim().min(1, "Vui lòng nhập quận/huyện.").max(80),
  cityProvince: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tỉnh/thành phố.")
    .max(80),
  landmark: z.string().trim().max(160).optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  saveAsAddress: z.boolean().default(false),
  saveLabel: z.string().trim().max(60).optional().or(z.literal("")),
});

export const createRequestSchema = z
  .object({
    vehicleId: z.string().trim().min(1, "Vui lòng chọn phương tiện."),
    serviceTypeKey: serviceTypeKeySchema,
    fuelDetails: requestFuelDetailsSchema.optional(),
    location: requestLocationSchema,
    note: z.string().trim().max(1000).optional().or(z.literal("")),
    contactPhone: phoneSchema,
    scheduledAt: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) => !value || !Number.isNaN(new Date(value).getTime()),
        "Thời gian hẹn chưa hợp lệ.",
      ),
    photoNames: z.array(z.string().trim().min(1).max(120)).max(5).optional(),
  })
  .superRefine((data, ctx) => {
    const needsFuel =
      data.serviceTypeKey === "refill_gasoline" ||
      data.serviceTypeKey === "refill_diesel";

    if (needsFuel && !data.fuelDetails) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fuelDetails"],
        message: "Vui lòng nhập thông tin nhiên liệu cần tiếp.",
      });
    }

    if (data.location.saveAsAddress && !data.location.saveLabel?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["location", "saveLabel"],
        message: "Vui lòng nhập nhãn khi lưu địa chỉ.",
      });
    }
  });

export const requestHelpWizardSchema = z.object({
  vehicleId: z.string().trim().optional(),
  inlineVehicle: vehicleFormSchema.optional(),
  serviceTypeKey: serviceTypeKeySchema,
  fuelDetails: requestFuelDetailsSchema.optional(),
  location: requestLocationSchema,
  note: z.string().trim().max(1000).optional().or(z.literal("")),
  contactPhone: phoneSchema,
  scheduledAt: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(new Date(value).getTime()),
      "Thời gian hẹn chưa hợp lệ.",
    ),
  photoNames: z.array(z.string()).max(5).optional(),
});

export const cancelRequestSchema = z.object({
  reason: z.string().trim().max(240).optional().or(z.literal("")),
});
