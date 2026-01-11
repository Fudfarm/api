import mongoose, { Document, Model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { AnimalInfo } from "./AnimalInfo";
import { CropInfo } from "./CropInfo";
import { FarmInfo } from "./FarmInfo";
import { ShopItems } from "./ShopItems";

export interface IUnitDoc extends Document {
  _id: string;
  type: "Crop" | "Animal";
  unit: string;
}

const unitSchema = new Schema<IUnitDoc>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    type: {
      type: String,
      enum: ["Crop", "Animal", "Equipment", "Other"],
      required: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // KG === kg === Kg
    },
  },
  { timestamps: true }
);

/**
 * Compound uniqueness
 * Prevents same (type + quantity) twice
 */
unitSchema.index(
  { type: 1, unit: 1 },
  { unique: true }
);

/**
 * Prevent deletion if unit is in use
 */
unitSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const unitId = this._id;

    if (await AnimalInfo.exists({ unitId })) {
      return next(
        new Error("Cannot delete unit: it is used by animal information")
      );
    }

    if (await CropInfo.exists({ unitId })) {
      return next(
        new Error("Cannot delete unit: it is used by crop information")
      );
    }

    if (await FarmInfo.exists({ unitId })) {
      return next(
        new Error("Cannot delete unit: it is used by farm information")
      );
    }

    if (await ShopItems.exists({ unitId })) {
      return next(
        new Error("Cannot delete unit: it is used by store items")
      );
    }

    next();
  }
);

export const Unit: Model<IUnitDoc> =
  mongoose.models.Unit ||
  mongoose.model<IUnitDoc>("Unit", unitSchema);
