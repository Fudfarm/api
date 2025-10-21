import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { BusinessType } from "../../../../models/v1/farmer";

export const editFarmerBusinessType = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const data = req.body;

    const bt = await BusinessType.findOneAndUpdate({ recordID: id }, { $set: {
      isFarmer: data.isFarmer,
      isSeller: data.isSeller,
    } }, { new: true }).lean();
    if (!bt) return res.status(404).json({ message: "Business type not found" });

    return res.status(200).json({ message: "Business type updated", data: bt });
  } catch (error) {
    return handleError(error, res, "Error updating business type");
  }
};
