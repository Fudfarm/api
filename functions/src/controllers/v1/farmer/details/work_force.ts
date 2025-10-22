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
      data: await WorkForceResponse(workForce),
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving work force info");
  }
};

/**
 * Format work force response
 * @param {any} workForce - work force data
 * @return {Promise<any>} Formatted work force response
 */
export async function WorkForceResponse(workForce: any): Promise<any> {
  return {
    userId: workForce.recordID,

    staffSize: workForce.staffSize,
    labourType: workForce.labourType,

    createdAt: workForce.createdAt
      ? formatDateToShort(workForce.createdAt.toISOString(), { includeTime: true })
      : undefined,
    updatedAt: workForce.updatedAt
      ? formatDateToShort(workForce.updatedAt.toISOString(), { includeTime: true })
      : undefined,

    businessType: await farmerBusinessType(workForce.recordID), // determine buttons shown in frontend
  };
}
