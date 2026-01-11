export interface ICropInfo {
  _id?: string;
  recordID: string; // Reference to biodata _id
  crop: string;
  quantity: number;
  unitId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
