import { Request, Response } from "express";
import { verifyRefreshToken } from "../../../utils/token";
import { RefreshToken } from "../../../models/v1/RefreshToken";
import { getClientIp } from "../../../function/function3";

export const getDevices = async (req: Request, res: Response) => {
  const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  const allTokens = await RefreshToken.find({ userId: decoded.id });

  const currentIp = getClientIp(req);
  const currentUA = req.headers["user-agent"] || "";

  const currentDevice = allTokens.find(
    (t) => t.ip === currentIp && t.userAgent === currentUA
  );

  const otherDevices = allTokens.filter(
    (t) => !(t.ip === currentIp && t.userAgent === currentUA)
  );

  return res.status(200).json({
    count: allTokens.length,
    currentDevice: currentDevice || null,
    otherDevices,
  });
};
