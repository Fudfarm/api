import { z } from "zod";
import { PASSWORD_ERROR, PASSWORD_REGEX } from "./register";

export const authPasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required" }),

    newPassword: z
      .string({ required_error: "New password is required" })
      .regex(PASSWORD_REGEX, PASSWORD_ERROR),

    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .regex(PASSWORD_REGEX, PASSWORD_ERROR),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
