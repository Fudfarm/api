import { Request, Response } from "express";
import { parseDuration } from "./function2";
import { verifyRefreshToken } from "../utils/token";

/**
 * Handles the setting of authentication tokens in cookies or response body.
 * This function checks if the device is a web client and sets cookies accordingly.
 * If the device is not web, it adds the tokens to the response data.
 * @param {Response} res - The Express response object
 * @param {string | undefined} device - The device type (e.g., "web", "mobile")
 * @param {string} accessToken - The generated access token
 * @param {string} refreshToken - The generated refresh token
 * @param {Object} config - Configuration object containing token expiry settings
 * @param {string} config.accessTokenExpiry - Expiry duration for access token
 * @param {string} config.refreshTokenExpiry - Expiry duration for refresh token
 * @param {AuthResponse} responseData - The response data to be sent back
 * @param {string} [tokenAppend] - Optional prefix for cookie names
 * @return {Record<string, any>} - The updated response data with tokens if device is not web
 */
export function handleAuthTokens(
  res: Response,
  device: string | undefined,
  accessToken: string,
  refreshToken: string,
  config: {
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
  },
  responseData: Record<string, any> = {},
  tokenAppend = ""
): Record<string, any> {
  const isWebClient = !device || device === "web";

  if (isWebClient) {
    res.cookie(`${tokenAppend}authorization`, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: `.${process.env.ROOT_DOMAIN}`,
      maxAge: parseDuration(config.accessTokenExpiry),
    });

    res.cookie(`${tokenAppend}refreshToken`, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: `.${process.env.ROOT_DOMAIN}`,
      maxAge: parseDuration(config.refreshTokenExpiry),
    });
  } else {
    responseData.accessToken = accessToken;
    responseData.refreshToken = refreshToken;
  }

  return responseData;
}

/**
 * Extracts the user ID from the token in the request.
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 * @return {string | undefined} The user ID if found, otherwise undefined
 */
export function getTokenUserId(
  req: Request,
  res: Response
): string | undefined | never {
  const authToken = req.body?.authorization || req.cookies?.authorization;

  if (!authToken) {
    res.status(417).json({ message: "Authorization token required" });
    throw new Error("Authorization token required");
  }

  const decoded = verifyRefreshToken(authToken);

  if (!decoded) {
    res.status(401).json({ message: "Invalid authorization token" });
    throw new Error("Invalid authorization token");
  }

  return decoded.id;
}
