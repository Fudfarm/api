import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IComment } from "../../../interface/farmer/comment";

interface ICommentDoc extends Omit<IComment, "_id">, Document {
  _id: string;
}

const commentSchema = new Schema<ICommentDoc>(
  {
    _id: { type: String, default: uuidv4 },
    recordID: { type: String, required: true, ref: "Biodata" },
    uploadedBy: { type: String, required: true, ref: "User" },
    comment: { type: String, required: true },
    acceptedBy: { type: String, ref: "User" },
  },
  { timestamps: true, _id: false }
);

export const Comment = mongoose.model<ICommentDoc>("Comment", commentSchema);
