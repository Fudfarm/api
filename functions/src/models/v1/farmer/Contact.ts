import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IContact } from "../../../interface/farmer/contact";

interface IContactDoc extends Omit<IContact, "_id">, Document {
  _id: string;
}

const contactSchema = new Schema<IContactDoc>(
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
    phone1: {
      type: String,
      required: true,
    },
    phone2: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    website: {
      type: String,
      default: "",
    },
    promoMeans1: {
      type: String,
      required: true,
    },
    promoMeans2: {
      type: String,
      required: true,
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

export const Contact = mongoose.model<IContactDoc>("Contact", contactSchema);
