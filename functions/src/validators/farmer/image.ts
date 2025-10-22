import { z } from "zod";

export const imageSchema = z
  .object({
    isImage: z.boolean().optional(),
  });
