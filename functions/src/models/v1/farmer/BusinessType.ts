import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IBusinessType } from "../../../interface/farmer/businessType";

interface IBusinessTypeDoc extends Omit<IBusinessType, "_id">, Document {
  _id: string;
}

const businessTypeSchema = new Schema<IBusinessTypeDoc>(
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
    isFarmer: {
      type: Boolean,
      required: true,
    },
    isSeller: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const BusinessType = mongoose.model<IBusinessTypeDoc>("BusinessType", businessTypeSchema);
