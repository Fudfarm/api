import { IUploadData } from "../interface/farmer";
import { labourTypes } from "../models/v1/farmer/Workforce";

// Helper function to validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate phone number format
export const isValidPhone = (phone: string): boolean => {
  // Nigerian phone number format (starts with +234, 0, or direct number)
  const phoneRegex = /^(\+234|0)?[789][01]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
};

// Helper function to validate BVN format
export const isValidBVN = (bvn: string): boolean => {
  return /^\d{11}$/.test(bvn);
};

// Helper function to validate NIN format
export const isValidNIN = (nin: string): boolean => {
  return /^\d{11}$/.test(nin);
};

// Helper function to validate account number
export const isValidAccountNumber = (accountNumber: string): boolean => {
  return /^\d{10}$/.test(accountNumber);
};


export const validateContact = (contact: any): string[] => {
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

// Security: Sanitize any database-related error messages
export const sanitizeDatabaseError = (errorMessage: string): string => {
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


// Validation functions
export const validateUserData = (biodata: any): string[] => {
  const errors: string[] = [];

  if (!biodata.surname || typeof biodata.surname !== "string") {
    errors.push("Please provide a valid surname");
  }
  if (!biodata.firstname || typeof biodata.firstname !== "string") {
    errors.push("Please provide a valid first name");
  }
  if (!biodata.othernames || typeof biodata.othernames !== "string") {
    // errors.push("Please provide a valid other name");
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


export const validateAddress = (address: any): string[] => {
  const errors: string[] = [];

  const requiredFieldLabels = {
    resState: "residential state",
    resLga: "residential local government area",
    resTown: "residential town",
    // resDistrict: "residential district",
    resLandmark: "residential landmark",
    permState: "permanent state",
    permLga: "permanent local government area",
    permTown: "permanent town",
    // permDistrict: "permanent district",
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

export const validateWorkforce = (workforce: any): string[] => {
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

export const validateBank = (bank: any): string[] => {
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

export const validateVerification = (verification: any): string[] => {
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

export const validateOccupation = (occupation: any): string[] => {
  const errors: string[] = [];

  if (!occupation.primaryOccupation || typeof occupation.primaryOccupation !== "string") {
    errors.push("Please provide your primary occupation");
  }
  if (!occupation.yearsExperience || typeof occupation.yearsExperience !== "string") {
    errors.push("Please provide your years of experience");
  }

  return errors;
};

export const validateOtherFarmInfo = (otherFarmInfo: any): string[] => {
  const errors: string[] = [];

  // Helper to check whether a value is provided (not null/undefined and not empty when string)
  const isProvided = (v: any) => v !== undefined && v !== null && (typeof v !== "string" || v.trim() !== "");

  // numCrops: accept number or numeric string
  if (isProvided(otherFarmInfo.numCrops)) {
    const raw = otherFarmInfo.numCrops;
    const asNumber = typeof raw === "string" ? Number(raw.trim()) : Number(raw);
    if (!Number.isFinite(asNumber) || asNumber < 0) {
      errors.push("Please provide a valid number of crops (must be 0 or greater)");
    }
  }

  // numLivestock: accept number or numeric string
  if (isProvided(otherFarmInfo.numLivestock)) {
    const raw = otherFarmInfo.numLivestock;
    const asNumber = typeof raw === "string" ? Number(raw.trim()) : Number(raw);
    if (!Number.isFinite(asNumber) || asNumber < 0) {
      errors.push("Please provide a valid number of livestock (must be 0 or greater)");
    }
  }

  // Annual harvest: should be a non-empty string when provided
  if (isProvided(otherFarmInfo.annualHarvest)) {
    if (typeof otherFarmInfo.annualHarvest !== "string") {
      errors.push("Please provide valid information about your annual harvest");
    } else if (otherFarmInfo.annualHarvest.trim() === "") {
      errors.push("Please provide valid information about your annual harvest");
    }
  }

  // yearsExperience: accept number or numeric string
  if (isProvided(otherFarmInfo.yearsExperience)) {
    const raw = otherFarmInfo.yearsExperience;
    const asNumber = typeof raw === "string" ? Number(raw.trim()) : Number(raw);
    if (!Number.isFinite(asNumber) || asNumber < 0) {
      errors.push("Please provide valid years of farming experience (must be 0 or greater)");
    }
  }

  return errors;
};

export const validateBusinessType = (businessType: any): string[] => {
  const errors: string[] = [];

  if (typeof businessType.isFarmer !== "boolean") {
    errors.push("Please specify if you are a farmer (Yes or No)");
  }
  if (typeof businessType.isSeller !== "boolean") {
    errors.push("Please specify if you are a seller (Yes or No)");
  }

  return errors;
};

export const validateSubmissionStatus = (submissionStatus: any): string[] => {
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
export const validateArrayData = (data: IUploadData): string[] => {
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
      // if (!farm.district || typeof farm.district !== "string") {
      //   errors.push(`Farm ${index + 1}: Please provide a valid district`);
      // }
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
      // if (!shop.district || typeof shop.district !== "string") {
      //   errors.push(`Shop ${index + 1}: Please provide a valid district`);
      // }
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

// Sanitize and interpret error messages
/**
 * Sanitize and interpret thrown errors into user-friendly messages.
 *
 * This function inspects common MongoDB/Mongoose error messages and maps them
 * to safe, non-technical messages suitable for returning to clients. It also
 * removes any database/model names or technical details before returning the
 * final message.
 *
 * @param {any} error - The caught error object (may contain a message property).
 * @return {string} A sanitized, user-friendly error message string.
 */
export function SanitizeCatchError(error: any): string {
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

  return sanitizedMessage;
}
