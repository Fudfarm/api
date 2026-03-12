import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ICropInfo } from "../../../interface/farmer/cropInfo";

interface ICropInfoDoc extends Omit<ICropInfo, "_id">, Document {
  _id: string;
}

const cropInfoSchema = new Schema<ICropInfoDoc>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    recordID: {
      type: String,
      required: true,
      ref: "Biodata",
    },
    crop: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unitId: {
      type: String,
      required: true,
      ref: "Unit",
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const CropInfo = mongoose.model<ICropInfoDoc>("CropInfo", cropInfoSchema);
