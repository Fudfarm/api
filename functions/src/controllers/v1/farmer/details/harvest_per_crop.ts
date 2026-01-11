import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { CropInfo } from "../../../../models/v1/farmer";
import { farmerBusinessType } from "./business_type";

export const getFarmerHarvestPerCropList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const cropInfo = await CropInfo.find({ recordID: id })
      .populate({ path: "unitId", select: "unit" })
      .lean();
    if (!cropInfo || cropInfo.length === 0)
      return res.status(404).json({ message: "Farmer crop info not found" });

    return res.status(200).json({
      message: "Crop info retrieved",
      data: {
        userId: id,
        crops: await Promise.all(cropInfo.map((crop) => harvestPerCropResponse(crop))),
        businessType: await farmerBusinessType(id), // determine buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving crop info");
  }
};

/**
 * Format harvest per crop response
 * @param {any} crop - crop data
 * @return {Promise<object>} Formatted harvest per crop response
 */
export async function harvestPerCropResponse(crop: any) {
  // When populated, `crop.unitId` will be an object { _id, unit }.
  const populatedUnit = crop.unitId && typeof crop.unitId === "object" ? crop.unitId : null;
  const unitId = populatedUnit ? populatedUnit._id : crop.unitId;
  const unit = populatedUnit ? populatedUnit.unit : undefined;

  return {
    id: crop._id,
    crop: crop.crop,
    quantity: crop.quantity,
    unitId,
    unit,
    createdAt: crop.createdAt
      ? formatDateToShort(crop.createdAt.toISOString(), { includeTime: true })
      : undefined,
    updatedAt: crop.updatedAt
      ? formatDateToShort(crop.updatedAt.toISOString(), { includeTime: true })
      : undefined,
  };
}
