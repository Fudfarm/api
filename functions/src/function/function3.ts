import { Request as ExpressRequest } from "express";
import crypto, { randomBytes } from "crypto";
/**
 * Gets the client's IP address from the request.
 * @param {ExpressRequest} req - The Express request object.
 * @return {string} The client's IP address as a string.
 */
export function getClientIp(req: ExpressRequest): string {
  const forwarded = req.headers["x-forwarded-for"];

  let ip: string | undefined;

  if (typeof forwarded === "string") {
    ip = forwarded.split(",")[0].trim();
  } else if (Array.isArray(forwarded)) {
    ip = (forwarded[0] as string).trim();
  } else {
    ip = req.ip;
  }

  if (ip?.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  return ip || "";
}


/**
 * Generates a secure random token.
 * @param {number} length - The length of the token to generate.
 * @return {string} A secure random token.
 */
export function generateToken(length = 16) {
  if (length < 2) throw new Error("Length must be at least 2");

  const numbers = "0123456789";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const allChars = numbers + letters;

  // Ensure at least one capital letter and one number
  const token = [
    numbers[crypto.randomInt(0, numbers.length)],
    letters[crypto.randomInt(0, letters.length)],
  ];

  // Fill the rest randomly
  for (let i = 2; i < length; i++) {
    token.push(allChars[crypto.randomInt(0, allChars.length)]);
  }

  // Secure shuffle
  for (let i = token.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [token[i], token[j]] = [token[j], token[i]];
  }

  return token.join("");
}

/**
 * Generate a secure random password.
 * @param {number} length The length of the password to generate.
 * @return {string} A secure random password.
 * @example
 * const password = randomPassword(16);
 * console.log(password); // Outputs a random password of length 16
 * @throws {Error} If the random bytes generation fails.
 * @see {@link https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_length_callback}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues}
 * @see {@link https://www.npmjs.com/package/crypto}
 */
export function randomPassword(length = 12): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:',.<>?/~`";
  const charsetLength = charset.length;
  const randomValues = randomBytes(length);
  return Array.from(randomValues)
    .map((byte) => charset[byte % charsetLength])
    .join("");
}

/**
 * Formats a date string into a short, human-readable format.
 * @param {string} dateString
 * @param {object} options
 * @return {string} Formatted date string or "N/A" if input is invalid.
 */
export function formatDateToShort(
  dateString?: string | null,
  options?: { includeTime?: boolean }
): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    const datePart = date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    if (options?.includeTime) {
      const timePart = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return `${datePart} ${timePart}`;
    }

    return datePart;
  } catch {
    return "Invalid date";
  }
}
