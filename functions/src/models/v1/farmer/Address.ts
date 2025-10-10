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
    resState: { type: String, required: true },
    resLga: { type: String, required: true },
    resTown: { type: String, required: true },
    resDistrict: { type: String, required: true },
    resStreet: { type: String, required: true },
    resLandmark: { type: String, required: true },
    resHouseNumber: { type: String, required: true },
    resHouseName: { type: String, required: true },
    resFloorNumber: { type: String, required: true },
    resFlatRoom: { type: String, required: true },
    permState: { type: String, required: true },
    permLga: { type: String, required: true },
    permTown: { type: String, required: true },
    permDistrict: { type: String, required: true },
    permStreet: { type: String, required: true },
    permLandmark: { type: String, required: true },
    permHouseNumber: { type: String, required: true },
    permHouseName: { type: String, required: true },
    permFloorNumber: { type: String, required: true },
    permFlatRoom: { type: String, required: true },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const Address = mongoose.model<IAddressDoc>("Address", addressSchema);
