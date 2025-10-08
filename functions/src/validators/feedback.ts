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

  receiveFeedback: z.boolean(),
  rating: z.number().min(1).max(5),
  type: z.enum(["System Error", "Update Required", "Compliment"]),

  image1: z.string().optional(),
  image2: z.string().optional(),
});
