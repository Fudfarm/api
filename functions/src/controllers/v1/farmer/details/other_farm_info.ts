import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { OtherFarmInfo } from "../../../../models/v1/farmer";
import { farmerBusinessType } from "./business_type";

export const getFarmerOtherFarmInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const otherFarmInfo = await OtherFarmInfo.findOne({ recordID: id }).lean();
    if (!otherFarmInfo)
      return res.status(404).json({ message: "Farmer other farm info not found" });

    return res.status(200).json({
      message: "Other farm info retrieved",
      data: {
        userId: id,

        numCrops: otherFarmInfo.numCrops,
        numLivestock: otherFarmInfo.numLivestock,
        annualHarvest: otherFarmInfo.annualHarvest,
        yearsExperience: otherFarmInfo.yearsExperience,
        challenges: otherFarmInfo.challenges,

        createdAt: otherFarmInfo.createdAt
          ? formatDateToShort(otherFarmInfo.createdAt.toISOString(), { includeTime: true })
          : undefined,
        updatedAt: otherFarmInfo.updatedAt
          ? formatDateToShort(otherFarmInfo.updatedAt.toISOString(), { includeTime: true })
          : undefined,

        businessType: await farmerBusinessType(id), // determine buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving other farm info");
  }
};
