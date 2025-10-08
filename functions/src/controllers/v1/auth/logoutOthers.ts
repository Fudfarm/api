import { Request, Response } from "express";
import { hashToken, verifyRefreshToken } from "../../../utils/token";
import { RefreshToken } from "../../../models/v1/RefreshToken";

export const logoutOthers = async (req: Request, res: Response) => {
  const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
  if (!refreshToken)
    return res.status(400).json({ message: "Refresh token required" });

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded)
    return res.status(403).json({ message: "Invalid refresh token" });

  const userId = decoded.id;
  const currentTokenHash = hashToken(refreshToken);

  // Delete all other tokens for the user except the current one
  await RefreshToken.deleteMany({
    userId,
    tokenHash: { $ne: currentTokenHash },
  });

  return res.status(200).json({
    message: "Logged out from all other devices",
  });
};
