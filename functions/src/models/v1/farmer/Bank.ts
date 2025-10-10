import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IBank } from "../../../interface/farmer/bank";

interface IBankDoc extends Omit<IBank, "_id">, Document {
  _id: string;
}

const bankSchema = new Schema<IBankDoc>(
  {
    _id: { type: String, default: uuidv4 },
    recordID: { type: String, required: true, ref: "Biodata" },
    bank: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

export const Bank = mongoose.model<IBankDoc>("Bank", bankSchema);
