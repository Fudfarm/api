export interface IAnimalInfo {
  _id?: string;
  recordID: string; // Reference to biodata _id
  animal: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}
