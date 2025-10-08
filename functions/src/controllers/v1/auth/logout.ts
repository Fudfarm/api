import { Request, Response } from "express";
import { hashToken } from "../../../utils/token";
import { RefreshToken } from "../../../models/v1/RefreshToken";
import { authCookie, refreshCookie } from "../../../function/function2";

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
  if (!refreshToken)
    return res.status(400).json({ message: "No refresh token provided" });

  const hashed = hashToken(refreshToken);
  await RefreshToken.deleteOne({ tokenHash: hashed });

  authCookie(res, "", "authorization", {
    accessTokenExpiry: "0",
  });

  refreshCookie(res, "", "refreshToken", {
    refreshTokenExpiry: "0",
  });

  return res.status(200).json({ message: "Logged out from current device" });
};
