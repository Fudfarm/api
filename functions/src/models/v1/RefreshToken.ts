import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IRefreshToken extends Document {
  userId: string;
  tokenHash: string;
  userAgent?: string;
  ip?: string;
  createdAt: Date;
  expiresAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    userId: { type: String, required: true },
    tokenHash: { type: String, required: true },
    userAgent: { type: String, required: true },
    ip: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  {
    _id: false,
    versionKey: false,
    toJSON: {
      getters: true,
      transform: (_, ret) => {
        if (ret._id) ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      getters: true,
    },
  }
);

export const RefreshToken = mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema,
  "refresh_tokens"
);
