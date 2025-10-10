import { Response } from "express";
import { handleError } from "../../../function/error";
import { AuthenticatedRequest } from "../../../middleware/auth";
import { IUploadData, IUploadResponse } from "../../../interface/farmer";
import User from "../../../models/v1/User";
import {
  Contact,
  Address,
  Workforce,
  Bank,
  Verification,
  Occupation,
  OtherFarmInfo,
  BusinessType,
  AnimalInfo,
  CropInfo,
  FarmInfo,
  ShopLocation,
  ShopItems,
  SubmissionStatus,
} from "../../../models/v1/farmer";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { randomPassword } from "../../../function/function3";

// Validation functions
const validateUserData = (biodata: any): string[] => {
  const errors: string[] = [];

  if (!biodata.surname || typeof biodata.surname !== "string") {
    errors.push("Surname is required and must be a string");
  }
  if (!biodata.firstname || typeof biodata.firstname !== "string") {
    errors.push("Firstname is required and must be a string");
  }
  if (!biodata.othernames || typeof biodata.othernames !== "string") {
    errors.push("Othernames is required and must be a string");
  }
  if (!["Male", "Female"].includes(biodata.gender)) {
    errors.push("Gender must be either 'Male' or 'Female'");
  }
  if (!["Single", "Married", "Divorced", "Widowed"].includes(biodata.marital)) {
    errors.push("Marital status must be one of: Single, Married, Divorced, Widowed");
  }
  if (!biodata.birthDate || typeof biodata.birthDate !== "string") {
    errors.push("Birth date is required and must be a string");
  }
  if (!biodata.families || typeof biodata.families !== "string") {
    errors.push("Families is required and must be a string");
  }
  if (!biodata.disease || typeof biodata.disease !== "string") {
    errors.push("Disease information is required and must be a string");
  }

  return errors;
};

const validateContact = (contact: any): string[] => {
  const errors: string[] = [];

  if (!contact.phone1 || typeof contact.phone1 !== "string") {
    errors.push("Phone1 is required and must be a string");
  }
  if (!contact.email || typeof contact.email !== "string") {
    errors.push("Email is required and must be a string");
  }
  if (!contact.promoMeans1 || typeof contact.promoMeans1 !== "string") {
    errors.push("PromoMeans1 is required and must be a string");
  }
  if (!contact.promoMeans2 || typeof contact.promoMeans2 !== "string") {
    errors.push("PromoMeans2 is required and must be a string");
  }

  return errors;
};

const validateAddress = (address: any): string[] => {
  const errors: string[] = [];

  const requiredFields = [
    "resState", "resLga", "resTown", "resDistrict", "resStreet",
    "resLandmark", "resHouseNumber", "resHouseName", "resFloorNumber", "resFlatRoom",
    "permState", "permLga", "permTown", "permDistrict", "permStreet",
    "permLandmark", "permHouseNumber", "permHouseName", "permFloorNumber", "permFlatRoom",
  ];

  for (const field of requiredFields) {
    if (!address[field] || typeof address[field] !== "string") {
      errors.push(`${field} is required and must be a string`);
    }
  }

  return errors;
};

const validateWorkforce = (workforce: any): string[] => {
  const errors: string[] = [];

  if (typeof workforce.staffSize !== "number" || workforce.staffSize < 0) {
    errors.push("Staff size must be a non-negative number");
  }
  if (!["Permanent", "Temporary", "Seasonal"].includes(workforce.labourType)) {
    errors.push("Labour type must be one of: Permanent, Temporary, Seasonal");
  }

  return errors;
};

const validateBank = (bank: any): string[] => {
  const errors: string[] = [];

  if (!bank.bank || typeof bank.bank !== "string") {
    errors.push("Bank name is required and must be a string");
  }
  if (!bank.accountName || typeof bank.accountName !== "string") {
    errors.push("Account name is required and must be a string");
  }
  if (!bank.accountNumber || typeof bank.accountNumber !== "string") {
    errors.push("Account number is required and must be a string");
  }

  return errors;
};

