import bcrypt from "bcrypt";
import { Response } from "express";
import { handleError } from "../../../function/error";
import { decryptPin } from "../../../function/security";
import { AuthenticatedRequest } from "../../../middleware/auth";
import User from "../../../models/v1/User";

export const showEncryptionPin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id; // from AuthGuard
    const { showUserId, password } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    // Find admin details to verify password
    const admin = await User.findById(userId).select({
      password: 1,
    });

    if (!admin) {
      return res.status(404).json({ message: "Caller account not found." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Your password is incorrect." });
    }

    // Find the user whose pinEncryption is to be shown
    const user = await User.findById(showUserId).select({
      pinEncryption: 1,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.pinEncryption) {
      return res.status(400).json({ message: "User has not set an encryption pin." });
    }

    const decryptedPin = decryptPin(user.pinEncryption);

    return res.status(200).json({
      message: "Pin updated successfully.",
      pin: decryptedPin,
    });
  } catch (error) {
    return handleError(error, res, "Error updating pin");
  }
};
