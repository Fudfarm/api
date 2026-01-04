import crypto from "crypto";

/**
 * Encryption algorithm used for PIN protection.
 * AES-256-GCM provides:
 * - Confidentiality (PIN is unreadable)
 * - Integrity (tamper detection)
 * - Authentication (authTag)
 * @constant {string}
 */
const ALGORITHM = "aes-256-gcm";

/**
 * Encrypts a PIN using AES-256-GCM.
 *
 * Each encryption uses a random IV to ensure:
 * - The same PIN encrypts differently every time
 * - No pattern leakage
 *
 * @param {string} pin - The plaintext PIN to encrypt.
 * @return {{encryptedPin: string, iv: string, authTag: string}} Object containing ciphertext and metadata (all hex-encoded).
 */
export function encryptPin(pin: string) {
  const keyHex = process.env.PIN_ENCRYPTION_KEY || "";
  if (!keyHex) {
    console.error("Unable to encrypt PIN - missing PIN_ENCRYPTION_KEY");
    throw new Error("Missing required environment variable: PIN_ENCRYPTION_KEY");
  }

  const KEY = Buffer.from(keyHex, "hex");
  if (KEY.length !== 32) {
    throw new Error("PIN_ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
  }

  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    const encrypted = Buffer.concat([
      cipher.update(pin, "utf8"),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return {
      encryptedPin: encrypted.toString("hex"),
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
    };
  } catch (err) {
    console.error("PIN encryption failed:", err);
    throw new Error("Failed to encrypt PIN");
  }
}

/**
 * Decrypts an encrypted PIN using AES-256-GCM.
 *
 * Decryption will fail if the key/IV/authTag are incorrect or the
 * ciphertext was tampered with.
 *
 * @param {{encryptedPin: string, iv: string, authTag: string}} data - Encrypted PIN object from the database (hex-encoded fields).
 * @return {string} Decrypted plaintext PIN.
 * @throws {Error} If authentication fails or decryption is unsuccessful.
 */
export function decryptPin(data: {
  encryptedPin: string;
  iv: string;
  authTag: string;
}) {
  const keyHex = process.env.PIN_ENCRYPTION_KEY || "";
  if (!keyHex) {
    console.error("Unable to decrypt PIN - missing PIN_ENCRYPTION_KEY");
    throw new Error("Missing required environment variable: PIN_ENCRYPTION_KEY");
  }

  const KEY = Buffer.from(keyHex, "hex");
  if (KEY.length !== 32) {
    throw new Error("PIN_ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
  }

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      KEY,
      Buffer.from(data.iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(data.authTag, "hex"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data.encryptedPin, "hex")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (err) {
    console.error("PIN decryption failed:", err);
    throw new Error("Failed to decrypt PIN");
  }
}

/**
 * Calculate the number of full days remaining until the PIN encryption expires.
 *
 * - Returns 0 if already expired, null, undefined, or invalid date is supplied.
 * - Accepts a Date object, ISO date string, or timestamp (number).
 *
 * @param {Date | string | number | null | undefined} expiryInput - The expiration date of the PIN encryption.
 * @return {number} The number of full days left until expiration. Returns 0 for invalid or past dates.
 */
export function getPinExpiryLeft(expiryInput: Date | string | number | null | undefined): number {
  if (!expiryInput) return 0;

  const expiryDate = expiryInput instanceof Date ? expiryInput : new Date(expiryInput);

  if (!(expiryDate instanceof Date) || isNaN(expiryDate.getTime())) return 0;

  const now = new Date();
  const msDiff = expiryDate.getTime() - now.getTime();
  const daysLeft = Math.floor(msDiff / (1000 * 60 * 60 * 24));

  return Math.max(daysLeft, 0);
}
