import { Response } from "express";
import mongoose from "mongoose";
import { handleError } from "../../../../function/error";
import { deleteStorageFile } from "../../../../function/firebase/storage";
import { SERVER } from "../../../../function/variables";
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

export const destroyFarmer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Not authenticated" });

    const { id } = req.params; // farmer id to delete
    if (!id) return res.status(400).json({ message: "Farmer id is required" });

    const { password } = req.body as { password?: string };
    if (!password) return res.status(400).json({ message: "Password is required" });

    // verify admin password
    const admin = await User.findById(adminId).select("password");
    if (!admin) return res.status(401).json({ message: "Authenticated user not found" });

    const ok = await admin.comparePassword(password);
    if (!ok) return res.status(403).json({ message: "Invalid password" });

    const farmer = await User.findById(id).lean();

    // Start a transaction to remove DB records
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Delete all related documents by recordID
        await Promise.all([
          Address.deleteMany({ recordID: id }).session(session),
          Contact.deleteMany({ recordID: id }).session(session),
          Bank.deleteMany({ recordID: id }).session(session),
          BusinessType.deleteMany({ recordID: id }).session(session),
          Occupation.deleteMany({ recordID: id }).session(session),
          Verification.deleteMany({ recordID: id }).session(session),
          OtherFarmInfo.deleteMany({ recordID: id }).session(session),
          Workforce.deleteMany({ recordID: id }).session(session),
          FarmInfo.deleteMany({ recordID: id }).session(session),
          CropInfo.deleteMany({ recordID: id }).session(session),
          AnimalInfo.deleteMany({ recordID: id }).session(session),
          ShopItems.deleteMany({ recordID: id }).session(session),
          ShopLocation.deleteMany({ recordID: id }).session(session),
          SubmissionStatus.deleteMany({ recordID: id }).session(session),
        ]);

        // Delete the user record
        await User.findByIdAndDelete(id).session(session);
      });

      // After DB commit, attempt to delete storage files (best-effort)
      const imagePath = `${SERVER.FARMER_IMAGE_PATH}/${id}.png`;
      const consentPath = `${SERVER.FARMER_CONSENT_PATH}/${id}.mp4`;

      try {
        await deleteStorageFile(imagePath);
      } catch (err) {
        console.warn("Failed to delete farmer image from storage:", err);
      }

      // delete offline image if exists
      const offlineImagePath = `${SERVER.FARMER_IMAGE_PATH}/${farmer?.offlineID}_offline.png`;
      try {
        await deleteStorageFile(offlineImagePath);
      } catch (err) {
        console.warn("Failed to delete farmer offline image from storage:", err);
      }

      try {
        await deleteStorageFile(consentPath);
      } catch (err) {
        console.warn("Failed to delete farmer consent from storage:", err);
      }

      // delete offline consent if exists
      const offlineConsentPath = `${SERVER.FARMER_CONSENT_PATH}/${farmer?.offlineID}_offline.mp4`;
      try {
        await deleteStorageFile(offlineConsentPath);
      } catch (err) {
        console.warn("Failed to delete farmer offline consent from storage:", err);
      }

      return res.status(200).json({ message: "Farmer and related records deleted" });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return handleError(error, res, "Error deleting farmer and related records");
  }
};
