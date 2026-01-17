import { z } from "zod";
import { unitTypes } from "../models/v1/farmer/Unit";

export const unitSchema = z.object({
  _id: z.string().uuid().optional(),

  type: z.enum(unitTypes, {
    message: "Invalid unit type",
    required_error: "Unit type is required",
  }),

  unit: z
    .string({ required_error: "Unit is required" })
    .trim()
    .min(1, "Unit is required")
    .max(50, "Unit must be at most 50 characters"),
});
