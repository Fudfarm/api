import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IAnimalInfo } from "../../../interface/farmer/animalInfo";

interface IAnimalInfoDoc extends Omit<IAnimalInfo, "_id">, Document {
  _id: string;
}

const animalInfoSchema = new Schema<IAnimalInfoDoc>(
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
    animal: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const AnimalInfo = mongoose.model<IAnimalInfoDoc>("AnimalInfo", animalInfoSchema);
