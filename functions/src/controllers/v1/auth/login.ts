import { Request, Response } from "express";
import { handleError } from "../../../function/error";
import User from "../../../models/v1/User";
import { generateAccessToken, generateRefreshToken, hashToken } from "../../../utils/token";
import { getClientIp } from "../../../function/function3";
import { RefreshToken } from "../../../models/v1/RefreshToken";
import { handleAuthTokens } from "../../../function/cookie";
import { config } from "../../../config";
import { IUser } from "../../../interface/user";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, device } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // check account status
    if (user.status !== "Active")
      return res.status(403).json({ message: "Account is not active" });

    const accessToken = generateAccessToken({
      _id: user.id as string,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ _id: String(user.id) });
    const tokenHash = hashToken(refreshToken);

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    const currentIp = getClientIp(req);

    // Delete any token with same userAgent and IP
    await RefreshToken.deleteMany({
      userId: user.id,
      userAgent: req.headers["user-agent"],
      ip: currentIp,
    });

    await RefreshToken.create({
      userId: user.id,
      tokenHash,
      userAgent: req.headers["user-agent"],
      ip: currentIp,
      expiresAt: expires,
    });

    // Update user's last login time
    await User.updateOne(
      { _id: user.id },
      {
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      }
    );

    let nonCookieToken = {};

    if (!device || device.toLowerCase().trim() === "web") {
      handleAuthTokens(
        res,
        accessToken,
        refreshToken,
        config
      );
    } else {
      nonCookieToken = { accessToken, refreshToken };
    }

    return res.status(200).json({
      message: "Login successful",
      nonCookieToken, // used for non-web clients
      data: await ReturnedData(user),
    });
  } catch (error) {
    return handleError(error, res, "Error logging in");
  }
};


/**
 * Returns selected user data fields.
 * @param {IUser} user - The user object.
 * @return {object} An object containing user data.
 */
export async function ReturnedData(user: IUser) {
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    surname: user.surname,
    firstname: user.firstname,
    othernames: user.othernames,
    gender: user.gender,
    phone: user.phone || "",
    allowNotifications: user.allowNotifications ? true : false,
  };
}
