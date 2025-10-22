import { z } from "zod";

const nonEmpty = (name: string) =>
  z.string({ required_error: `${name} is required` }).trim().min(1, `${name} is required`);

export const shopLocationSchema = z.object({
  state: nonEmpty("State"),
  lga: nonEmpty("lga"),
  town: nonEmpty("town"),
  district: nonEmpty("district"),
  landmark: nonEmpty("landmark"),
  verified: z.boolean().optional(),
});
