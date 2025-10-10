export interface IWorkforce {
  _id?: string;
  recordID: string; // Reference to biodata _id
  staffSize: number;
  labourType: string;
  createdAt?: Date;
  updatedAt?: Date;
}
