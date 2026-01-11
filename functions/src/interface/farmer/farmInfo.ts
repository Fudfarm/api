export interface IFarmInfo {
  _id?: string;
  recordID: string; // Reference to biodata _id
  state: string;
  lga: string;
  town: string;
  district?: string;
  landmark: string;
  numCrops: number;
  farmSize: number;
  unitId: string;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
