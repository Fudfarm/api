import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import { AnimalInfo, BusinessType } from "../../../../models/v1/farmer";
import User from "../../../../models/v1/User";
import { AnimalInfoResponse } from "../details/animal_list";

export const editFarmerAnimal = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { animalId } = req.params;
    if (!animalId)
      return res.status(400).json({ message: "Animal id is required" });

    const data = req.body;

    const animal = await AnimalInfo.findByIdAndUpdate(
      animalId,
      {
        $set: {
          animal: data.animal,
          quantity: data.quantity,
          unitId: data.unitId,
        },
      },
      { new: true },
    ).lean();
    if (!animal) return res.status(404).json({ message: "Animal not found" });

    const updatedAnimal = await AnimalInfo.findById(animalId)
      .populate({ path: "unitId", select: "unit" })
      .lean();

    return res.status(200).json({
      message: "Animal updated",
      data: await AnimalInfoResponse(updatedAnimal),
    });
  } catch (error) {
    return handleError(error, res, "Error updating animal");
  }
};

export const addFarmerAnimal = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json({ message: "User id is required" });

    // check if user exists
    const user = await User.findById(userId).select("_id").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const businessType = await BusinessType.findOne({ recordID: userId })
      .select("isFarmer")
      .lean();
    if (!businessType) return res.status(404).json({
      message: "Farmer business type not found. Please set one.",
    });

    if (!businessType.isFarmer) {
      return res.status(403).json({
        message: "This user is not a farmer. Cannot add a farm location.",
      });
    }

    const data = req.body;

    const animalDoc = new AnimalInfo({
      recordID: userId,
      animal: data.animal,
      quantity: data.quantity,
      unitId: data.unitId,
    });

    const saved = await animalDoc.save();

    const newAnimal = await AnimalInfo.findById(saved._id)
      .populate({ path: "unitId", select: "unit" })
      .lean();

    return res.status(201).json({
      message: "Animal created",
      data: await AnimalInfoResponse(newAnimal),
    });
  } catch (error) {
    return handleError(error, res, "Error creating animal");
  }
};

export const destroyFarmerAnimal = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { animalId } = req.params;
    if (!animalId)
      return res.status(400).json({ message: "Animal id is required" });

    const deleted = await AnimalInfo.findByIdAndDelete(animalId).lean();
    if (!deleted) return res.status(404).json({ message: "Animal not found" });

    return res.status(200).json({
      message: "Animal deleted",
    });
  } catch (error) {
    return handleError(error, res, "Error deleting animal");
  }
};
