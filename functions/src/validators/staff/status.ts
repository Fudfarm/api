import { z } from "zod";
import { USER_STATUSES } from "../../interface/user";

export const userSchema = z.object({
  status: z.enum(USER_STATUSES, {
    required_error: "Status is required",
    invalid_type_error: "Status must be one of the predefined statuses",
  }),
});
