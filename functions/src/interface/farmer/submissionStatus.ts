export const STATUS_LIST = ["Pending", "Approved", "Rejected"];

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
  rejectedBy?: string;
  offlineID?: string;
  allowEdit?: boolean;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
