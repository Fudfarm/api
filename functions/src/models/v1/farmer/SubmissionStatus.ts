import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ISubmissionStatus } from "../../../interface/farmer/submissionStatus";

interface ISubmissionStatusDoc extends Omit<ISubmissionStatus, "_id">, Document {
  _id: string;
}

const submissionStatusSchema = new Schema<ISubmissionStatusDoc>(
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
    isUpdated: {
      type: Boolean,
      required: true,
    },
    isConsent: {
      type: Boolean,
      required: true,
    },
    isImage: {
      type: Boolean,
      required: true,
    },
    isSubmitted: {
      type: Boolean,
      required: true,
    },
    submittedBy: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
      default: "",
    },
    approvedBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const SubmissionStatus = mongoose.model<ISubmissionStatusDoc>(
  "SubmissionStatus",
  submissionStatusSchema
);
