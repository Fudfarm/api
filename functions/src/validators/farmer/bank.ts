import { z } from "zod";

const tenDigits = /^[0-9]{10}$/;

export const bankSchema = z.object({
  bank: z.string().trim().min(1, "bank is required"),
  accountName: z.string().trim().min(1, "accountName is required"),
  accountNumber: z
    .string()
    .trim()
    .regex(tenDigits, { message: "accountNumber must be exactly 10 digits" }),
});
