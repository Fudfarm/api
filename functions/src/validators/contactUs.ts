import { z } from "zod";

export const contactUsSchema = z.object({
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

  title: z
    .string({ required_error: "Title is required" })
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must be at most 100 characters long"),

  body: z
    .string({ required_error: "Message body is required" })
    .min(10, "Message must be at least 10 characters long")
    .max(2500, "Message must be at most 2500 characters long"),
});
