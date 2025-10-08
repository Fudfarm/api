import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PasswordReset } from "../../../models/v1/PasswordReset";

export const validResetPwdToken = async (req: Request, res: Response) => {
  const { id, token } = req.body;

  if (!id || !token) {
    return res.status(400).json({ message: "Id and token are required" });
  }

  const resetRecord = await PasswordReset.findOne({ _id: id });
  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    return res.status(400).json({ message: "Token expired or invalid" });
  }

  const isValid = await bcrypt.compare(
    token.toUpperCase(), // Ensure token is compared in a case-insensitive manner
    resetRecord.tokenHash
  );
  if (!isValid) return res.status(403).json({ message: "Invalid token" });

  return res.status(200).json({ message: "Valid token" });
};
