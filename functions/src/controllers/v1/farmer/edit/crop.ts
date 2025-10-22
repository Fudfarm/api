import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { CropInfo } from "../../../../models/v1/farmer";
import { harvestPerCropResponse } from "../details/harvest_per_crop";

export const editFarmerCrop = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { cropId } = req.params;
    if (!cropId) return res.status(400).json({ message: "Crop id is required" });

    const data = req.body;

    const crop = await CropInfo.findByIdAndUpdate(cropId, { $set: {
      crop: data.crop,
      quantity: data.quantity,
      unit: data.unit,
    } }, { new: true }).lean();
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    return res.status(200).json({
      message: "Crop updated",
      data: await harvestPerCropResponse(crop),
    });
  } catch (error) {
    return handleError(error, res, "Error updating crop");
  }
};
