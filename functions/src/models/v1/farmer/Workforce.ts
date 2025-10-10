import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IWorkforce } from "../../../interface/farmer/workforce";

interface IWorkforceDoc extends Omit<IWorkforce, "_id">, Document {
  _id: string;
}

export const labourTypes = ["Permanent", "Seasonal", "Contract", "Family", "Mixed", "Other"];

const workforceSchema = new Schema<IWorkforceDoc>(
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
    staffSize: {
      type: Number,
      required: true,
      min: 0,
    },
    labourType: {
      type: String,
      required: true,
      enum: labourTypes,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const Workforce = mongoose.model<IWorkforceDoc>("Workforce", workforceSchema);
