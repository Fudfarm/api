import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { SubmissionStatus } from "../../../../models/v1/farmer";
import { SubmissionStatusResponse } from "../details/submission";

export const updateConsentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const data = req.body;

    const sub = await SubmissionStatus.findOneAndUpdate(
      { recordID: id },
      { $set: {
        isConsent: data.isConsent,
      } },
      { new: true },
    ).lean();

    if (!sub) return res.status(404).json({ message: "Submission record not found" });

    return res.status(200).json({
      message: "Consent status updated",
      data: await SubmissionStatusResponse(sub),
    });
  } catch (error) {
    return handleError(error, res, "Error updating consent status");
  }
};
