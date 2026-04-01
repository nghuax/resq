import { z } from "zod";

export const vehicleTypeSchema = z.enum(["motorbike", "car", "truck", "van"]);
export const fuelTypeSchema = z.enum([
  "gasoline",
  "diesel",
  "electric",
  "hybrid",
  "unknown",
]);

const currentYear = new Date().getFullYear() + 1;

export const carRegistrationSchema = z.object({
  registrationNumber: z.string().trim().max(50).optional().or(z.literal("")),
  ownerName: z.string().trim().max(120).optional().or(z.literal("")),
  registrationProvinceCity: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal("")),
  inspectionExpiryDate: z.string().optional().or(z.literal("")),
  chassisNumber: z.string().trim().max(80).optional().or(z.literal("")),
  engineNumber: z.string().trim().max(80).optional().or(z.literal("")),
});

export const vehicleFormSchema = z.object({
  vehicleType: vehicleTypeSchema,
  brand: z.string().trim().min(1, "Vui lòng nhập hãng xe.").max(80),
  model: z.string().trim().min(1, "Vui lòng nhập dòng xe.").max(80),
  licensePlate: z
    .string()
    .trim()
    .min(4, "Vui lòng nhập biển số xe.")
    .max(20),
  year: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce
      .number()
      .int()
      .min(1950, "Năm sản xuất chưa hợp lệ.")
      .max(currentYear, "Năm sản xuất chưa hợp lệ.")
      .optional(),
  ),
  fuelType: fuelTypeSchema,
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  isDefault: z.boolean().default(false),
  carRegistration: carRegistrationSchema.optional(),
});

export const updateCarRegistrationSchema = carRegistrationSchema;
