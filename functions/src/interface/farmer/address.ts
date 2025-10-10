export interface IAddress {
  _id?: string;
  recordID: string; // Reference to User _id
  resState?: string;
  resLga?: string;
  resTown?: string;
  resDistrict?: string;
  resStreet?: string;
  resLandmark?: string;
  resHouseNumber?: string;
  resHouseName?: string;
  resFloorNumber?: string;
  resFlatRoom?: string;
  permState?: string;
  permLga?: string;
  permTown?: string;
  permDistrict?: string;
  permStreet?: string;
  permLandmark?: string;
  permHouseNumber?: string;
  permHouseName?: string;
  permFloorNumber?: string;
  permFlatRoom?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
