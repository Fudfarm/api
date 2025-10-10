import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IVerification } from "../../../interface/farmer/verification";

interface IVerificationDoc extends Omit<IVerification, "_id">, Document {
  _id: string;
}

const verificationSchema = new Schema<IVerificationDoc>(
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
    bvn: {
      type: String,
      required: true,
    },
    nin: {
      type: String,
      default: "",
    },
    businessName: {
      type: String,
      default: "",
    },
    businessNumber: {
      type: String,
      default: "",
    },
    otherType: {
      type: String,
      default: "",
    },
    otherNumber: {
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

export const Verification = mongoose.model<IVerificationDoc>("Verification", verificationSchema);
