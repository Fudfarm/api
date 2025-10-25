import { Response } from "express";
import { handleError } from "../../../../function/error";
import { renameStorageFile } from "../../../../function/firebase/storage";
import { formatDateToShort } from "../../../../function/function3";
import { SERVER } from "../../../../function/variables";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { SubmissionStatus } from "../../../../models/v1/farmer";
import User from "../../../../models/v1/User";
import { farmerBusinessType } from "./business_type";

export const getFarmerConsent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const submission = await SubmissionStatus.findOne({ recordID: id }).lean();
    if (!submission)
      return res.status(404).json({ message: "Record not found" });

    const user = await User.findById(id).select("offlineID").lean();
    if (!user)
      return res.status(404).json({ message: "User record not found" });

    // some images exist in firebase storage with offlineID as identifier
    // this is because they failed to upload at the time of submission
    // and they use the offlineID as identifier
    // they look like this: <uuid>_offline.png
    // e.g. 24491377-6da3-4584-9bb8-4c4b701c6f08_offline.png
    // we need to rename the image to use the user id as identifier
    const path = `${SERVER.FARMER_CONSENT_PATH}`;
    await renameStorageFile(
      `${path}/${user.offlineID}_offline.png`,
      `${path}/${id}.png`
    );

    return res.status(200).json({
      message: "Record info retrieved",
      data: await ConsentStatusResponse(submission),
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
export async function ConsentStatusResponse(submission: any): Promise<any> {
  return {
    userId: submission.recordID,

    isConsent: submission.isConsent,

    createdAt: submission.createdAt
      ? formatDateToShort(submission.createdAt.toISOString(), { includeTime: true })
      : undefined,
    updatedAt: submission.updatedAt
      ? formatDateToShort(submission.updatedAt.toISOString(), { includeTime: true })
      : undefined,

    businessType: await farmerBusinessType(submission.recordID), // determine buttons shown in frontend
  };
}
