import { IAddress } from "./address";
import { IAnimalInfo } from "./animalInfo";
import { IBank } from "./bank";
import { IBiodata } from "./biodata";
import { IBusinessType } from "./businessType";
import { IContact } from "./contact";
import { ICropInfo } from "./cropInfo";
import { IFarmInfo } from "./farmInfo";
import { IOccupation } from "./occupation";
import { IOtherFarmInfo } from "./otherFarmInfo";
import { IShopItems } from "./shopItems";
import { IShopLocation } from "./shopLocation";
import { ISubmissionStatus } from "./submissionStatus";
import { IVerification } from "./verification";
import { IWorkforce } from "./workforce";

// Upload data structure (what comes from the client)
export interface IUploadData {
  offlineID: string;
  onlineID: string;
  biodata: Omit<IBiodata, "_id" | "createdAt" | "updatedAt"> & {
    offlineID: string;
    createdAt: string;
    updatedAt: string;
  };
  contact: Omit<IContact, "_id" | "recordID" | "createdAt" | "updatedAt"> & {
    offlineID: string;
    createdAt: string;
    updatedAt: string;
  };
  address: Omit<IAddress, "_id" | "recordID" | "createdAt" | "updatedAt"> & {
    offlineID: string;
    createdAt: string;
    updatedAt: string;
  };
  workforce: Omit<IWorkforce, "_id" | "recordID" | "createdAt" | "updatedAt"> & {
    offlineID: string;
  };
  bank: Omit<IBank, "_id" | "recordID" | "createdAt" | "updatedAt"> & {
    offlineID: string;
  };
  verification: Omit<IVerification, "_id" | "recordID" | "createdAt" | "updatedAt"> & {
    offlineID: string;
    createdAt: string;
    updatedAt: string;
  };
  occupation: Omit<IOccupation, "_id" | "recordID" | "createdAt" | "updatedAt"> & {
    offlineID: string;
  };
  otherFarmInfo: Omit<IOtherFarmInfo, "_id" | "recordID" | "createdAt" | "updatedAt"> & {
    offlineID: string;
  };
  business_type: Omit<IBusinessType, "_id" | "recordID" | "createdAt" | "updatedAt"> & {
    offlineID: string;
  };
  animalInfo: Array<Omit<IAnimalInfo, "_id" | "recordID" | "createdAt" | "updatedAt"> & {
    id: number;
    offlineID: string;
    isUpdated: number;
    createdAt: string;
    updatedAt: string;
  }>;
  cropInfo: Array<Omit<ICropInfo, "_id" | "recordID" | "createdAt" | "updatedAt"> & {
    id: number;
    offlineID: string;
    isUpdated: number;
    createdAt: string;
    updatedAt: string;
  }>;
  farmInfo: Array<Omit<IFarmInfo, "_id" | "recordID" | "createdAt" | "updatedAt"> & {
    id: number;
    offlineID: string;
    isUpdated: number;
    createdAt: string;
    updatedAt: string;
  }>;
  shopLocation: Array<Omit<IShopLocation, "_id" | "recordID" | "createdAt" | "updatedAt"> & {
    id: number;
    offlineID: string;
    isUpdated: number;
    createdAt: string;
    updatedAt: string;
  }>;
  shopItems: Array<Omit<IShopItems, "_id" | "recordID" | "shopLocationID" | "createdAt" | "updatedAt"> & {
    id: number;
    shop_id: number;
    offlineID: string;
    isUpdated: number;
    createdAt: string;
    updatedAt: string;
  }>;
  submissionStatus: Omit<ISubmissionStatus, "_id" | "recordID" | "createdAt" | "updatedAt"> & {
    offlineID: string;
  };
}

// Upload response interface
export interface IUploadResponse {
  success: number;
  failed: number;
  successfulOfflineIDs: string[];
  failedOfflineIDs: string[];
  errors: Array<{
    offlineID: string;
    errors: string[];
  }>;
}
