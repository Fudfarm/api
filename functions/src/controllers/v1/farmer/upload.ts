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
import { labourTypes } from "../../../models/v1/farmer/Workforce";

// Security: Sanitize any database-related error messages
const sanitizeDatabaseError = (errorMessage: string): string => {
  return errorMessage
    // Remove collection/database names
    .replace(/collection:\s*[\w.-]+/gi, "")
    .replace(/database\s+[\w.-]+/gi, "")
    .replace(/index:\s*[\w.-]+\.\$[\w_]+/gi, "")
    .replace(/dup\s+key:\s*\{[^}]+\}/gi, "")
    // Remove model names and paths
    .replace(/model\s+[`"']?[\w-]+[`"']?/gi, "[REDACTED]")
    .replace(/Model\s+[`"']?[\w-]+[`"']?/gi, "[REDACTED]")
    // Remove MongoDB/Mongoose references
    .replace(/mongodb[^\s]*/gi, "")
    .replace(/mongoose[^\s]*/gi, "")
    // Clean up multiple spaces
    .replace(/\s+/g, " ")
    .trim();
};

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate phone number format
const isValidPhone = (phone: string): boolean => {
  // Nigerian phone number format (starts with +234, 0, or direct number)
  const phoneRegex = /^(\+234|0)?[789][01]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
};

// Helper function to validate BVN format
const isValidBVN = (bvn: string): boolean => {
  return /^\d{11}$/.test(bvn);
};

// Helper function to validate NIN format
const isValidNIN = (nin: string): boolean => {
  return /^\d{11}$/.test(nin);
};

// Helper function to validate account number
const isValidAccountNumber = (accountNumber: string): boolean => {
  return /^\d{10}$/.test(accountNumber);
};

// Validation functions
const validateUserData = (biodata: any): string[] => {
  const errors: string[] = [];

  if (!biodata.surname || typeof biodata.surname !== "string") {
    errors.push("Please provide a valid surname");
  }
  if (!biodata.firstname || typeof biodata.firstname !== "string") {
    errors.push("Please provide a valid first name");
  }
  if (!biodata.othernames || typeof biodata.othernames !== "string") {
    errors.push("Please provide a valid other name");
  }
  if (!["M", "F", "O"].includes(biodata.gender)) {
    errors.push("Please select a valid gender (M, F, or O)");
  }
  if (!["Single", "Married", "Divorced", "Widowed"].includes(biodata.marital)) {
    errors.push("Please select a valid marital status (Single, Married, Divorced, or Widowed)");
  }
  if (!biodata.birthDate || typeof biodata.birthDate !== "string") {
    errors.push("Please provide a valid birth date");
  }
  if (!biodata.families || typeof biodata.families !== "string") {
    errors.push("Please provide the number of family members");
  }
  // Disease is now optional
  if (biodata.disease && typeof biodata.disease !== "string") {
    errors.push("Please provide valid disease information");
  }

  return errors;
};

const validateContact = (contact: any): string[] => {
  const errors: string[] = [];

  if (contact.email && typeof contact.email === "string") {
    if (!isValidEmail(contact.email)) {
      errors.push("Please provide a valid email address format (e.g., user@example.com)");
    }
  }

  if (!contact.promoMeans1 || typeof contact.promoMeans1 !== "string") {
    errors.push("Please specify your primary promotional preference");
  }
  // if (!contact.promoMeans2 || typeof contact.promoMeans2 !== "string") {
  //   errors.push("Please specify your secondary promotional preference");
  // }

  // Validate secondary phone if provided
  if (contact.phone1 && contact.phone1.trim() !== "" && !isValidPhone(contact.phone1)) {
    errors.push("Please provide a valid primary phone number or leave it empty");
  }

  // Validate secondary phone if provided
  if (contact.phone2 && contact.phone2.trim() !== "" && !isValidPhone(contact.phone2)) {
    errors.push("Please provide a valid secondary phone number or leave it empty");
  }

  return errors;
};

const validateAddress = (address: any): string[] => {
  const errors: string[] = [];

  const requiredFieldLabels = {
    resState: "residential state",
    resLga: "residential local government area",
    resTown: "residential town",
    resDistrict: "residential district",
    resLandmark: "residential landmark",
    permState: "permanent state",
    permLga: "permanent local government area",
    permTown: "permanent town",
    permDistrict: "permanent district",
    permLandmark: "permanent landmark",
  };

  const optionalFieldLabels = {
    resStreet: "residential street",
    resHouseNumber: "residential house number",
    resHouseName: "residential house name",
    resFloorNumber: "residential floor number",
    resFlatRoom: "residential flat/room number",
    permStreet: "permanent street",
    permHouseNumber: "permanent house number",
    permHouseName: "permanent house name",
    permFloorNumber: "permanent floor number",
    permFlatRoom: "permanent flat/room number",
  };

  // Validate required fields
  for (const [field, label] of Object.entries(requiredFieldLabels)) {
    if (!address[field] || typeof address[field] !== "string") {
      errors.push(`Please provide a valid ${label}`);
    }
  }

  // Validate optional fields only if provided
  for (const [field, label] of Object.entries(optionalFieldLabels)) {
    if (address[field] && typeof address[field] !== "string") {
      errors.push(`Please provide a valid ${label}`);
    }
  }

  return errors;
};

const validateWorkforce = (workforce: any): string[] => {
  const errors: string[] = [];

  if (typeof workforce.staffSize !== "number" || workforce.staffSize < 0) {
    errors.push("Please provide a valid staff size (must be 0 or greater)");
  }
  // Labour type is now optional
  if (workforce.labourType &&
    !labourTypes.includes(workforce.labourType)) {
    errors.push("Please select a valid labour type (Permanent, Seasonal, Contract, Family, Mixed, Other)");
  }

  return errors;
};

const validateBank = (bank: any): string[] => {
  const errors: string[] = [];

  if (!bank.bank || typeof bank.bank !== "string") {
    errors.push("Please provide a valid bank name");
  }
  if (!bank.accountName || typeof bank.accountName !== "string") {
    errors.push("Please provide a valid account holder name");
  }
  if (!bank.accountNumber || typeof bank.accountNumber !== "string") {
    errors.push("Please provide a valid account number");
  } else if (!isValidAccountNumber(bank.accountNumber)) {
    errors.push("Please provide a valid 10-digit account number");
  }

  return errors;
};

const validateVerification = (verification: any): string[] => {
  const errors: string[] = [];

  if (!verification.bvn || typeof verification.bvn !== "string") {
    errors.push("Please provide a valid Bank Verification Number (BVN)");
  } else if (!isValidBVN(verification.bvn)) {
    errors.push("Please provide a valid 11-digit BVN");
  }

  // NIN is now optional
  if (verification.nin && typeof verification.nin !== "string") {
    errors.push("Please provide a valid National Identification Number (NIN)");
  } else if (verification.nin && !isValidNIN(verification.nin)) {
    errors.push("Please provide a valid 11-digit NIN");
  }

  // Business name and number are now optional
  if (verification.businessName && typeof verification.businessName !== "string") {
    errors.push("Please provide a valid business name");
  }
  if (verification.businessNumber && typeof verification.businessNumber !== "string") {
    errors.push("Please provide a valid business registration number");
  }

  return errors;
};

const validateOccupation = (occupation: any): string[] => {
  const errors: string[] = [];

  if (!occupation.primaryOccupation || typeof occupation.primaryOccupation !== "string") {
    errors.push("Please provide your primary occupation");
  }
  if (!occupation.yearsExperience || typeof occupation.yearsExperience !== "string") {
    errors.push("Please provide your years of experience");
  }

  return errors;
};

const validateOtherFarmInfo = (otherFarmInfo: any): string[] => {
  const errors: string[] = [];

  if (otherFarmInfo.numCrops && otherFarmInfo.numCrops.trim()) {
    if (typeof otherFarmInfo.numCrops !== "number" || otherFarmInfo.numCrops < 0) {
      errors.push("Please provide a valid number of crops (must be 0 or greater)");
    }
  }
  if (otherFarmInfo.numCrops && otherFarmInfo.numCrops.trim()) {
    if (typeof otherFarmInfo.numLivestock !== "number" || otherFarmInfo.numLivestock < 0) {
      errors.push("Please provide a valid number of livestock (must be 0 or greater)");
    }
  }
  // Annual harvest is now optional
  if (otherFarmInfo.annualHarvest && otherFarmInfo.annualHarvest.trim()) {
    if (otherFarmInfo.annualHarvest && typeof otherFarmInfo.annualHarvest !== "string") {
      errors.push("Please provide valid information about your annual harvest");
    }
  }
  if (otherFarmInfo.yearsExperience && otherFarmInfo.yearsExperience.trim()) {
    if (typeof otherFarmInfo.yearsExperience !== "number" || otherFarmInfo.yearsExperience < 0) {
      errors.push("Please provide valid years of farming experience (must be 0 or greater)");
    }
  }

  return errors;
};

const validateBusinessType = (businessType: any): string[] => {
  const errors: string[] = [];

  if (typeof businessType.isFarmer !== "boolean") {
    errors.push("Please specify if you are a farmer (Yes or No)");
  }
  if (typeof businessType.isSeller !== "boolean") {
    errors.push("Please specify if you are a seller (Yes or No)");
  }

  return errors;
};

const validateSubmissionStatus = (submissionStatus: any): string[] => {
  const errors: string[] = [];

  const fieldLabels = {
    isUpdated: "update status",
    isConsent: "consent status",
    isImage: "image upload status",
    isSubmitted: "submission status",
  };

  for (const [field, label] of Object.entries(fieldLabels)) {
    const value = submissionStatus[field];
    // Convert 1/0 to true/false and validate
    if (typeof value === "boolean" && value === true ) {
      // Valid - we'll convert this later
      submissionStatus[field] = value;
    } else {
      errors.push(`Please provide a valid ${label}`);
    }
  }

  return errors;
};

// Additional validation for array data
const validateArrayData = (data: IUploadData): string[] => {
  const errors: string[] = [];

  // Validate animal info if provided
  if (data.animalInfo && Array.isArray(data.animalInfo)) {
    data.animalInfo.forEach((animal, index) => {
      if (!animal.animal || typeof animal.animal !== "string") {
        errors.push(`Animal ${index + 1}: Please provide a valid animal type`);
      }
      if (typeof animal.quantity !== "number" || animal.quantity < 0) {
        errors.push(`Animal ${index + 1}: Please provide a valid quantity (must be 0 or greater)`);
      }
    });
  }

  // Validate crop info if provided
  if (data.cropInfo && Array.isArray(data.cropInfo)) {
    data.cropInfo.forEach((crop, index) => {
      if (!crop.crop || typeof crop.crop !== "string") {
        errors.push(`Crop ${index + 1}: Please provide a valid crop type`);
      }
      if (typeof crop.quantity !== "number" || crop.quantity < 0) {
        errors.push(`Crop ${index + 1}: Please provide a valid quantity (must be 0 or greater)`);
      }
      if (!crop.unit || typeof crop.unit !== "string") {
        errors.push(`Crop ${index + 1}: Please provide a valid unit of measurement`);
      }
    });
  }

  // Validate farm info if provided
  if (data.farmInfo && Array.isArray(data.farmInfo)) {
    data.farmInfo.forEach((farm, index) => {
      if (!farm.state || typeof farm.state !== "string") {
        errors.push(`Farm ${index + 1}: Please provide a valid state`);
      }
      if (!farm.lga || typeof farm.lga !== "string") {
        errors.push(`Farm ${index + 1}: Please provide a valid lga`);
      }
      if (!farm.town || typeof farm.town !== "string") {
        errors.push(`Farm ${index + 1}: Please provide a valid town`);
      }
      if (!farm.district || typeof farm.district !== "string") {
        errors.push(`Farm ${index + 1}: Please provide a valid district`);
      }
      if (!farm.landmark || typeof farm.landmark !== "string") {
        errors.push(`Farm ${index + 1}: Please provide a valid landmark`);
      }

      if (typeof farm.numCrops !== "number" || farm.numCrops < 0) {
        errors.push(`Farm ${index + 1}: Please provide a valid number of crops`);
      }
      if (typeof farm.farmSize !== "number" || farm.farmSize <= 0) {
        errors.push(`Farm ${index + 1}: Please provide a valid farm size (must be greater than 0)`);
      }
      if (!farm.unit || typeof farm.unit !== "string") {
        errors.push(`Farm ${index + 1}: Please provide a valid unit for farm size`);
      }
    });
  }

  // Validate shop location if provided
  if (data.shopLocation && Array.isArray(data.shopLocation)) {
    data.shopLocation.forEach((shop, index) => {
      if (!shop.state || typeof shop.state !== "string") {
        errors.push(`Shop ${index + 1}: Please provide a valid state`);
      }
      if (!shop.lga || typeof shop.lga !== "string") {
        errors.push(`Shop ${index + 1}: Please provide a valid lga`);
      }
      if (!shop.town || typeof shop.town !== "string") {
        errors.push(`Shop ${index + 1}: Please provide a valid town`);
      }
      if (!shop.district || typeof shop.district !== "string") {
        errors.push(`Shop ${index + 1}: Please provide a valid district`);
      }
      if (!shop.landmark || typeof shop.landmark !== "string") {
        errors.push(`Shop ${index + 1}: Please provide a valid landmark`);
      }
    });
  }

  // Validate shop items if provided
  if (data.shopItems && Array.isArray(data.shopItems)) {
    data.shopItems.forEach((item, index) => {
      if (!item.item || typeof item.item !== "string") {
        errors.push(`Shop Item ${index + 1}: Please provide a valid item name`);
      }
      if (typeof item.quantity !== "number" || item.quantity < 0) {
        errors.push(`Shop Item ${index + 1}: Please provide a valid quantity`);
      }
      if (!item.category || typeof item.category !== "string") {
        errors.push(`Shop Item ${index + 1}: Please provide a valid category`);
      }
    });
  }

  return errors;
};

export const farmersUpload = async (req: AuthenticatedRequest, res: Response) => {
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

    // Process each record individually to avoid timeout
    for (const data of uploadData) {
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
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
          const arrayDataErrors = validateArrayData(data);

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
            ...arrayDataErrors,
          ];

          if (allErrors.length > 0) {
            throw new Error(JSON.stringify(allErrors));
          }

          // Generate UUID for user record (this becomes the recordID for all other records)
          const recordID = uuidv4();
          const password = randomPassword(20);

          // Create user record with farmer data
          const user = new User({
            _id: recordID,
            offlineID: data.offlineID,
            surname: data.biodata.surname,
            firstname: data.biodata.firstname,
            othernames: data.biodata.othernames,
            email: data.contact.email || undefined,
            phone: data.contact.phone1 || undefined,
            gender: data.biodata.gender,
            maritalStatus: data.biodata.marital,
            birthdate: new Date(data.biodata.birthDate),
            noOfFamily: parseInt(data.biodata.families) || 0,
            disease: data.biodata.disease || "",
            role: "Farmer",
            status: "Disabled",
            password,
            otherInfo: data.biodata.others || "",
          });

          // Create contact record
          const contact = new Contact({
            recordID,
            phone1: data.contact.phone1 || "",
            phone2: data.contact.phone2 || "",
            email: data.contact.email || "",
            website: data.contact.website || "",
            promoMeans1: data.contact.promoMeans1,
            promoMeans2: data.contact.promoMeans2 || "",
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
            labourType: data.workforce.labourType || "",
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
            nin: data.verification.nin || "",
            businessName: data.verification.businessName || "",
            businessNumber: data.verification.businessNumber || "",
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
            numCrops: data.otherFarmInfo.numCrops || 0,
            numLivestock: data.otherFarmInfo.numLivestock || 0,
            annualHarvest: data.otherFarmInfo.annualHarvest || "",
            yearsExperience: data.otherFarmInfo.yearsExperience || 0,
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
            isUpdated: data.submissionStatus.isUpdated,
            isConsent: data.submissionStatus.isConsent,
            isImage: data.submissionStatus.isImage,
            isSubmitted: data.submissionStatus.isSubmitted,
            submittedBy: uploadedBy,
          });

          // Save main records in parallel for better performance
          await Promise.all([
            user.save({ session }),
            contact.save({ session }),
            address.save({ session }),
            workforce.save({ session }),
            bank.save({ session }),
            verification.save({ session }),
            occupation.save({ session }),
            otherFarmInfo.save({ session }),
            businessType.save({ session }),
            submissionStatus.save({ session }),
          ]);

          // Create array records
          const arrayPromises = [];

          // Create animal info records
          if (data.animalInfo && Array.isArray(data.animalInfo)) {
            for (const animal of data.animalInfo) {
              const animalInfo = new AnimalInfo({
                recordID,
                animal: animal.animal,
                quantity: animal.quantity,
              });
              arrayPromises.push(animalInfo.save({ session }));
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
              arrayPromises.push(cropInfo.save({ session }));
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
              arrayPromises.push(farmInfo.save({ session }));
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
              arrayPromises.push(shopLocationRecord.save({ session }));

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
                  arrayPromises.push(shopItemRecord.save({ session }));
                }
              }
            }
          }

          // Save all array records in parallel
          if (arrayPromises.length > 0) {
            await Promise.all(arrayPromises);
          }
        });

        // If we get here, the transaction was successful
        response.success++;
        response.successfulOfflineIDs.push(data.offlineID);
      } catch (error: any) {
        response.failed++;
        response.failedOfflineIDs.push(data.offlineID);

        let errorMessages: string[] = [];
        try {
          // Try to parse as JSON array (validation errors)
          errorMessages = JSON.parse(error.message);
        } catch {
          // If not JSON, sanitize database-related errors
          let sanitizedMessage = error.message || "An unexpected error occurred while processing your data";

          // Sanitize MongoDB/Mongoose specific error information
          if (sanitizedMessage.includes("E11000") || sanitizedMessage.includes("duplicate key")) {
            if (sanitizedMessage.includes("email")) {
              sanitizedMessage = "This email address is already registered in the system";
            } else if (sanitizedMessage.includes("phone") || sanitizedMessage.includes("phone1")) {
              sanitizedMessage = "This phone number is already registered in the system";
            } else if (sanitizedMessage.includes("bvn")) {
              sanitizedMessage = "This BVN is already registered in the system";
            } else if (sanitizedMessage.includes("nin")) {
              sanitizedMessage = "This NIN is already registered in the system";
            } else {
              sanitizedMessage = "This farmer record already exists in the system";
            }
          } else if (sanitizedMessage.includes("ValidationError")) {
            sanitizedMessage = "The farmer data provided does not meet the required format";
          } else if (sanitizedMessage.includes("CastError")) {
            sanitizedMessage = "Invalid data format provided for farmer information";
          } else if (sanitizedMessage.includes("timeout") || sanitizedMessage.includes("MongoTimeoutError")) {
            sanitizedMessage = "Request timed out while saving farmer data. Please try again";
          } else if (sanitizedMessage.includes("connection") ||
                     sanitizedMessage.includes("MongoNetworkError")) {
            sanitizedMessage = "Database connection error. Please try again later";
          }

          // Remove any database/collection names or technical details
          sanitizedMessage = sanitizeDatabaseError(sanitizedMessage);

          errorMessages = [sanitizedMessage];
        }

        response.errors.push({
          offlineID: data.offlineID,
          errors: errorMessages,
        });
      } finally {
        await session.endSession();
      }
    }

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
  }
};
