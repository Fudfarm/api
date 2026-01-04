import { z } from "zod";
// 🔐 Combined regex
export const PASSWORD_REGEX = new RegExp(
  "^[a-zA-Z0-9]{6}$"
);

export const pinShowSchema = z
  .object({
    showUserId: z.string({
      required_error: "User ID is required",
    })
      .uuid({
        message: "Invalid User ID format",
      }),

    password: z.string({ required_error: "Password is required" }),
  });
