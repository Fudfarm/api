import { z } from "zod";
// 🔐 Combined regex
export const PASSWORD_REGEX = new RegExp(
  "^[a-zA-Z0-9]{6,6}$"
);

export const pinSchema = z
  .object({
    // allow undefined, null, or an empty string to represent "no password"
    password: z.string({ required_error: "Password is required" }).min(2, {
      message: "Password must be at least 2 characters long",
    }),

    newPin: z
      .string({ required_error: "New pin is required" })
      .min(6, { message: "Must be 6 characters long" })
      .max(6, { message: "Must be 6 characters long" })
      .regex(PASSWORD_REGEX, "Invalid pin format"),

    confirmPin: z
      .string({ required_error: "Confirm pin is required" })
      .regex(PASSWORD_REGEX, "Invalid pin format"),
  })
  .refine((data) => data.newPin === data.confirmPin, {
    message: "Pins do not match",
    path: ["confirmPin"],
  });
