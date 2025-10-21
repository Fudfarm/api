import { z } from "zod";
import { isAtLeastAge } from "../../function/function1";
import { maritalStatuses } from "../../function/variables";

// Mobile validation rules:
// surname & firstname: non-empty, letters and hyphen, 2-30 chars
// othernames: empty allowed or letters/spaces/hyphen 2-60 chars
// gender, maritalStatus, birthdate: required non-empty strings
// noOfFamily: numeric integer > 0
// disease: optional string, max 300 chars

const nameRegex = /^[ ]*[a-zA-Z-]{2,30}[ ]*$/;
const noOfFamilyRegex = /^[0-9]{1,4}$/;
const othernamesRegex = /^[ ]*[a-zA-Z- ]{2,60}[ ]*$/;

export const biodataSchema = z.object({
  surname: z
    .string({ required_error: "Surname is required" })
    .trim()
    .min(1, "Surname is required")
    .max(30, "Surname must be at most 30 characters")
    .regex(nameRegex, "Surname must contain only letters and hyphens"),

  firstname: z
    .string({ required_error: "First name is required" })
    .trim()
    .min(1, "First name is required")
    .max(30, "First name must be at most 30 characters")
    .regex(nameRegex, "First name must contain only letters and hyphens"),

  othernames: z
    .string()
    .trim()
    .max(60, "Other name must be at most 60 characters")
    .regex(
      othernamesRegex,
      "Other name can include up to 2 words using letters and hyphens only"
    )
    .optional()
    .or(z.literal("")),

  gender: z.enum(["M", "F"], { required_error: "Gender is required" }),

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

  noOfFamily: z
    .string({ required_error: "Number of family members is required" })
    .refine((n) => noOfFamilyRegex.test(n) && parseInt(n, 10) > 0, {
      message: "Invalid number of family members",
    }),

  disease: z.string().max(300).optional(),
});
