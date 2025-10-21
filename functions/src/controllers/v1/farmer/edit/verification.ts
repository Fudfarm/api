import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { Verification } from "../../../../models/v1/farmer";

export const editFarmerVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const data = req.body;

    const verification = await Verification.findOneAndUpdate(
      { recordID: id },
      { $set: {
        bvn: data.bvn,
        nin: data.nin,
        businessName: data.businessName,
        businessNumber: data.businessNumber,
        otherType: data.otherType,
        otherNumber: data.otherNumber,
      } },
      { new: true },
    ).lean();
    if (!verification) return res.status(404).json({ message: "Verification record not found" });

    return res.status(200).json({ message: "Verification updated", data: verification });
  } catch (error) {
    return handleError(error, res, "Error updating verification");
  }
};
