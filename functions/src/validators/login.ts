import { z } from "zod";

export const loginSchema = z.object({
  // optinal device field to determine if cookies should be set
  device: z.string().optional(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email"),
  password: z.string({ required_error: "Password is required" }),
  // Form values often arrive as strings ("true"/"false"). Coerce to boolean so validation succeeds
  rememberMe: z.coerce.boolean().optional(),
  // token: z.string().optional(),
});
