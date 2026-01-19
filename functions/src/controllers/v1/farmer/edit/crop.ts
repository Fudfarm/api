import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { CropInfo } from "../../../../models/v1/farmer";
import { harvestPerCropResponse } from "../details/harvest_per_crop";

export const editFarmerCrop = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { cropId } = req.params;
    if (!cropId)
      return res.status(400).json({ message: "Crop id is required" });

    const data = req.body;

    const crop = await CropInfo.findByIdAndUpdate(
      cropId,
      {
        $set: {
          crop: data.crop,
          quantity: data.quantity,
          unitId: data.unitId,
        },
      },
      { new: true },
    ).lean();
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const updatedCrop = await CropInfo.findById(cropId)
      .populate({ path: "unitId", select: "unit" })
      .lean();

    return res.status(200).json({
      message: "Crop updated",
      data: await harvestPerCropResponse(updatedCrop),
    });
  } catch (error) {
    return handleError(error, res, "Error updating crop");
  }
};

export const addFarmerCrop = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json({ message: "User id is required" });

    const data = req.body;

    const cropDoc = new CropInfo({
      recordID: userId,
      crop: data.crop,
      quantity: data.quantity,
      unitId: data.unitId,
    });

    const saved = await cropDoc.save();

    const newCrop = await CropInfo.findById(saved._id)
      .populate({ path: "unitId", select: "unit" })
      .lean();

    return res.status(201).json({
      message: "Crop created",
      data: await harvestPerCropResponse(newCrop),
    });
  } catch (error) {
    return handleError(error, res, "Error creating crop");
  }
};

export const destroyFarmerCrop = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { cropId } = req.params;
    if (!cropId)
      return res.status(400).json({ message: "Crop id is required" });

    const crop = await CropInfo.findByIdAndDelete(cropId).lean();
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    return res.status(200).json({
      message: "Crop deleted",
    });
  } catch (error) {
    return handleError(error, res, "Error deleting crop");
  }
};
