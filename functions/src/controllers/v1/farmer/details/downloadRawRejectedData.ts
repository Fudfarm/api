/**
 * Helper to fill missing fields with nulls based on a field list
 * @param {any} obj - The object to fill
 * @param {string[]} fields - The list of fields
 * @return {any} Object with all fields present
 */
function fillFields(obj: any, fields: string[]): any {
  const out: any = {};
  fields.forEach((f) => {
    out[f] = obj && obj[f] !== undefined ? obj[f] : null;
  });
  return out;
}

// Field lists for each related object (from interfaces)
const contactFields = [
  "_id", "recordID", "phone1", "phone2", "email", "website", "promoMeans1", "promoMeans2", "others", "createdAt", "updatedAt",
];
const addressFields = [
  "_id", "recordID", "resState", "resLga", "resTown", "resDistrict", "resStreet", "resLandmark", "resHouseNumber", "resHouseName",
  "resFloorNumber", "resFlatRoom", "permState", "permLga", "permTown", "permDistrict", "permStreet", "permLandmark",
  "permHouseNumber",
  "permHouseName", "permFloorNumber", "permFlatRoom", "createdAt", "updatedAt",
];
const bankFields = [
  "_id", "recordID", "bank", "accountName", "accountNumber", "createdAt", "updatedAt",
];
const businessTypeFields = [
  "_id", "recordID", "isFarmer", "isSeller", "createdAt", "updatedAt",
];
const occupationFields = [
  "_id", "recordID", "primaryOccupation", "secondaryOccupation", "yearsExperience", "createdAt", "updatedAt",
];
const verificationFields = [
  "_id", "recordID", "bvn", "nin", "businessName", "businessNumber", "otherType", "otherNumber", "others",
  "createdAt", "updatedAt",
];
const otherFarmInfoFields = [
  "_id", "recordID", "numCrops", "numLivestock", "annualHarvest", "yearsExperience", "challenges", "createdAt", "updatedAt",
];
const workforceFields = [
  "_id", "recordID", "staffSize", "labourType", "createdAt", "updatedAt",
];
const farmInfoFields = [
  "_id", "recordID", "state", "lga", "town", "district", "landmark", "numCrops", "farmSize", "unit", "verified",
  "createdAt", "updatedAt",
];
const cropInfoFields = [
  "_id", "recordID", "crop", "quantity", "unit", "createdAt", "updatedAt",
];
const animalInfoFields = [
  "_id", "recordID", "animal", "quantity", "createdAt", "updatedAt",
];
const shopLocationFields = [
  "_id", "recordID", "state", "lga", "town", "district", "landmark", "goodsCount", "verified", "createdAt", "updatedAt",
];
const shopItemsFields = [
  "_id", "recordID", "shopLocationID", "item", "quantity", "category", "verified", "createdAt", "updatedAt",
];
const submissionStatusFields = [
  "_id", "recordID", "isUpdated", "isConsent", "isImage", "isSubmitted", "submittedBy", "comments", "approvedBy", "rejectedBy",
  "offlineID", "allowEdit", "status", "createdAt", "updatedAt",
];
import { Response } from "express";
import { handleError } from "../../../../function/error";
import { AuthenticatedRequest } from "../../../../middleware/auth";
import User from "../../../../models/v1/User";
import {
  Address,
  AnimalInfo,
  Bank,
  BusinessType,
  Contact,
  CropInfo,
  FarmInfo,
  Occupation,
  OtherFarmInfo,
  ShopItems,
  ShopLocation,
  SubmissionStatus,
  Verification,
  Workforce,
} from "../../../../models/v1/farmer";

