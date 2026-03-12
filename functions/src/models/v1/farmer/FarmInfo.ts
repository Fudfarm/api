import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IFarmInfo } from "../../../interface/farmer/farmInfo";

interface IFarmInfoDoc extends Omit<IFarmInfo, "_id">, Document {
  _id: string;
}

const farmInfoSchema = new Schema<IFarmInfoDoc>(
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
    state: {
      type: String,
      required: true,
    },
    lga: {
      type: String,
      required: true,
    },
    town: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      default: "",
    },
    landmark: {
      type: String,
      required: true,
    },
    numCrops: {
      type: Number,
      required: true,
      min: 0,
    },
    farmSize: {
      type: Number,
      required: true,
      min: 0,
    },
    unitId: {
      type: String,
      required: false, // suppress unit
      ref: "Unit",
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const FarmInfo = mongoose.model<IFarmInfoDoc>("FarmInfo", farmInfoSchema);
