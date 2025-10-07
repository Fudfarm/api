import { Response } from "express";

/**
 * Converts strings like "1h", "7d", "15m", "30s" into milliseconds
 *
 * @param {string} input - The duration string to parse (e.g., "1h", "7d", "30m", "30s").
 * @return {number} The duration in milliseconds.
 *
 * @example
 * parseDuration("1h") => 3600000
 * parseDuration("7d") => 604800000
 * parseDuration("30m") => 1800000
 */
export const parseDuration = (input: string): number => {
  const match = /^(\d+)([smhd])$/.exec(input.trim());
  if (!match) throw new Error(`Invalid duration format: "${input}"`);

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000, // seconds
    m: 60 * 1000, // minutes
    h: 60 * 60 * 1000, // hours
    d: 24 * 60 * 60 * 1000, // days
  };

  return value * multipliers[unit];
};

/**
 * Sets the authorization cookie with the provided access token and configuration.
 *
 * @param {Response} res - The response object to set the cookie on.
 * @param {string} accessToken - The access token to store in the cookie.
 * @param {string} name - The name of the cookie.
 * @param {string} config - The configuration object containing accessTokenExpiry.
 */
export function authCookie(
  res: Response,
  accessToken: string,
  name: string,
  config: { accessTokenExpiry: string }
): void {
  const isClearing = config.accessTokenExpiry === "0";

  res.cookie(name, accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: `.${process.env.ROOT_DOMAIN}`,
    maxAge: isClearing ? 0 : parseDuration(config.accessTokenExpiry),
  });
}

/**
 * Sets the refresh token cookie with the provided refresh token and configuration.
 *
 * @param {Response} res - The response object to set the cookie on.
 * @param {string} refreshToken - The refresh token to store in the cookie.
 * @param {string} name - The name of the cookie.
 * @param {string} config - The configuration object containing refreshTokenExpiry.
 */
export function refreshCookie(
  res: Response,
  refreshToken: string,
  name: string,
  config: { refreshTokenExpiry: string }
): void {
  const isClearing = config.refreshTokenExpiry === "0";

  res.cookie(name, refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: `.${process.env.ROOT_DOMAIN}`,
    maxAge: isClearing ? 0 : parseDuration(config.refreshTokenExpiry),
  });
}
