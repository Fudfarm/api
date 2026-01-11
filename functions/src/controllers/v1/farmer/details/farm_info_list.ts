import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { FarmInfo } from "../../../../models/v1/farmer";
import { farmerBusinessType } from "./business_type";

export const getFarmerFarmInfoList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const farmInfo = await FarmInfo.find({ recordID: id })
      .populate({ path: "unitId", select: "unit" })
      .lean();
    if (!farmInfo || farmInfo.length === 0)
      return res.status(404).json({ message: "Farmer farm info not found" });

    return res.status(200).json({
      message: "Farm info retrieved",
      data: {
        userId: id,
        farms: await Promise.all(farmInfo.map((farm) => farmInfoResponse(farm))),
        businessType: await farmerBusinessType(id), // determine buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving farm info");
  }
};

/**
 * Format farm info response
 * @param {any} farm
 * @return {Promise<object>} Formatted farm info response
 */
export async function farmInfoResponse(farm: any) {
  // When populated, `farm.unitId` will be an object { _id, unit }.
  const populatedUnit = farm.unitId && typeof farm.unitId === "object" ? farm.unitId : null;
  const unitId = populatedUnit ? populatedUnit._id : farm.unitId;
  const unit = populatedUnit ? populatedUnit.unit : farm.unit;

  return {
    id: farm._id,
    state: farm.state,
    lga: farm.lga,
    town: farm.town,
    district: farm.district,
    landmark: farm.landmark,
    numCrops: farm.numCrops,
    farmSize: farm.farmSize,
    unitId,
    unit,
    verified: farm.verified,
    createdAt: farm.createdAt
      ? formatDateToShort(farm.createdAt.toISOString(), { includeTime: true })
      : undefined,
    updatedAt: farm.updatedAt
      ? formatDateToShort(farm.updatedAt.toISOString(), { includeTime: true })
      : undefined,
  };
}
