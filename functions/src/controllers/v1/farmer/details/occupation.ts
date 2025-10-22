import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
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
      data: await OccupationResponse(occupation),
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving occupation");
  }
};

/**
 * Format occupation response for frontend consumption.
 * @param {any} occupation - The occupation document from the database.
 * @return {Promise<object>} Formatted occupation response object.
 */
export async function OccupationResponse(occupation: any): Promise<object> {
  return {
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
    businessType: await farmerBusinessType(occupation.recordID), // determine buttons shown in frontend
  };
}
