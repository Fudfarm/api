export interface IOccupation {
  _id?: string;
  recordID: string; // Reference to biodata _id
  primaryOccupation: string;
  secondaryOccupation?: string;
  yearsExperience: string;
  createdAt?: Date;
  updatedAt?: Date;
}
