import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PasswordReset } from "../../../models/v1/PasswordReset";

export const validResetPwdToken = async (req: Request, res: Response) => {
  const { id, email, token } = req.body;

  // token is madatory, either id or email is required
  if (!token || (!id && !email)) {
    return res
      .status(400)
      .json({ message: "Token invalid details" });
  }

  // Find record by email or id
  const resetRecord = await PasswordReset.findOne(
    email ? { email: email.toLowerCase().trim() } : { _id: id }
  );
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
