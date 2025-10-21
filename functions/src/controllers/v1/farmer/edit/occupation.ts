import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { Occupation } from "../../../../models/v1/farmer";

export const editFarmerOccupation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const data = req.body;

    const occ = await Occupation.findOneAndUpdate({ recordID: id }, { $set: {
      primaryOccupation: data.primaryOccupation,
      secondaryOccupation: data.secondaryOccupation,
      yearsExperience: data.yearsExperience,
    } }, { new: true }).lean();
    if (!occ) return res.status(404).json({ message: "Occupation record not found" });

    return res.status(200).json({ message: "Occupation updated", data: occ });
  } catch (error) {
    return handleError(error, res, "Error updating occupation");
  }
};
