import { z } from "zod";

export const videoSchema = z
  .object({
    video: z.boolean().optional(),
  });
