import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IBiodata } from "../../../interface/farmer/biodata";

interface IBiodataDoc extends Omit<IBiodata, "_id">, Document {
  _id: string;
}

const biodataSchema = new Schema<IBiodataDoc>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    surname: {
      type: String,
      required: true,
      trim: true,
    },
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    othernames: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    marital: {
      type: String,
      required: true,
      enum: ["Single", "Married", "Divorced", "Widowed"],
    },
    birthDate: {
      type: String,
      required: true,
    },
    families: {
      type: String,
      required: true,
    },
    disease: {
      type: String,
      default: "",
    },
    others: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const Biodata = mongoose.model<IBiodataDoc>("Biodata", biodataSchema);