export const downloadRawRejectedData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1) Find rejected submissions
    const rejectedSubs = await SubmissionStatus.find({ status: "Rejected" })
      .select("recordID status comments reasons message updatedAt createdAt")
      .lean();

    if (!rejectedSubs || rejectedSubs.length === 0) {
      return res.status(200).json({
        message: "Raw rejected data retrieved",
        data: { users: [] },
      });
    }

    const userIds = rejectedSubs.map((s: any) => String(s.recordID));

    // 2) Fetch base user biodata
    const users = await User.find({ _id: { $in: userIds }, role: "Farmer" })
      .select(
        "_id offlineID surname firstname othernames email phone gender maritalStatus birthdate status createdAt updatedAt"
      )
      .lean();

    // Build a quick map
    const userMap = new Map<string, any>();
    users.forEach((u) => userMap.set(String(u._id), u));

    // 3) Fetch all related collections in bulk and group by recordID
    const [
      addresses,
      contacts,
      banks,
      businessTypes,
      occupations,
      verifications,
      otherFarmInfos,
      workforces,
      farms,
      crops,
      animals,
      shopLocs,
      shopItems] =
      await Promise.all([
        Address.find({ recordID: { $in: userIds } }).lean(),
        Contact.find({ recordID: { $in: userIds } }).lean(),
        Bank.find({ recordID: { $in: userIds } }).lean(),
        BusinessType.find({ recordID: { $in: userIds } }).lean(),
        Occupation.find({ recordID: { $in: userIds } }).lean(),
        Verification.find({ recordID: { $in: userIds } }).lean(),
        OtherFarmInfo.find({ recordID: { $in: userIds } }).lean(),
        Workforce.find({ recordID: { $in: userIds } }).lean(),
        FarmInfo.find({ recordID: { $in: userIds } }).lean(),
        CropInfo.find({ recordID: { $in: userIds } }).lean(),
        AnimalInfo.find({ recordID: { $in: userIds } }).lean(),
        ShopLocation.find({ recordID: { $in: userIds } }).lean(),
        ShopItems.find({ recordID: { $in: userIds } }).lean(),
      ]);

    // Helper to group arrays by recordID
    const groupBy = (rows: any[], key = "recordID") => {
      const map = new Map<string, any[]>();
      rows.forEach((r) => {
        const id = String(r[key]);
        const arr = map.get(id) ?? [];
        arr.push(r);
        map.set(id, arr);
      });
      return map;
    };

    // For one-to-one tables, convert to Map of recordID -> single doc (pick first if multiple)
    const toSingleMap = (rows: any[]) => {
      const map = new Map<string, any>();
      rows.forEach((r) => {
        const id = String(r.recordID);
        if (!map.has(id)) map.set(id, r);
      });
      return map;
    };

    const addressMap = toSingleMap(addresses);
    const contactMap = toSingleMap(contacts);
    const bankMap = toSingleMap(banks);
    const businessTypeMap = toSingleMap(businessTypes);
    const occupationMap = toSingleMap(occupations);
    const verificationMap = toSingleMap(verifications);
    const otherFarmInfoMap = toSingleMap(otherFarmInfos);
    const workforceMap = toSingleMap(workforces);

    const farmListMap = groupBy(farms);
    const cropListMap = groupBy(crops);
    const animalListMap = groupBy(animals);
    const shopLocListMap = groupBy(shopLocs);
    const shopItemListMap = groupBy(shopItems);

    // Also map submissions (rejected) by recordID
    const submissionMap = toSingleMap(rejectedSubs as any);

    // 4) Compose final users array
    const resultUsers = userIds
      .filter((id) => userMap.has(id))
      .map((id) => {
        const u = userMap.get(id) || {};
        return {
          offlineId: u.offlineID ?? null,
          recordId: id,
          biodata: {
            id: u._id ?? null,
            offlineID: u.offlineID ?? null,
            email: u.email ?? null,
            password: null, // never expose password
            birthdate: u.birthdate ?? null,
            firstname: u.firstname ?? null,
            gender: u.gender ?? null,
            maritalStatus: u.maritalStatus ?? null,
            otherInfo: u.otherInfo ?? null,
            othernames: u.othernames ?? null,
            surname: u.surname ?? null,
            phone: u.phone ?? null,
            noOfFamily: u.noOfFamily ?? null,
            disease: u.disease ?? null,
            role: u.role ?? null,
            status: u.status ?? null,
            lastLoginAt: u.lastLoginAt ?? null,
            isVerified: u.isVerified ?? null,
            allowNotifications: u.allowNotifications ?? null,
            createdBy: u.createdBy ?? null,
            createdAt: u.createdAt ?? null,
            updatedAt: u.updatedAt ?? null,
          },
          contact: fillFields(contactMap.get(id), contactFields),
          address: fillFields(addressMap.get(id), addressFields),
          bank: fillFields(bankMap.get(id), bankFields),
          businessType: fillFields(businessTypeMap.get(id), businessTypeFields),
          occupation: fillFields(occupationMap.get(id), occupationFields),
          verification: fillFields(verificationMap.get(id), verificationFields),
          submission: fillFields(submissionMap.get(id), submissionStatusFields),
          otherFarmInfo: fillFields(otherFarmInfoMap.get(id), otherFarmInfoFields),
          workforce: fillFields(workforceMap.get(id), workforceFields),
          farms: (farmListMap.get(id) || []).map((f: any) => fillFields(f, farmInfoFields)),
          crops: (cropListMap.get(id) || []).map((c: any) => fillFields(c, cropInfoFields)),
          animals: (animalListMap.get(id) || []).map((a: any) => fillFields(a, animalInfoFields)),
          shopLocations: (shopLocListMap.get(id) || []).map((s: any) => fillFields(s, shopLocationFields)),
          shopItems: (shopItemListMap.get(id) || []).map((s: any) => fillFields(s, shopItemsFields)),
        };
      });

    return res.status(200).json({
      message: "Raw rejected data retrieved",
      data: { users: resultUsers },
    });
  } catch (error) {
    return handleError(error, res, "Error retrieving submission info");
  }
};

/**
 * Format submission status response
 * @param {any} submission - submission data
 * @return {Promise<any>} Formatted submission status response
 */
export async function SubmissionStatusResponse(): Promise<any> {
  return {
    //
  };
}

