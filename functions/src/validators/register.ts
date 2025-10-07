import { z } from "zod";

const LOWERCASE = "(?=.*[a-z])"; // at least one lowercase letter
const UPPERCASE = "(?=.*[A-Z])"; // at least one uppercase letter
const NUMBER = "(?=.*[0-9])"; // at least one number
const SPECIAL = "(?=.*[^a-zA-Z0-9])"; // at least one special character
const MIN_LENGTH = ".{8,}"; // at least 8 characters

// 🔐 Combined regex
export const PASSWORD_REGEX = new RegExp(
  `^${LOWERCASE}${UPPERCASE}${NUMBER}${SPECIAL}${MIN_LENGTH}$`
);

export const PASSWORD_ERROR =
  "Password must be at least 8 characters and include " +
  "uppercase, lowercase, number, and special character";

export const registerSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase(),

  password: z
    .string({ required_error: "Password is required" })
    .regex(PASSWORD_REGEX, PASSWORD_ERROR),

  name: z.object(
    {
      first: z.string().trim().min(1, "First name is required"),
      last: z.string().trim().min(1, "Last name is required"),
    },
    {
      required_error: "Name is required",
    }
  ),

  countryCode: z
    .string({ required_error: "Country code is required" })
    .trim()
    .min(2, "Country code must be at least 2 characters")
    .max(3, "Country code must be at most 3 characters")
    .toUpperCase(),

  phone: z.string().optional(),

  settings: z
    .object({
      theme: z
        .enum(["light", "dark"], {
          invalid_type_error: "Theme must be 'light' or 'dark'",
        })
        .optional(),
      language: z
        .string()
        .min(2, "Language code must be at least 2 characters")
        .optional(),
    })
    .optional(),
});
