import { z } from "zod";

export const occupationSchema = z.object({
  primaryOccupation: z.string().trim().min(1, "PrimaryOccupation is required"),
  secondaryOccupation: z.string().trim().optional(),
  yearsExperience: z.preprocess((val) => {
    if (typeof val === "string") return val.trim() === "" ? undefined : Number(val);
    return val;
  }, z.number().int().min(0, "Years Experience must be a non-negative integer")),
});
