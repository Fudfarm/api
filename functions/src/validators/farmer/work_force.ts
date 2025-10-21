import { z } from "zod";

export const workForceSchema = z.object({
  labourType: z.enum([
    "Permanent", "Seasonal", "Contract", "Family", "Mixed", "Other",
  ], {
    required_error: "Labour type is required",
    invalid_type_error: "Labour type must be one of the predefined types",
  }),
  staffSize: z.preprocess((val) => {
    if (typeof val === "string") return val.trim() === "" ? undefined : Number(val);
    return val;
  },
  z
    .number({ required_error: "Staff size is required" })
    .gte(0, { message: "Staff size should be zero or more" })
  ),
});
