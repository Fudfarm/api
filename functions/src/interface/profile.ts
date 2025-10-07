import { Document } from "mongoose";

export interface Name extends Document {
  first: string;
  last: string;
}
