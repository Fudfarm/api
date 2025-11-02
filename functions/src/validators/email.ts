import { z } from "zod";

export const emailSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email"),
  turnstileToken: z.string().optional(),
});
