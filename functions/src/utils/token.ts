import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config";

interface JwtPayload {
  id: string;
  email?: string;
}

export const generateAccessToken = (user: { _id: string; email: string }) => {
  const tokenOptions: SignOptions = {
    expiresIn: config.accessTokenExpiry as SignOptions["expiresIn"],
  };

  return jwt.sign(
    { id: user._id, email: user.email },
    config.jwtSecret,
    tokenOptions
  );
};

export const generateRefreshToken = (user: { _id: string }) => {
  const tokenOptions: SignOptions = {
    expiresIn: config.refreshTokenExpiry as SignOptions["expiresIn"],
  };

  return jwt.sign({ id: user._id }, config.jwtRefreshSecret, tokenOptions);
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret) as JwtPayload;
  } catch {
    return null;
  }
};

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");
