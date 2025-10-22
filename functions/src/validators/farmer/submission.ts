import { z } from "zod";
import { STATUS_LIST } from "../../interface/farmer/submissionStatus";

// Ensure STATUS_LIST is a tuple type
export const submissionSchema = z.object({
  status: z.enum(STATUS_LIST as [string, ...string[]], { required_error: "Status is required" }),
  comments: z.string()
    .min(2, { message: "Minimum of 2" })
    .max(1000, { message: "Max of 1000" }).optional(),
});
