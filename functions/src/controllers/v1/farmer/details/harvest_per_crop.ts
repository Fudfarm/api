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

    const cropInfo = await CropInfo.find({ recordID: id }).lean();
    if (!cropInfo || cropInfo.length === 0)
      return res.status(404).json({ message: "Farmer crop info not found" });

    return res.status(200).json({
      message: "Crop info retrieved",
      data: {
        userId: id,
        crops: cropInfo.map((crop) => ({
          crop: crop.crop,
          quantity: crop.quantity,
          unit: crop.unit,
          createdAt: crop.createdAt
            ? formatDateToShort(crop.createdAt.toISOString(), { includeTime: true })
            : undefined,
          updatedAt: crop.updatedAt
            ? formatDateToShort(crop.updatedAt.toISOString(), { includeTime: true })
            : undefined,
        })),
        businessType: await farmerBusinessType(id), // determine buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving crop info");
  }
};
