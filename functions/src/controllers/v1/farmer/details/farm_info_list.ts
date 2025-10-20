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

    const farmInfo = await FarmInfo.find({ recordID: id }).lean();
    if (!farmInfo || farmInfo.length === 0)
      return res.status(404).json({ message: "Farmer farm info not found" });

    return res.status(200).json({
      message: "Farm info retrieved",
      data: {
        userId: id,
        farms: farmInfo.map((farm) => ({
          state: farm.state,
          lga: farm.lga,
          town: farm.town,
          district: farm.district,
          landmark: farm.landmark,
          numCrops: farm.numCrops,
          farmSize: farm.farmSize,
          unit: farm.unit,
          verified: farm.verified,
          createdAt: farm.createdAt
            ? formatDateToShort(farm.createdAt.toISOString(), { includeTime: true })
            : undefined,
          updatedAt: farm.updatedAt
            ? formatDateToShort(farm.updatedAt.toISOString(), { includeTime: true })
            : undefined,
        })),
        businessType: await farmerBusinessType(id), // determin buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving farm info");
  }
};
