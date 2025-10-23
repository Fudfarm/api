import { z } from "zod";

export const shopItemSchema = z.object({
  // recordID is optional
  recordID: z.string().uuid().optional(),

  item: z.string().trim().min(1, "Item is required"),
  quantity: z.number().int().min(0, "Quantity must be a positive integer").optional(),
  category: z.enum(["Crop", "Animal", "Equipment", "Other"]),
  verified: z.boolean().optional(),
});
