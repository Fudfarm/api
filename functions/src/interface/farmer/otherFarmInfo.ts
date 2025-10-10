export interface IOtherFarmInfo {
  _id?: string;
  recordID: string; // Reference to biodata _id
  numCrops: number;
  numLivestock: number;
  annualHarvest: string;
  yearsExperience: number;
  challenges?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
