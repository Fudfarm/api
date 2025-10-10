import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IAddress } from "../../../interface/farmer/address";

interface IAddressDoc extends Omit<IAddress, "_id">, Document {
  _id: string;
}

const addressSchema = new Schema<IAddressDoc>(
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
    resState: { type: String },
    resLga: { type: String },
    resTown: { type: String },
    resDistrict: { type: String },
    resStreet: { type: String },
    resLandmark: { type: String },
    resHouseNumber: { type: String },
    resHouseName: { type: String },
    resFloorNumber: { type: String },
    resFlatRoom: { type: String },
    permState: { type: String },
    permLga: { type: String },
    permTown: { type: String },
    permDistrict: { type: String },
    permStreet: { type: String },
    permLandmark: { type: String },
    permHouseNumber: { type: String },
    permHouseName: { type: String },
    permFloorNumber: { type: String },
    permFlatRoom: { type: String },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const Address = mongoose.model<IAddressDoc>("Address", addressSchema);
