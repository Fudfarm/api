import { Response } from "express";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { handleError } from "../../../function/error";
import { randomPassword } from "../../../function/function3";
import {
  SanitizeCatchError,
  validateAddress,
  validateArrayData,
  validateBank,
  validateBusinessType,
  validateContact,
  validateOccupation,
  validateOtherFarmInfo,
  validateSubmissionStatus,
  validateUserData,
  validateVerification,
  validateWorkforce,
} from "../../../function/uploadValidation";
import { IUploadData, IUploadResponse } from "../../../interface/farmer";
import { AuthenticatedRequest } from "../../../middleware/auth";
import User from "../../../models/v1/User";
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
} from "../../../models/v1/farmer";


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

          let recordID = data.onlineID || null;
          let password = randomPassword(20);
          let isUpdate = false;

          if (recordID) {
            // Try to find existing user
            const existingUser = await User.findById(recordID).session(session);
            if (existingUser) {
              isUpdate = true;
              password = existingUser.password;
              // Update user fields
              existingUser.surname = data.biodata.surname;
              existingUser.firstname = data.biodata.firstname;
              existingUser.othernames = data.biodata.othernames;
              existingUser.email = data.contact.email || undefined;
              existingUser.phone = data.contact.phone1 || undefined;
              existingUser.gender = data.biodata.gender;
              existingUser.maritalStatus = data.biodata.marital;
              existingUser.birthdate = new Date(data.biodata.birthDate);
              existingUser.noOfFamily = parseInt(data.biodata.families) || 0;
              existingUser.disease = data.biodata.disease || "";
              existingUser.otherInfo = data.biodata.others || "";
              await existingUser.save({ session });

              // Update or upsert all single-record associates
              await Contact.findOneAndUpdate(
                { recordID },
                {
                  phone1: data.contact.phone1 || "",
                  phone2: data.contact.phone2 || "",
                  email: data.contact.email || "",
                  website: data.contact.website || "",
                  promoMeans1: data.contact.promoMeans1,
                  promoMeans2: data.contact.promoMeans2 || "",
                  others: data.contact.others || "",
                },
                { upsert: true, session }
              );
              await Address.findOneAndUpdate(
                { recordID },
                {
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
                },
                { upsert: true, session }
              );
              await Workforce.findOneAndUpdate(
                { recordID },
                {
                  staffSize: data.workforce.staffSize,
                  labourType: data.workforce.labourType || "",
                },
                { upsert: true, session }
              );
              await Bank.findOneAndUpdate(
                { recordID },
                {
                  bank: data.bank.bank,
                  accountName: data.bank.accountName,
                  accountNumber: data.bank.accountNumber,
                },
                { upsert: true, session }
              );
              await Verification.findOneAndUpdate(
                { recordID },
                {
                  bvn: data.verification.bvn,
                  nin: data.verification.nin || "",
                  businessName: data.verification.businessName || "",
                  businessNumber: data.verification.businessNumber || "",
                  otherType: data.verification.otherType || "",
                  otherNumber: data.verification.otherNumber || "",
                  others: data.verification.others || "",
                },
                { upsert: true, session }
              );
              await Occupation.findOneAndUpdate(
                { recordID },
                {
                  primaryOccupation: data.occupation.primaryOccupation,
                  secondaryOccupation: data.occupation.secondaryOccupation || "",
                  yearsExperience: data.occupation.yearsExperience,
                },
                { upsert: true, session }
              );
              await OtherFarmInfo.findOneAndUpdate(
                { recordID },
                {
                  numCrops: data.otherFarmInfo.numCrops || 0,
                  numLivestock: data.otherFarmInfo.numLivestock || 0,
                  annualHarvest: data.otherFarmInfo.annualHarvest || "",
                  yearsExperience: data.otherFarmInfo.yearsExperience || 0,
                  challenges: data.otherFarmInfo.challenges || "",
                },
                { upsert: true, session }
              );
              await BusinessType.findOneAndUpdate(
                { recordID },
                {
                  isFarmer: data.business_type.isFarmer,
                  isSeller: data.business_type.isSeller,
                },
                { upsert: true, session }
              );
              await SubmissionStatus.findOneAndUpdate(
                { recordID },
                {
                  isUpdated: data.submissionStatus.isUpdated,
                  isConsent: data.submissionStatus.isConsent,
                  isImage: data.submissionStatus.isImage,
                  isSubmitted: data.submissionStatus.isSubmitted,
                  submittedBy: uploadedBy,
                  status: "Pending",
                },
                { upsert: true, session }
              );

              // Delete all shop locations and items for this user
              await ShopItems.deleteMany({ recordID }, { session });
              await ShopLocation.deleteMany({ recordID }, { session });
            } else {
              // If not found, treat as new
              recordID = uuidv4();
            }
          } else {
            // New record
            recordID = uuidv4();
          }

          if (!isUpdate) {
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
              createdBy: uploadedBy,
              role: "Farmer",
              status: "Disabled",
              password,
              otherInfo: data.biodata.others || "",
            });
            await user.save({ session });
          }

          // Save or update all single-record associates (upsert covers both cases)
          await Contact.findOneAndUpdate(
            { recordID },
            {
              phone1: data.contact.phone1 || "",
              phone2: data.contact.phone2 || "",
              email: data.contact.email || "",
              website: data.contact.website || "",
              promoMeans1: data.contact.promoMeans1,
              promoMeans2: data.contact.promoMeans2 || "",
              others: data.contact.others || "",
            },
            { upsert: true, session }
          );
          await Address.findOneAndUpdate(
            { recordID },
            {
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
            },
            { upsert: true, session }
          );
          await Workforce.findOneAndUpdate(
            { recordID },
            {
              staffSize: data.workforce.staffSize,
              labourType: data.workforce.labourType || "",
            },
            { upsert: true, session }
          );
          await Bank.findOneAndUpdate(
            { recordID },
            {
              bank: data.bank.bank,
              accountName: data.bank.accountName,
              accountNumber: data.bank.accountNumber,
            },
            { upsert: true, session }
          );
          await Verification.findOneAndUpdate(
            { recordID },
            {
              bvn: data.verification.bvn,
              nin: data.verification.nin || "",
              businessName: data.verification.businessName || "",
              businessNumber: data.verification.businessNumber || "",
              otherType: data.verification.otherType || "",
              otherNumber: data.verification.otherNumber || "",
              others: data.verification.others || "",
            },
            { upsert: true, session }
          );
          await Occupation.findOneAndUpdate(
            { recordID },
            {
              primaryOccupation: data.occupation.primaryOccupation,
              secondaryOccupation: data.occupation.secondaryOccupation || "",
              yearsExperience: data.occupation.yearsExperience,
            },
            { upsert: true, session }
          );
          await OtherFarmInfo.findOneAndUpdate(
            { recordID },
            {
              numCrops: data.otherFarmInfo.numCrops || 0,
              numLivestock: data.otherFarmInfo.numLivestock || 0,
              annualHarvest: data.otherFarmInfo.annualHarvest || "",
              yearsExperience: data.otherFarmInfo.yearsExperience || 0,
              challenges: data.otherFarmInfo.challenges || "",
            },
            { upsert: true, session }
          );
          await BusinessType.findOneAndUpdate(
            { recordID },
            {
              isFarmer: data.business_type.isFarmer,
              isSeller: data.business_type.isSeller,
            },
            { upsert: true, session }
          );
          await SubmissionStatus.findOneAndUpdate(
            { recordID },
            {
              isUpdated: data.submissionStatus.isUpdated,
              isConsent: data.submissionStatus.isConsent,
              isImage: data.submissionStatus.isImage,
              isSubmitted: data.submissionStatus.isSubmitted,
              submittedBy: uploadedBy,
              status: "Pending",
            },
            { upsert: true, session }
          );

          // Always delete all shop locations and items for this user (for both update and new)
          await ShopItems.deleteMany({ recordID }, { session });
          await ShopLocation.deleteMany({ recordID }, { session });

          // Create array records
          const arrayPromises = [];

          // Create animal info records
          if (data.animalInfo && Array.isArray(data.animalInfo)) {
            // delete existing animal info records to avoid duplicates
            if (data.animalInfo.length > 0)
              await AnimalInfo.deleteMany({ recordID }, { session });

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
            // delete existing crop info records to avoid duplicates
            if (data.cropInfo.length > 0)
              await CropInfo.deleteMany({ recordID }, { session });

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
            // delete existing farm info records to avoid duplicates
            if (data.farmInfo.length > 0)
              await FarmInfo.deleteMany({ recordID }, { session });

            for (const farm of data.farmInfo) {
              const farmInfo = new FarmInfo({
                recordID,
                state: farm.state,
                lga: farm.lga,
                town: farm.town,
                district: farm.district,
                landmark: farm.landmark,
                numCrops: farm.numCrops || 0,
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
          errorMessages = [SanitizeCatchError(error)];
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
