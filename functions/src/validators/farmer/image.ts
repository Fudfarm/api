import { z } from "zod";

export const imageSchema = z
  .object({
    image: z.boolean().optional(),
  });
