import { Request, Response } from "express";
import { config } from "../../../config";
import { handleAuthTokens } from "../../../function/cookie";
import { handleError } from "../../../function/error";
import { getClientIp } from "../../../function/function3";
import { getPinExpiryLeft } from "../../../function/security";
import { IUser } from "../../../interface/user";
import { Unit } from "../../../models/v1/farmer/Unit";
import { RefreshToken } from "../../../models/v1/RefreshToken";
import User from "../../../models/v1/User";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../../../utils/token";

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
      email: email.toLowerCase().trim(),
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
      },
    );

    let nonCookieToken = {};

    if (!device || device.toLowerCase().trim() === "web") {
      handleAuthTokens(res, accessToken, refreshToken, config);
    } else {
      nonCookieToken = { accessToken, refreshToken };
    }

    return res.status(200).json({
      message: "Login successful",
      nonCookieToken, // used for non-web clients
      data: await ReturnedData(user, device),
    });
  } catch (error) {
    return handleError(error, res, "Error logging in");
  }
};

/**
 * Returns selected user data fields.
 * @param {IUser} user - The user object.
 * @param {string} device - The device type used for login.
 * @return {object} An object containing user data.
 */
export async function ReturnedData(user: IUser, device: string) {
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
    isEncryptionPinSet: user.pinEncryption ? true : false,
    pinEncryptionExpiry: user.pinEncryptionExpiry
      ? getPinExpiryLeft(user.pinEncryptionExpiry)
      : null,
    // in case of mobile application, some data are sent along
    prepare: await prepareData(device),
  };
}

// only mobile application have prepare data
const prepareData = async (device: string) => {
  return {
    units: await getUnits(device),
  };
};

const getUnits = async (device: string) => {
  if (device && device.toLowerCase().trim() === "mobile") {
    const units = await Unit.find().sort({ type: 1, unit: 1 });

    return units.map((u) => ({ id: u._id, type: u.type, unit: u.unit }));
  }

  return [];
};
