import { z } from "zod";

import { requestStatusSchema } from "@/schemas/request";

export const assignFixerSchema = z.object({
  fixerUserId: z.string().trim().min(1, "Vui lòng chọn fixer."),
});

export const updateAdminRequestStatusSchema = z.object({
  status: requestStatusSchema,
  note: z.string().trim().max(240).optional().or(z.literal("")),
  etaMinutes: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().min(0).max(720).optional(),
  ),
});
