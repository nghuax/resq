import { z } from "zod";

export const paymentMethodSchema = z.enum([
  "cash",
  "ewallet",
  "card",
  "bank_transfer",
]);

export const payRequestSchema = z.object({
  method: paymentMethodSchema,
});
