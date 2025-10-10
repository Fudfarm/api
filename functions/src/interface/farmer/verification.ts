export interface IVerification {
  _id?: string;
  recordID: string; // Reference to biodata _id
  bvn: string;
  nin: string;
  businessName: string;
  businessNumber: string;
  otherType?: string;
  otherNumber?: string;
  others?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
