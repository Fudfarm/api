import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { Workforce } from "../../../../models/v1/farmer";
import { farmerBusinessType } from "./business_type";

export const getFarmerWorkForce = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const workForce = await Workforce.findOne({ recordID: id }).lean();
    if (!workForce)
      return res.status(404).json({ message: "Farmer work force not found" });

    return res.status(200).json({
      message: "Work force info retrieved",
      data: {
        userId: id,

        staffSize: workForce.staffSize,
        labourType: workForce.labourType,

        createdAt: workForce.createdAt
          ? formatDateToShort(workForce.createdAt.toISOString(), { includeTime: true })
          : undefined,
        updatedAt: workForce.updatedAt
          ? formatDateToShort(workForce.updatedAt.toISOString(), { includeTime: true })
          : undefined,

        businessType: await farmerBusinessType(id), // determine buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving work force info");
  }
};
