import { z } from "zod";

export const videoSchema = z
  .object({
    isConsent: z.boolean().optional(),
  });
