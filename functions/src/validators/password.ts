import { z } from "zod";

/**
 * Schema to validate a password payload
 */
export const passwordSchema = z.object({
  password: z.string({ required_error: "Password is required" }),
});
