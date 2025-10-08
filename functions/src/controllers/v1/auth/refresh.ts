import { Request, Response } from "express";
import { handleError } from "../../../function/error";
import { generateAccessToken, hashToken, verifyRefreshToken } from "../../../utils/token";
import { RefreshToken } from "../../../models/v1/RefreshToken";
import User from "../../../models/v1/User";
import { handleAuthTokens } from "../../../function/cookie";
import { config } from "../../../config";

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
    const device = req.body?.device;

    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token provided" });

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded)
      return res.status(403).json({ message: "Invalid refresh token" });

    const hashed = hashToken(refreshToken);
    const existing = await RefreshToken.findOne({
      tokenHash: hashed,
      userId: decoded.id,
    });
    if (!existing)
      return res.status(403).json({
        message: "Refresh token not recognized",
      });

    const user = await User.findOne({ _id: decoded.id });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete all expired tokens for this user
    await RefreshToken.deleteMany({
      userId: user._id,
      expiresAt: { $lte: new Date() },
    });

    const newAccessToken = generateAccessToken({
      _id: user._id as string,
      email: user.email,
    });

    if (user.status !== "Active") {
      return res.status(403).json({ message: "Account is not active" });
    }

    let nonCookieToken = {};

    if (!device || device.toLowerCase().trim() === "web") {
      handleAuthTokens(
        res,
        newAccessToken,
        refreshToken,
        config
      );
    } else {
      nonCookieToken = { newAccessToken, refreshToken };
    }

    return res.status(200).json({
      message: "Login successful",
      nonCookieToken, // used for non-web clients
      data: {
        email: user.email,
        role: user.role,
        surname: user.surname,
        firstname: user.firstname,
        othernames: user.othernames,
        gender: user.gender,
      },
    });
  } catch (err) {
    return handleError(err, res, "Error refreshing token");
  }
};
