import { z } from "zod";

export const loginSchema = z.object({
  // optinal device field to determine if cookies should be set
  device: z.string().optional(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email"),
  password: z.string({ required_error: "Password is required" }),
});
