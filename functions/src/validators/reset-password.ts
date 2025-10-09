import { z } from "zod";
import { PASSWORD_ERROR, PASSWORD_REGEX } from "./register";

export const resetPasswordSchema = z
  .object({
    // id or email. Only one of them is required. You have to make both optional
    id: z
      .string()
      .uuid("Invalid id format")
      .optional(),

    email: z
      .string()
      .email("Invalid email")
      .optional(),

    newPassword: z
      .string({ required_error: "New password is required" })
      .regex(PASSWORD_REGEX, PASSWORD_ERROR),

    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .regex(PASSWORD_REGEX, PASSWORD_ERROR),

    token: z
      .string()
      .trim()
      .min(8, "At least 8 characters long")
      .max(8, "At most 8 characters long")
      .toLowerCase(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
