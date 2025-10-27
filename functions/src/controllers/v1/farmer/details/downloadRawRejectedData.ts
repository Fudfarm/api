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
          offlineId: u.offlineID || "",
          recordId: id,
          biodata: {
            surname: u.surname || "",
            firstname: u.firstname || "",
            othernames: u.othernames || "",
            email: u.email || "",
            phone: u.phone || "",
            gender: u.gender || "",
            maritalStatus: u.maritalStatus || "",
            birthdate: u.birthdate || null,
            status: u.status || "",
            createdAt: u.createdAt || null,
            updatedAt: u.updatedAt || null,
          },
          contact: contactMap.get(id) || null,
          address: addressMap.get(id) || null,
          bank: bankMap.get(id) || null,
          businessType: businessTypeMap.get(id) || null,
          occupation: occupationMap.get(id) || null,
          verification: verificationMap.get(id) || null,
          submission: submissionMap.get(id) || null,
          otherFarmInfo: otherFarmInfoMap.get(id) || null,
          workforce: workforceMap.get(id) || null,
          farms: farmListMap.get(id) || [],
          crops: cropListMap.get(id) || [],
          animals: animalListMap.get(id) || [],
          shopLocations: shopLocListMap.get(id) || [],
          shopItems: shopItemListMap.get(id) || [],
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

