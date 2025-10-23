import { z } from "zod";

export const cropSchema = z.object({
  crop: z.string().trim().min(1, "Crop is required"),
  quantity: z.preprocess((val) => {
    if (typeof val === "string") return val.trim() === "" ? undefined : Number(val);
    return val;
  },
  z
    .number({ required_error: "Quantity is required" })
    .gt(0, { message: "Quantity must be a positive number" })
  ),
  unit: z.string().trim().min(1, "Unit is required"),
});
