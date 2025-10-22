import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { SubmissionStatus } from "../../../../models/v1/farmer";
import { SubmissionStatusResponse } from "../details/submission";

export const updateFarmerRecordStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const data = req.body;

    const prev = await SubmissionStatus.findOne({ recordID: id }).lean();
    if (!prev) return res.status(404).json({ message: "Submission record not found" });

    if (prev.status === data.status) {
      return res.status(400).json({ message: `Status is already set to ${data.status}` });
    }

    const updatedData: { status: any; comments: any; approvedBy?: any; rejectedBy?: any } = {
      status: data.status,
      comments: data.comments,
    };

    if (data.status === "Approved") {
      updatedData.approvedBy = req.user?.id;
      updatedData.rejectedBy = ""; // clear rejectedBy if approved
    } else if (data.status === "Rejected") {
      updatedData.approvedBy = ""; // clear approvedBy if rejected
      updatedData.rejectedBy = req.user?.id;
    }

    const sub = await SubmissionStatus.findOneAndUpdate(
      { recordID: id },
      { $set: updatedData },
      { new: true },
    ).lean();

    if (!sub) return res.status(404).json({ message: "Submission record not found" });

    return res.status(200).json({
      message: "Submission updated",
      data: await SubmissionStatusResponse(sub),
    });
  } catch (error) {
    return handleError(error, res, "Error updating submission");
  }
};
