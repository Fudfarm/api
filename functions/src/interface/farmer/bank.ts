export interface IBank {
  _id?: string;
  recordID: string; // Reference to biodata _id
  bank: string;
  accountName: string;
  accountNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}
