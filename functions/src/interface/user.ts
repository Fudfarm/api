export const USER_ROLES = ["Field Officer", "Admin", "Farmer"] as const;
export type IUserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = [
  "Pending",
  "Active",
  "Inactive",
  "Disabled",
  "Banned",
  "Resigned",
  "Retired",
  "Terminated",
  "Dead",
] as const;
export type IUserStatus = (typeof USER_STATUSES)[number];

export interface IUser {
  id: string;
  offlineID?: string;
  email?: string;
  password: string;
  birthdate: Date;
  firstname: string;
  gender: string;
  maritalStatus: string;
  otherInfo?: string;
  othernames: string;
  surname: string;
  phone?: string;
  noOfFamily?: number;
  disease?: string;
  role: IUserRole;
  status?: IUserStatus;
  lastLoginAt?: Date;
  isVerified: boolean;
  allowNotifications?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: string;
}

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}
