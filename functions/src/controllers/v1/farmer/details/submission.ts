import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { SubmissionStatus } from "../../../../models/v1/farmer";
import { miniUserInfo } from "./biodata";
import { farmerBusinessType } from "./business_type";

export const getFarmerSubmission = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const submission = await SubmissionStatus.findOne({ recordID: id }).lean();
    if (!submission)
      return res.status(404).json({ message: "Farmer submission not found" });

    return res.status(200).json({
      message: "Submission info retrieved",
      data: {
        userId: id,

        isUpdated: submission.isUpdated,
        isConsent: submission.isConsent,
        isImage: submission.isImage,
        isSubmitted: submission.isSubmitted,
        submittedBy: await miniUserInfo({ userId: submission.submittedBy }),
        comments: submission.comments,
        approvedBy: await miniUserInfo({ userId: submission.approvedBy }),
        rejectedBy: await miniUserInfo({ userId: submission.rejectedBy }),

        createdAt: submission.createdAt
          ? formatDateToShort(submission.createdAt.toISOString(), { includeTime: true })
          : undefined,
        updatedAt: submission.updatedAt
          ? formatDateToShort(submission.updatedAt.toISOString(), { includeTime: true })
          : undefined,

        businessType: await farmerBusinessType(id), // determine buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving submission info");
  }
};
