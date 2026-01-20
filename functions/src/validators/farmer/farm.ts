import { z } from "zod";

const nonEmpty = (name: string) =>
  z
    .string({ required_error: `${name} is required` })
    .trim()
    .min(1, `${name} is required`);

export const farmSchema = z.object({
  state: nonEmpty("State"),
  lga: nonEmpty("lga"),
  town: nonEmpty("town"),
  district: z.string().trim().optional(),
  landmark: nonEmpty("landmark"),
  numCrops: z.number().int().min(0, "numCrops must be a positive integer"),
  farmSize: z.preprocess(
    (val) => {
      if (typeof val === "string")
        return val.trim() === "" ? undefined : Number(val);
      return val;
    },
    z
      .number({ required_error: "Farm size is required" })
      .gt(0, { message: "farmSize must be a positive number" }),
  ),
  unitId: z.string().uuid({ message: "Invalid unit ID" }),
  verified: z.boolean().optional(),
});
