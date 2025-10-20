import { Response } from "express";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { formatDateToShort } from "../../../../function/function3";
import { handleError } from "../../../../function/error";
import { Occupation } from "../../../../models/v1/farmer";
import { farmerBusinessType } from "./business_type";

export const getFarmerOccupation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const occupation = await Occupation.findOne({ recordID: id }).lean();
    if (!occupation) return res.status(404).json({ message: "Farmer occupation not found" });

    return res.status(200).json({
      message: "Occupation details retrieved",
      data: {
        userId: occupation.recordID,
        primaryOccupation: occupation.primaryOccupation,
        secondaryOccupation: occupation.secondaryOccupation,
        yearsExperience: occupation.yearsExperience,
        createdAt: occupation.createdAt
          ? formatDateToShort(occupation.createdAt.toISOString(), { includeTime: true })
          : undefined,
        updatedAt: occupation.updatedAt
          ? formatDateToShort(occupation.updatedAt.toISOString(), { includeTime: true })
          : undefined,
        businessType: await farmerBusinessType(id), // determin buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving occupation");
  }
};
