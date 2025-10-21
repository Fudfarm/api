import { z } from "zod";

const elevenDigits = /^[0-9]{11}$/;

export const verificationSchema = z
  .object({
    bvn: z
      .string({ required_error: "BVN is required" })
      .trim()
      .regex(elevenDigits, { message: "BVN must be 11 digits" }),

    nin: z
      .string()
      .trim()
      .optional()
      .refine((v) => v === undefined || v === "" || elevenDigits.test(v), {
        message: "NIN must be 11 digits if provided",
      }),

    businessName: z.string().trim().optional(),
    businessNumber: z.string().trim().optional(),

    otherType: z.string().trim().optional(),
    otherNumber: z.string().trim().optional(),
  })
  .superRefine((obj, ctx) => {
    // If businessNumber is present (non-empty), businessName must be present
    if (obj.businessNumber && obj.businessNumber.trim().length > 0) {
      if (!obj.businessName || obj.businessName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "businessName is required when businessNumber is provided",
          path: ["businessName"],
        });
      }
    }

    // otherType and otherNumber must both be present or both empty
    const otherTypeFilled = !!(obj.otherType && obj.otherType.trim().length > 0);
    const otherNumberFilled = !!(obj.otherNumber && obj.otherNumber.trim().length > 0);
    if (otherTypeFilled !== otherNumberFilled) {
      // Direct the error to appear under otherType (per request)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "otherType and otherNumber must both be provided or both empty",
        path: ["otherType"],
      });
    }
  });
