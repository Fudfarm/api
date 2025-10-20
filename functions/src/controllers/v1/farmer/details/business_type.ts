import { Response } from "express";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { formatDateToShort } from "../../../../function/function3";
import { handleError } from "../../../../function/error";
import { BusinessType } from "../../../../models/v1/farmer";

export const getFarmerBusinessType = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const businessType = await farmerBusinessType(id);
    if (!businessType) return res.status(404).json({ message: "Farmer business type not found" });

    return res.status(200).json({
      message: "Business type details retrieved",
      data: {
        userId: id,
        isFarmer: businessType.isFarmer,
        isSeller: businessType.isSeller,
        createdAt: businessType.createdAt,
        updatedAt: businessType.updatedAt,
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving business type");
  }
};


/**
 * Get Farmer Business Type
 * @param {string} recordId - Farmer Record ID
 * @return {Object | null} - Business Type Details
 */
export async function farmerBusinessType(recordId: string) {
  const businessType = await BusinessType.findOne({ recordID: recordId }).lean();
  if (!businessType) return null;

  return {
    isFarmer: businessType.isFarmer,
    isSeller: businessType.isSeller,
    createdAt: businessType.createdAt
      ? formatDateToShort(businessType.createdAt.toISOString(), { includeTime: true })
      : undefined,
    updatedAt: businessType.updatedAt
      ? formatDateToShort(businessType.updatedAt.toISOString(), { includeTime: true })
      : undefined,
  };
}
