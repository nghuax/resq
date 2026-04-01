import { z } from "zod";

export const updateFixerJobStatusSchema = z.object({
  status: z.enum([
    "fixer_on_the_way",
    "arrived",
    "in_progress",
    "completed",
  ]),
  note: z.string().trim().max(240).optional().or(z.literal("")),
  etaMinutes: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().min(0).max(720).optional(),
  ),
});
