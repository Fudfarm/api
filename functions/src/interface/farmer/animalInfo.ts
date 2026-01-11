export interface IAnimalInfo {
  _id?: string;
  recordID: string; // Reference to biodata _id
  animal: string;
  quantity: number;
  unitId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
