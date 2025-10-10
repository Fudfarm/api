import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IShopLocation } from "../../../interface/farmer/shopLocation";

interface IShopLocationDoc extends Omit<IShopLocation, "_id">, Document {
  _id: string;
}

const shopLocationSchema = new Schema<IShopLocationDoc>(
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
      required: true,
    },
    landmark: {
      type: String,
      required: true,
    },
    goodsCount: {
      type: Number,
      default: 0,
      min: 0,
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

export const ShopLocation = mongoose.model<IShopLocationDoc>("ShopLocation", shopLocationSchema);
