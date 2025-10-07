import mongoose from "mongoose";
import { config } from "./index";

let isConnected = false;

export const connectToMongoDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(config.mongoUri);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};
