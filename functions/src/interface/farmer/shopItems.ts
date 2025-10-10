export interface IShopItems {
  _id?: string;
  recordID: string; // Reference to biodata _id
  shopLocationID: string; // Reference to shop location _id
  item: string;
  quantity: number;
  category: string;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
