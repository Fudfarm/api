import { z } from "zod";

export const businessTypeSchema = z
  .object({
    isFarmer: z.boolean().optional(),
    isSeller: z.boolean().optional(),
  })
  .refine((obj) => !!obj.isFarmer || !!obj.isSeller, {
    message: "This farmer must be at least a farmer or a seller",
    path: ["isFarmer"],
  });
