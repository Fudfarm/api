export const USER_ROLES = ["User", "Admin"] as const;
export type IUserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = [
    "Pending",
    "Active",
    "Inactive",
    "Banned",
    "Resigned",
    "Retired",
    "Terminated",
    "Dead",
] as const;
export type IUserStatus = (typeof USER_STATUSES)[number];

export interface IUser {
    id: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    birthdate: Date;
    firstname: string;
    gender: string;
    maritalStatus: string;
    otherInfo: string;
    othernames: string;
    surname: string;
    settings?: {
        theme?: string;
        language?: string;
    };
    status?: IUserStatus;
    lastLoginAt?: Date;
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy: string;
}

export interface IUserMethods {
    comparePassword(password: string): Promise<boolean>;
}