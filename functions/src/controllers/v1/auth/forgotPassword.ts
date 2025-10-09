import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../../../models/v1/User";
import { generateToken } from "../../../function/function3";
import { PasswordReset } from "../../../models/v1/PasswordReset";
import { config } from "../../../config";
import { sendEmail } from "../../../utils/mailer";
import { resetPasswordBody } from "../../../emails/reset-password";

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "Record not found" });

  const token = generateToken(8); // Generate a secure token
  const tokenHash = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await PasswordReset.deleteMany({ userId: user._id });

  const record = await PasswordReset.create({
    email: email.toLowerCase().trim(),
    userId: user._id,
    tokenHash,
    expiresAt,
  });

  const resetLink = `https://${
    config.rootDomain
  }/update-password?token=${token}&id=${encodeURIComponent(record._id)}`;

  await sendEmail({
    to: email,
    subject: `Reset Your Password | ${config.appName}`,
    title: "Password Reset",
    body: resetPasswordBody({
      name: user.surname,
      token,
      link: resetLink,
    }),
  });

  return res.status(200).json({ message: "Password reset email sent." });
};
