import bcrypt from "bcrypt";
import { Response } from "express";
import { handleError } from "../../../function/error";
import { encryptPin, getPinExpiryLeft } from "../../../function/security";
import { AuthenticatedRequest } from "../../../middleware/auth";
import User from "../../../models/v1/User";

export const updateEncryptionPin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id; // from AuthGuard
    const { newPin, confirmPin, password } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    if (!newPin || !confirmPin) {
      return res.status(400).json({
        message: "New pin and confirm pin are required.",
      });
    }

    if (newPin !== confirmPin) {
      return res.status(400).json({
        message: "New pin and confirmation pin do not match.",
      });
    }

    // Find user and include pinEncryption
    const user = await User.findById(userId).select({
      password: 1,
      pinEncryption: 1,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If user has an existing pinEncryption, verify password
    if (user.pinEncryption) {
      if (!password) {
        return res
          .status(400)
          .json({ message: "Password is required to update pin." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Your password is incorrect." });
      }
    }

    const newPinEncryption = encryptPin(newPin);
    const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await User.updateOne(
      {
        _id: userId,
      },
      {
        pinEncryption: newPinEncryption,
        pinEncryptionExpiry: date, // 30 days from now
      }
    );

    return res.status(200).json({
      message: "Pin updated successfully.",
      isEncryptionPinSet: true,
      pinEncryptionExpiry: getPinExpiryLeft(date),
    });
  } catch (error) {
    return handleError(error, res, "Error updating pin");
  }
};
