import { z } from "zod";
import { USER_ROLES } from "../../interface/user";
import { maritalStatuses } from "../../function/variables";
import { isAtLeastAge } from "../../function/function1";

export const onboardSchema = z.object({
  surname: z
    .string({ required_error: "Surname is required" })
    .trim()
    .min(1, "Surname is required")
    .max(30, "Surname must be at most 30 characters")
    .regex(/^[a-zA-Z-]+$/, "Surname must contain only letters and hyphens"),

  firstname: z
    .string({ required_error: "First name is required" })
    .trim()
    .min(1, "First name is required")
    .max(30, "First name must be at most 30 characters")
    .regex(/^[a-zA-Z-]+$/, "First name must contain only letters and hyphens"),

  othername: z
    .string()
    .trim()
    .max(60, "Other name must be at most 60 characters")
    .regex(
      /^([a-zA-Z-]+\s?){0,2}$/,
      "Other name can include up to 2 words using letters and hyphens only"
    )
    .optional()
    .or(z.literal("")),

  gender: z.enum(["M", "F"], {
    required_error: "Gender is required",
  }),

  maritalStatus: z.enum(maritalStatuses, {
    message: "Invalid marital status",
    required_error: "Marital status is required",
  }),

  birthdate: z
    .string({ required_error: "Date of birth is required" })
    .date("Invalid date format")
    .refine((date) => isAtLeastAge(date, 10), {
      message: "You must be at least 10 years old to apply",
    }),

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email"),

  phone: z
    .string({ required_error: "Phone number is required" })
    .min(11, "Phone number must be at least 11 digits")
    .regex(/^[0][7-9][0-9]{9}$/, "Phone number must contain only digits"),

  otherInfo: z
    .string()
    .max(500, "Other information must be at most 500 characters")
    .optional()
    .or(z.literal("")),

  role: z.enum(USER_ROLES, {
    required_error: "Role is required",
    invalid_type_error: "Role must be one of the predefined roles",
  }),
});
