import { z } from "zod";

export const otherFarmInfoSchema = z.object({
  numCrops: z.preprocess((val) => {
    if (typeof val === "string") return val.trim() === "" ? undefined : Number(val);
    return val;
  },
  z
    .number({ required_error: "Number of crops is required" })
    .gte(0, { message: "Number of crops should zero or more" })
  ),
  numLivestock: z.preprocess((val) => {
    if (typeof val === "string") return val.trim() === "" ? undefined : Number(val);
    return val;
  },
  z
    .number({ required_error: "Number of livestock is required" })
    .gte(0, { message: "Number of livestock should be zero or more" })
  ),
  annualHarvest: z.string().trim().min(1, "Annual harvest is required").optional(),
  yearsExperience: z.preprocess((val) => {
    if (typeof val === "string") return val.trim() === "" ? undefined : Number(val);
    return val;
  },
  z
    .number({ required_error: "Years of experience is required" })
    .gte(0, { message: "Years of experience should be zero or more" })
  ),
  challenges: z.string().trim().optional(),
});
