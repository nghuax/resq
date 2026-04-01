import { z } from "zod";

export const savedAddressSchema = z.object({
  label: z.string().trim().min(1, "Vui lòng nhập nhãn địa chỉ.").max(60),
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
  isDefault: z.boolean().default(false),
});