const validateVerification = (verification: any): string[] => {
  const errors: string[] = [];

  if (!verification.bvn || typeof verification.bvn !== "string") {
    errors.push("BVN is required and must be a string");
  }
  if (!verification.nin || typeof verification.nin !== "string") {
    errors.push("NIN is required and must be a string");
  }
  if (!verification.businessName || typeof verification.businessName !== "string") {
    errors.push("Business name is required and must be a string");
  }
  if (!verification.businessNumber || typeof verification.businessNumber !== "string") {
    errors.push("Business number is required and must be a string");
  }

  return errors;
};

const validateOccupation = (occupation: any): string[] => {
  const errors: string[] = [];

  if (!occupation.primaryOccupation || typeof occupation.primaryOccupation !== "string") {
    errors.push("Primary occupation is required and must be a string");
  }
  if (!occupation.yearsExperience || typeof occupation.yearsExperience !== "string") {
    errors.push("Years of experience is required and must be a string");
  }

  return errors;
};

const validateOtherFarmInfo = (otherFarmInfo: any): string[] => {
  const errors: string[] = [];

  if (typeof otherFarmInfo.numCrops !== "number" || otherFarmInfo.numCrops < 0) {
    errors.push("Number of crops must be a non-negative number");
  }
  if (typeof otherFarmInfo.numLivestock !== "number" || otherFarmInfo.numLivestock < 0) {
    errors.push("Number of livestock must be a non-negative number");
  }
  if (!otherFarmInfo.annualHarvest || typeof otherFarmInfo.annualHarvest !== "string") {
    errors.push("Annual harvest is required and must be a string");
  }
  if (typeof otherFarmInfo.yearsExperience !== "number" || otherFarmInfo.yearsExperience < 0) {
    errors.push("Years of experience must be a non-negative number");
  }

  return errors;
};

const validateBusinessType = (businessType: any): string[] => {
  const errors: string[] = [];

  if (typeof businessType.isFarmer !== "boolean") {
    errors.push("isFarmer must be a boolean");
  }
  if (typeof businessType.isSeller !== "boolean") {
    errors.push("isSeller must be a boolean");
  }

  return errors;
};

const validateSubmissionStatus = (submissionStatus: any): string[] => {
  const errors: string[] = [];

  const booleanFields = ["isUpdated", "isConsent", "isImage", "isSubmitted"];
  for (const field of booleanFields) {
    const value = submissionStatus[field];
    // Convert 1/0 to true/false and validate
    if (value === 1 || value === 0 || typeof value === "boolean") {
      // Valid - we'll convert this later
      submissionStatus[field] = value === 1 ? true : value === 0 ? false : value;
    } else {
      errors.push(`${field} must be a boolean, 1, or 0`);
    }
  }

  return errors;
};

