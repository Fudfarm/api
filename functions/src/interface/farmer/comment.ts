export interface IComment {
  _id?: string;
  recordID: string; // Reference to biodata _id
  uploadedBy: string; // User ID who uploaded the record
  comment: string;
  acceptedBy?: string; // Admin user ID who accepted/commented
  createdAt?: Date;
  updatedAt?: Date;
}
