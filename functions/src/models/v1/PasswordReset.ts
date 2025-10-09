import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const passwordResetSchema = new Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  email: { type: String, required: true, lowercase: true, trim: true },
  userId: { type: String, required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

export const PasswordReset = mongoose.model(
  "PasswordReset",
  passwordResetSchema
);
