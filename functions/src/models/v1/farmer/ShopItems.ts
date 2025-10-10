import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IShopItems } from "../../../interface/farmer/shopItems";

interface IShopItemsDoc extends Omit<IShopItems, "_id">, Document {
  _id: string;
}

const shopItemsSchema = new Schema<IShopItemsDoc>(
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
    shopLocationID: {
      type: String,
      required: true,
      ref: "ShopLocation",
    },
    item: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["Crop", "Animal", "Equipment", "Other"],
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

export const ShopItems = mongoose.model<IShopItemsDoc>("ShopItems", shopItemsSchema);
