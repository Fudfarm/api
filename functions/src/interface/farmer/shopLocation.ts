export interface IShopLocation {
  _id?: string;
  recordID: string; // Reference to biodata _id
  state: string;
  lga: string;
  town: string;
  district?: string;
  landmark: string;
  goodsCount: number;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
