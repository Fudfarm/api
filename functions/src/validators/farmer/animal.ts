import { z } from "zod";

export const animalSchema = z.object({
  animal: z.string().trim().min(1, "Animal is required"),
  quantity: z.preprocess(
    (val) => {
      if (typeof val === "string")
        return val.trim() === "" ? undefined : Number(val);
      return val;
    },
    z
      .number({ required_error: "Quantity is required" })
      .gt(0, { message: "Quantity must be a positive number" }),
  ),
  unitId: z.string().uuid({ message: "Invalid unit ID" }),
});
