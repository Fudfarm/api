export interface IContact {
  _id?: string;
  recordID: string; // Reference to biodata _id
  phone1: string;
  phone2?: string;
  email: string;
  website?: string;
  promoMeans1: string;
  promoMeans2: string;
  others?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
