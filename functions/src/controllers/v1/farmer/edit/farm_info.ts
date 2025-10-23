import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { FarmInfo } from "../../../../models/v1/farmer";
import { farmInfoResponse } from "../details/farm_info_list";

export const editFarmerFarm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { farmId } = req.params;
    if (!farmId) return res.status(400).json({ message: "Farm id is required" });

    const data = req.body;

    const farm = await FarmInfo.findByIdAndUpdate(farmId, { $set: {
      state: data.state,
      lga: data.lga,
      town: data.town,
      district: data.district,
      landmark: data.landmark,
      numCrops: data.numCrops,
      farmSize: data.farmSize,
      unit: data.unit,
      verified: data.verified,
    } }, { new: true }).lean();
    if (!farm) return res.status(404).json({ message: "Farm not found" });

    return res.status(200).json({
      message: "Farm updated",
      data: await farmInfoResponse(farm),
    });
  } catch (error) {
    return handleError(error, res, "Error updating farm");
  }
};

export const addFarmerFarm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "User id is required" });

    const data = req.body;

    const farmDoc = new FarmInfo({
      recordID: userId,
      state: data.state,
      lga: data.lga,
      town: data.town,
      district: data.district,
      landmark: data.landmark,
      numCrops: data.numCrops,
      farmSize: data.farmSize,
      unit: data.unit,
      verified: data.verified ?? false,
    });

    const saved = await farmDoc.save();

    return res.status(201).json({
      message: "Farm created",
      data: await farmInfoResponse(saved),
    });
  } catch (error) {
    return handleError(error, res, "Error creating farm");
  }
};

export const destroyFarmerFarm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { farmId } = req.params;
    if (!farmId) return res.status(400).json({ message: "Farm id is required" });

    const deleted = await FarmInfo.findByIdAndDelete(farmId).lean();
    if (!deleted) return res.status(404).json({ message: "Farm not found" });

    return res.status(200).json({
      message: "Farm deleted",
    });
  } catch (error) {
    return handleError(error, res, "Error deleting farm");
  }
};