export const farmersUpload = async (req: AuthenticatedRequest, res: Response) => {
  const session = await mongoose.startSession();

  try {
    const uploadData: IUploadData[] = req.body;
    const uploadedBy = req.user?.id;

    if (!uploadedBy) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!Array.isArray(uploadData)) {
      return res.status(400).json({ message: "Data must be an array" });
    }

    const response: IUploadResponse = {
      success: 0,
      failed: 0,
      successfulOfflineIDs: [],
      failedOfflineIDs: [],
      errors: [],
    };

    await session.withTransaction(async () => {
      for (const data of uploadData) {
        try {
          // Validate all required sections
          const userDataErrors = validateUserData(data.biodata);
          const contactErrors = validateContact(data.contact);
          const addressErrors = validateAddress(data.address);
          const workforceErrors = validateWorkforce(data.workforce);
          const bankErrors = validateBank(data.bank);
          const verificationErrors = validateVerification(data.verification);
          const occupationErrors = validateOccupation(data.occupation);
          const otherFarmInfoErrors = validateOtherFarmInfo(data.otherFarmInfo);
          const businessTypeErrors = validateBusinessType(data.business_type);
          const submissionStatusErrors = validateSubmissionStatus(data.submissionStatus);

          const allErrors = [
            ...userDataErrors,
            ...contactErrors,
            ...addressErrors,
            ...workforceErrors,
            ...bankErrors,
            ...verificationErrors,
            ...occupationErrors,
            ...otherFarmInfoErrors,
            ...businessTypeErrors,
            ...submissionStatusErrors,
          ];

          if (allErrors.length > 0) {
            response.failed++;
            response.failedOfflineIDs.push(data.offlineID);
            response.errors.push({
              offlineID: data.offlineID,
              error: allErrors.join("; "),
            });
            continue;
          }

          // Generate UUID for user record (this becomes the recordID for all other records)
          const recordID = uuidv4();
          const password = randomPassword(20);

          // Create user record with farmer data
          const user = new User({
            _id: recordID,
            surname: data.biodata.surname,
            firstname: data.biodata.firstname,
            othernames: data.biodata.othernames,
            email: data.contact.email,
            phone: data.contact.phone1,
            gender: data.biodata.gender,
            maritalStatus: data.biodata.marital,
            birthdate: new Date(data.biodata.birthDate),
            noOfFamily: parseInt(data.biodata.families) || 0,
            disease: data.biodata.disease,
            role: "Farmer",
            status: "Disabled",
            password,
            otherInfo: data.biodata.others || "",
          });

          // Create contact record (excluding email and phone1 since they're in User)
          const contact = new Contact({
            recordID,
            phone1: data.contact.phone1, // Keep for reference
            phone2: data.contact.phone2 || "",
            email: data.contact.email, // Keep for reference
            website: data.contact.website || "",
            promoMeans1: data.contact.promoMeans1,
            promoMeans2: data.contact.promoMeans2,
            others: data.contact.others || "",
          });

          // Create address record
          const address = new Address({
            recordID,
            resState: data.address.resState,
            resLga: data.address.resLga,
            resTown: data.address.resTown,
            resDistrict: data.address.resDistrict,
            resStreet: data.address.resStreet,
            resLandmark: data.address.resLandmark,
            resHouseNumber: data.address.resHouseNumber,
            resHouseName: data.address.resHouseName,
            resFloorNumber: data.address.resFloorNumber,
            resFlatRoom: data.address.resFlatRoom,
            permState: data.address.permState,
            permLga: data.address.permLga,
            permTown: data.address.permTown,
            permDistrict: data.address.permDistrict,
            permStreet: data.address.permStreet,
            permLandmark: data.address.permLandmark,
            permHouseNumber: data.address.permHouseNumber,
            permHouseName: data.address.permHouseName,
            permFloorNumber: data.address.permFloorNumber,
            permFlatRoom: data.address.permFlatRoom,
          });

          // Create workforce record
          const workforce = new Workforce({
            recordID,
            staffSize: data.workforce.staffSize,
            labourType: data.workforce.labourType,
          });

          // Create bank record
          const bank = new Bank({
            recordID,
            bank: data.bank.bank,
            accountName: data.bank.accountName,
            accountNumber: data.bank.accountNumber,
          });

          // Create verification record
          const verification = new Verification({
            recordID,
            bvn: data.verification.bvn,
            nin: data.verification.nin,
            businessName: data.verification.businessName,
            businessNumber: data.verification.businessNumber,
            otherType: data.verification.otherType || "",
            otherNumber: data.verification.otherNumber || "",
            others: data.verification.others || "",
          });

          // Create occupation record
          const occupation = new Occupation({
            recordID,
            primaryOccupation: data.occupation.primaryOccupation,
            secondaryOccupation: data.occupation.secondaryOccupation || "",
            yearsExperience: data.occupation.yearsExperience,
          });

          // Create other farm info record
          const otherFarmInfo = new OtherFarmInfo({
            recordID,
            numCrops: data.otherFarmInfo.numCrops,
            numLivestock: data.otherFarmInfo.numLivestock,
            annualHarvest: data.otherFarmInfo.annualHarvest,
            yearsExperience: data.otherFarmInfo.yearsExperience,
            challenges: data.otherFarmInfo.challenges || "",
          });

          // Create business type record
          const businessType = new BusinessType({
            recordID,
            isFarmer: data.business_type.isFarmer,
            isSeller: data.business_type.isSeller,
          });

          // Create submission status record
          const submissionStatus = new SubmissionStatus({
            recordID,
            isUpdated: data.submissionStatus.isUpdated ? true : false,
            isConsent: data.submissionStatus.isConsent ? true : false,
            isImage: data.submissionStatus.isImage ? true : false,
            isSubmitted: data.submissionStatus.isSubmitted ? true : false,
          });

          // Save all main records
          await user.save({ session });
          await contact.save({ session });
          await address.save({ session });
          await workforce.save({ session });
          await bank.save({ session });
          await verification.save({ session });
          await occupation.save({ session });
          await otherFarmInfo.save({ session });
          await businessType.save({ session });
          await submissionStatus.save({ session });

          // Create animal info records
          if (data.animalInfo && Array.isArray(data.animalInfo)) {
            for (const animal of data.animalInfo) {
              const animalInfo = new AnimalInfo({
                recordID,
                animal: animal.animal,
                quantity: animal.quantity,
              });
              await animalInfo.save({ session });
            }
          }

          // Create crop info records
          if (data.cropInfo && Array.isArray(data.cropInfo)) {
            for (const crop of data.cropInfo) {
              const cropInfo = new CropInfo({
                recordID,
                crop: crop.crop,
                quantity: crop.quantity,
                unit: crop.unit,
              });
              await cropInfo.save({ session });
            }
          }

          // Create farm info records
          if (data.farmInfo && Array.isArray(data.farmInfo)) {
            for (const farm of data.farmInfo) {
              const farmInfo = new FarmInfo({
                recordID,
                state: farm.state,
                lga: farm.lga,
                town: farm.town,
                district: farm.district,
                landmark: farm.landmark,
                numCrops: farm.numCrops,
                farmSize: farm.farmSize,
                unit: farm.unit,
                verified: farm.verified || false,
              });
              await farmInfo.save({ session });
            }
          }

          // Create shop location records and their items
          if (data.shopLocation && Array.isArray(data.shopLocation)) {
            for (const shop of data.shopLocation) {
              const shopLocationRecord = new ShopLocation({
                recordID,
                state: shop.state,
                lga: shop.lga,
                town: shop.town,
                district: shop.district,
                landmark: shop.landmark,
                goodsCount: shop.goodsCount || 0,
                verified: shop.verified || false,
              });
              await shopLocationRecord.save({ session });

              // Create shop items for this location
              if (data.shopItems && Array.isArray(data.shopItems)) {
                const shopItems = data.shopItems.filter((item) => item.shop_id === shop.id);
                for (const item of shopItems) {
                  const shopItemRecord = new ShopItems({
                    recordID,
                    shopLocationID: shopLocationRecord._id,
                    item: item.item,
                    quantity: item.quantity,
                    category: item.category,
                    verified: item.verified || false,
                  });
                  await shopItemRecord.save({ session });
                }
              }
            }
          }

          response.success++;
          response.successfulOfflineIDs.push(data.offlineID);
        } catch (error: any) {
          response.failed++;
          response.failedOfflineIDs.push(data.offlineID);
          response.errors.push({
            offlineID: data.offlineID,
            error: error.message || "Unknown error occurred",
          });
        }
      }
    });

    let msg = "";
    if (response.success === 0) {
      msg = "All uploads failed";
    } else if (response.failed === 0) {
      msg = "All uploads successful";
    } else {
      msg = "Partial uploads successful";
    }

    return res.status(200).json({
      message: msg,
      success: response.success,
      failed: response.failed,
      successfulOfflineIDs: response.successfulOfflineIDs,
      failedOfflineIDs: response.failedOfflineIDs,
      errors: response.errors,
    });
  } catch (error: any) {
    return handleError(error, res, "Error uploading farmer data");
  } finally {
    await session.endSession();
  }
};
