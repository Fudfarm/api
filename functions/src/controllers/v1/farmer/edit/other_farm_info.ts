import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { OtherFarmInfo } from "../../../../models/v1/farmer";

export const editFarmerOtherFarmInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const data = req.body;

    const rec = await OtherFarmInfo.findOneAndUpdate(
      { recordID: id },
      { $set: {
        numCrops: data.numCrops,
        numLivestock: data.numLivestock,
        annualHarvest: data.annualHarvest,
        yearsExperience: data.yearsExperience,
        challenges: data.challenges,
      } },
      { new: true },
    ).lean();

    if (!rec) return res.status(404).json({ message: "Other farm info not found" });

    return res.status(200).json({ message: "Other farm info updated", data: rec });
  } catch (error) {
    return handleError(error, res, "Error updating other farm info");
  }
};
