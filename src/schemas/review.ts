import { z } from "zod";

const ratingField = z.coerce
  .number()
  .int()
  .min(1, "Đánh giá tối thiểu là 1 sao.")
  .max(5, "Đánh giá tối đa là 5 sao.");

export const reviewFormSchema = z.object({
  overallRating: ratingField,
  professionalismRating: ratingField,
  arrivalSpeedRating: ratingField,
  serviceQualityRating: ratingField,
  communicationRating: ratingField,
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});
