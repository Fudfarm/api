import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PasswordReset } from "../../../models/v1/PasswordReset";
import User, { hashPassword } from "../../../models/v1/User";
import { IsUserExist } from "../../../function/exist/User";
import { sendEmail } from "../../../utils/mailer";
import { config } from "../../../config";
import { passwordResetSuccessfulBody } from "../../../emails/password-reset-successful";

export const resetPassword = async (req: Request, res: Response) => {
  const { id, token, email, newPassword } = req.body;

  // token is madatory, either id or email is required
  if (!token || (!id && !email)) {
    return res
      .status(400)
      .json({ message: "Token invalid details" });
  }

  const resetRecord = await PasswordReset.findOne(
    email ? { email: email.toLowerCase().trim() } : { _id: id }
  );
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
      isVerified: true, // User is verified after password reset
    }
  );

  await PasswordReset.deleteMany({ userId: resetRecord.userId });

  const user = await User.findOne({ _id: resetRecord.userId });
  if (!user) return res.status(404).json({ message: "Record not found" });

  await sendEmail({
    to: user.email || "",
    subject: `Password Reset Successfully | ${config.appName}`,
    title: "Password Reset Successfully",
    body: passwordResetSuccessfulBody({
      name: user.surname,
    }),
  });

  return res.status(200).json({ message: "Password successfully reset" });
};
