import { z } from "zod";

export const feedbackSchema = z.object({
  fullname: z
    .string({ required_error: "Full name is required" })
    .min(3, "Full name must be at least 3 characters long"),

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address"),

  phone: z
    .string({ required_error: "Phone number is required" })
    .min(11, "Phone number must be at least 11 digits")
    .regex(/^[0][7-9][0-9]{9}$/, "Phone number must contain only digits"),

  body: z
    .string({ required_error: "Message body is required" })
    .min(10, "Message must be at least 10 characters long")
    .max(2500, "Message must be at most 2500 characters long"),

  // Coerce string 'true'/'false' to boolean
  receiveFeedback: z
    .string({ required_error: "Required" })
    .transform((val) => val === "true"),

  // Coerce string numbers to actual numbers
  rating: z
    .string({ required_error: "Required" })
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 5, "Rating must be between 1 and 5"),

  type: z
    .string({ required_error: "Required" })
    .refine(
      (val) => ["System Error", "Update Required", "Compliment"].includes(val),
      "Type must be one of System Error, Update Required, Compliment"
    ),
});
