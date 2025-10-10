export interface IBusinessType {
  _id?: string;
  recordID: string; // Reference to biodata _id
  isFarmer: boolean;
  isSeller: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
