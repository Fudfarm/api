import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PasswordReset } from "../../../models/v1/PasswordReset";
import User, { hashPassword } from "../../../models/v1/User";
import { IsUserExist } from "../../../function/exist/User";

export const resetPassword = async (req: Request, res: Response) => {
  const { id, token, newPassword } = req.body;

  const resetRecord = await PasswordReset.findOne({ _id: id });
  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    return res.status(400).json({ message: "Token expired or invalid" });
  }

  await IsUserExist(res, resetRecord.userId);

  const isValid = await bcrypt.compare(
    token.toUpperCase(),
    resetRecord.tokenHash
  );
  if (!isValid) return res.status(403).json({ message: "Invalid token" });

  await User.updateOne(
    {
      _id: resetRecord.userId,
    },
    {
      password: await hashPassword(newPassword),
    }
  );

  await PasswordReset.deleteMany({ userId: resetRecord.userId });

  return res.status(200).json({ message: "Password successfully reset" });
};
