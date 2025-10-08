import { Response } from "express";
import bcrypt from "bcrypt";
import { AuthenticatedRequest } from "../../../middleware/auth";
import { handleError } from "../../../function/error";
import User, { hashPassword } from "../../../models/v1/User";

export const updatePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id; // from AuthGuard
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "oldPassword, newPassword, and confirmPassword are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirmation password do not match.",
      });
    }

    // 1️⃣ Find user and include password
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2️⃣ Check old password correctness
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }

    // 4️⃣ Update and save
    user.password = await hashPassword(newPassword);
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    return handleError(error, res, "Error updating password");
  }
};
