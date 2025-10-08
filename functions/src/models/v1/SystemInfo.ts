import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ISystemInfo extends Document {
  _id: string;
  privacyPolicy?: string;
  aboutUs?: string;
  toc?: string;
  phone1?: string;
  phone2?: string;
  whatsappPhone?: string;
  contactEmail?: string;
  updatedAt: Date;
  createdAt: Date;
}

const systemInfoSchema = new Schema<ISystemInfo>({
  _id: {
    type: String,
    default: uuidv4,
  },
  privacyPolicy: { type: String },
  aboutUs: { type: String },
  toc: { type: String },
  phone1: { type: String },
  phone2: { type: String },
  whatsappPhone: { type: String },
  contactEmail: { type: String },
});

export const SystemInfo = mongoose.model<ISystemInfo>(
  "SystemInfo",
  systemInfoSchema
);
