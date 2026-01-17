import { Request, Response } from "express";
import { handleError } from "../../../function/error";
import { capitalizeWords } from "../../../function/function1";
import { formatDateToShort } from "../../../function/function3";
import { Unit } from "../../../models/v1/farmer/Unit";

const fetchUnits = async (
  req: Request,
  res: Response,
  mapper: (unit: any) => object,
  message: string,
) => {
  try {
    const type =
      typeof req.query.type === "string" ? req.query.type : undefined;
    const filter: Record<string, any> = {};
    if (type) filter.type = type;

    const units = await Unit.find(filter).sort({ type: 1, unit: 1 });
    return res.status(200).json({
      message,
      data: {
        type: capitalizeWords(type || "all"),
        units: units.map(mapper),
      },
    });
  } catch (err) {
    return handleError(err, res, "Failed to fetch units");
  }
};

export const getAllUnits = async (req: Request, res: Response) =>
  fetchUnits(req, res, formatReturn, "Units retrieved");

export const getAllLeanUnits = async (req: Request, res: Response) =>
  fetchUnits(
    req,
    res,
    (u) => ({ id: u._id, type: u.type, unit: u.unit }),
    "Lean units retrieved",
  );

export const getUnitById = async (req: Request, res: Response) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    return res.status(200).json({
      message: "Unit retrieved",
      data: formatReturn(unit),
    });
  } catch (err) {
    return handleError(err, res, "Failed to fetch unit");
  }
};

export const createUnit = async (req: Request, res: Response) => {
  try {
    const { type, unit } = req.body;

    const newUnit = new Unit({ type, unit });
    await newUnit.save();

    return res.status(201).json({
      message: "Unit created",
      data: formatReturn(newUnit),
    });
  } catch (err: any) {
    // Handle duplicate compound key error
    if (err.code === 11000) {
      return handleError(err, res, "Unit already exists for this type");
    }

    return handleError(err, res, "Failed to create unit");
  }
};

const formatReturn = (unit: any): object => {
  return {
    id: unit._id,
    type: unit.type,
    unit: unit.unit,
    createdAt: unit.createdAt
      ? formatDateToShort(unit.createdAt.toISOString(), { includeTime: true })
      : undefined,
    updatedAt: unit.updatedAt
      ? formatDateToShort(unit.updatedAt.toISOString(), { includeTime: true })
      : undefined,
  };
};

export const updateUnit = async (req: Request, res: Response) => {
  try {
    const { type, unit } = req.body;

    const updatedUnit = await Unit.findByIdAndUpdate(
      req.params.id,
      { type, unit },
      { new: true, runValidators: true },
    );

    if (!updatedUnit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    return res.status(200).json({
      message: "Unit updated",
      data: formatReturn(updatedUnit),
    });
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
