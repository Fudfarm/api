import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { SubmissionStatus } from "../../../../models/v1/farmer";
import { farmerBusinessType } from "./business_type";

export const getFarmerImage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const submission = await SubmissionStatus.findOne({ recordID: id }).lean();
    if (!submission)
      return res.status(404).json({ message: "Record not found" });

    return res.status(200).json({
      message: "Record info retrieved",
      data: await ImageStatusResponse(submission),
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving record info");
  }
};

/**
 * Format submission status response
 * @param {any} submission - submission data
 * @return {Promise<any>} Formatted submission status response
 */
export async function ImageStatusResponse(submission: any): Promise<any> {
  return {
    userId: submission.recordID,

    isImage: submission.isImage,

    createdAt: submission.createdAt
      ? formatDateToShort(submission.createdAt.toISOString(), { includeTime: true })
      : undefined,
    updatedAt: submission.updatedAt
      ? formatDateToShort(submission.updatedAt.toISOString(), { includeTime: true })
      : undefined,

    businessType: await farmerBusinessType(submission.recordID), // determine buttons shown in frontend
  };
}
