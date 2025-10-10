export interface ISubmissionStatus {
  _id?: string;
  recordID: string; // Reference to biodata _id
  isUpdated: boolean;
  isConsent: boolean;
  isImage: boolean;
  isSubmitted: boolean;
  submittedBy: string;
  comments?: string;
  approvedBy?: string;
  offlineID?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
