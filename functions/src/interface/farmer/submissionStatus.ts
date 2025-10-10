export interface ISubmissionStatus {
  _id?: string;
  recordID: string; // Reference to biodata _id
  isUpdated: boolean;
  isConsent: boolean;
  isImage: boolean;
  isSubmitted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
