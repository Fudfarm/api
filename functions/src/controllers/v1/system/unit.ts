import { Request, Response } from "express";
import { handleError } from "../../../function/error";
import { Unit } from "../../../models/v1/farmer/Unit";


export const getAllUnits = async (req: Request, res: Response) => {
  try {
    // Optional filter by `type` query parameter (e.g. `?type=weight`)
    const type = typeof req.query.type === "string" ? req.query.type : undefined;
    const filter: Record<string, any> = {};
    if (type) filter.type = type;

    const units = await Unit.find(filter).sort({ type: 1, unit: 1 });
    return res.status(200).json(units);
  } catch (err) {
    return handleError(err, res, "Failed to fetch units");
  }
};


export const getUnitById = async (req: Request, res: Response) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    return res.status(200).json(unit);
  } catch (err) {
    return handleError(err, res, "Failed to fetch unit");
  }
};


export const createUnit = async (req: Request, res: Response) => {
  try {
    const { type, unit } = req.body;

    const newUnit = new Unit({ type, unit });
    await newUnit.save();

    return res.status(201).json(newUnit);
  } catch (err: any) {
    // Handle duplicate compound key error
    if (err.code === 11000) {
      return handleError(err, res, "Unit already exists for this type");
    }

    return handleError(err, res, "Failed to create unit");
  }
};


export const updateUnit = async (req: Request, res: Response) => {
  try {
    const { type, unit } = req.body;

    const updatedUnit = await Unit.findByIdAndUpdate(
      req.params.id,
      { type, unit },
      { new: true, runValidators: true }
    );

    if (!updatedUnit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    return res.status(200).json(updatedUnit);
  } catch (err: any) {
    if (err.code === 11000) {
      return handleError(err, res, "Failed to create unit");
    }
    return handleError(err, res, "Failed to update unit");
  }
};


export const deleteUnit = async (req: Request, res: Response) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    await unit.deleteOne(); // triggers pre-delete hook

    return res.status(200).json({ message: "Unit deleted successfully" });
  } catch (err: any) {
    return handleError(err, res, err.message || "Cannot delete unit");
  }
};
