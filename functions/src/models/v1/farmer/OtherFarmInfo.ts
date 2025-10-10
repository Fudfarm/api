import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IOtherFarmInfo } from "../../../interface/farmer/otherFarmInfo";

interface IOtherFarmInfoDoc extends Omit<IOtherFarmInfo, "_id">, Document {
  _id: string;
}

const otherFarmInfoSchema = new Schema<IOtherFarmInfoDoc>(
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
    numCrops: {
      type: Number,
      // required: true,
      min: 0,
    },
    numLivestock: {
      type: Number,
      // required: true,
      min: 0,
    },
    annualHarvest: {
      type: String,
      default: "",
    },
    yearsExperience: {
      type: Number,
      // required: true,
      min: 0,
    },
    challenges: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const OtherFarmInfo = mongoose.model<IOtherFarmInfoDoc>("OtherFarmInfo", otherFarmInfoSchema);
