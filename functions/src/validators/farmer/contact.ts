import { z } from "zod";

// Mobile rules:
// - phone1/phone2: empty allowed or 10-15 digits
// - email: empty allowed or valid email
// - website: empty allowed or valid http(s) url
// - promoMeans1: required non-empty
// - promoMeans2: optional

const phoneRegex = /^[0-9]{10,15}$/;

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .refine((v) => v === undefined || v === "" || phoneRegex.test(v), {
    message: "Phone must be 10 to 15 digits or empty",
  });

const optionalEmail = z
  .string()
  .trim()
  .email({ message: "Invalid email address" })
  .optional();

const optionalWebsite = z
  .union([
    z.string().trim().url({ message: "Invalid website URL" }),
    z.literal(""),
    z.null(),
  ])
  .optional();

export const contactSchema = z.object({
  phone1: optionalPhone,
  phone2: optionalPhone,
  email: optionalEmail,
  website: optionalWebsite,
  promoMeans1: z.string().trim().min(1, "promoMeans1 is required"),
  promoMeans2: z.string().trim().optional(),
  others: z.string().trim().optional(),
});
