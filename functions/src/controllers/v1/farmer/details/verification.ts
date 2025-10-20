import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { Verification } from "../../../../models/v1/farmer";
import { farmerBusinessType } from "./business_type";

export const getFarmerVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const verification = await Verification.findOne({ recordID: id }).lean();
    if (!verification) return res.status(404).json({ message: "Farmer verification not found" });

    return res.status(200).json({
      message: "Verification retrieved",
      data: {
        userId: verification.recordID,
        bvn: verification.bvn,
        nin: verification.nin,
        businessName: verification.businessName,
        businessNumber: verification.businessNumber,
        otherType: verification.otherType,
        otherNumber: verification.otherNumber,
        createdAt: verification.createdAt
          ? formatDateToShort(verification.createdAt.toISOString(), { includeTime: true })
          : undefined,
        updatedAt: verification.updatedAt
          ? formatDateToShort(verification.updatedAt.toISOString(), { includeTime: true })
          : undefined,
        businessType: await farmerBusinessType(id), // determine buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving verification");
  }
};
