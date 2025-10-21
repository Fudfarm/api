import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { Workforce } from "../../../../models/v1/farmer";

export const editFarmerWorkForce = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const data = req.body;

    const wf = await Workforce.findOneAndUpdate({ recordID: id }, { $set: {
      staffSize: data.staffSize,
      labourType: data.labourType,
    } }, { new: true }).lean();
    if (!wf) return res.status(404).json({ message: "Workforce record not found" });

    return res.status(200).json({ message: "Workforce updated", data: wf });
  } catch (error) {
    return handleError(error, res, "Error updating workforce");
  }
};
