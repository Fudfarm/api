import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IOccupation } from "../../../interface/farmer/occupation";

interface IOccupationDoc extends Omit<IOccupation, "_id">, Document {
  _id: string;
}

const occupationSchema = new Schema<IOccupationDoc>(
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
    primaryOccupation: {
      type: String,
      required: true,
    },
    secondaryOccupation: {
      type: String,
      default: "",
    },
    yearsExperience: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const Occupation = mongoose.model<IOccupationDoc>("Occupation", occupationSchema);
