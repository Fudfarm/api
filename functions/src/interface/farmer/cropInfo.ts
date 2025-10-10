export interface ICropInfo {
  _id?: string;
  recordID: string; // Reference to biodata _id
  crop: string;
  quantity: number;
  unit: string;
  createdAt?: Date;
  updatedAt?: Date;
}
