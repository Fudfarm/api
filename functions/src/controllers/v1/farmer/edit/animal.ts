import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { AnimalInfo } from "../../../../models/v1/farmer";
import { AnimalInfoResponse } from "../details/animal_list";

export const editFarmerAnimal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { animalId } = req.params;
    if (!animalId) return res.status(400).json({ message: "Animal id is required" });

    const data = req.body;

    const animal = await AnimalInfo.findByIdAndUpdate(animalId, { $set: {
      animal: data.animal,
      quantity: data.quantity,
    } }, { new: true }).lean();
    if (!animal) return res.status(404).json({ message: "Animal not found" });

    return res.status(200).json({
      message: "Animal updated",
      data: await AnimalInfoResponse(animal),
    });
  } catch (error) {
    return handleError(error, res, "Error updating animal");
  }
};
