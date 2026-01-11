import { Response } from "express";
import { handleError } from "../../../../function/error";
import { formatDateToShort } from "../../../../function/function3";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { AnimalInfo } from "../../../../models/v1/farmer";
import { farmerBusinessType } from "./business_type";

export const getFarmerAnimalList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const animalInfo = await AnimalInfo.find({ recordID: id })
      .populate({ path: "unitId", select: "unit" })
      .lean();
    if (!animalInfo || animalInfo.length === 0)
      return res.status(404).json({ message: "Farmer animal info not found" });

    return res.status(200).json({
      message: "Animal info retrieved",
      data: {
        userId: id,
        animals: await Promise.all(animalInfo.map((animal) => AnimalInfoResponse(animal))),
        businessType: await farmerBusinessType(id), // determine buttons shown in frontend
      },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving animal info");
  }
};

/**
 * Format animal info response
 * @param {any} animal - animal data
 * @return {Promise<object>} Formatted animal info response
 */
export async function AnimalInfoResponse(animal: any) {
  // When populated, `animal.unitId` will be an object { _id, unit }.
  const populatedUnit = animal.unitId && typeof animal.unitId === "object" ? animal.unitId : null;
  const unitId = populatedUnit ? populatedUnit._id : animal.unitId;
  const unit = populatedUnit ? populatedUnit.unit : undefined;

  return {
    id: animal._id,
    animal: animal.animal,
    quantity: animal.quantity,
    unitId,
    unit,
    createdAt: animal.createdAt
      ? formatDateToShort(animal.createdAt.toISOString(), { includeTime: true })
      : undefined,
    updatedAt: animal.updatedAt
      ? formatDateToShort(animal.updatedAt.toISOString(), { includeTime: true })
      : undefined,
  };
}
