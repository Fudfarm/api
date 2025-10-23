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

export const addFarmerCrop = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { farmId } = req.params;
    if (!farmId) return res.status(400).json({ message: "Farm id is required" });

    const data = req.body;

    const cropDoc = new CropInfo({
      farmID: farmId,
      recordID: data.recordID,
      crop: data.crop,
      quantity: data.quantity,
      unit: data.unit,
    });

    const saved = await cropDoc.save();

    return res.status(201).json({
      message: "Crop created",
      data: await harvestPerCropResponse(saved),
    });
  } catch (error) {
    return handleError(error, res, "Error creating crop");
  }
};

export const destroyFarmerCrop = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { cropId } = req.params;
    if (!cropId) return res.status(400).json({ message: "Crop id is required" });

    const crop = await CropInfo.findByIdAndDelete(cropId).lean();
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    return res.status(200).json({
      message: "Crop deleted",
    });
  } catch (error) {
    return handleError(error, res, "Error deleting crop");
  }
};
