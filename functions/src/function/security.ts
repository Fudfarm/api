import crypto from "crypto";

/**
 * Retrieves a required environment variable and throws if it's missing.
 *
 * Prevents silent encryption failures and irreversible data loss caused
 * by missing keys.
 *
 * @param {string} name - Name of the environment variable.
 * @return {string} The environment variable value.
 * @throws {Error} If the environment variable is not set.
 */
function getEnv(): string {
  const value = process.env.PIN_ENCRYPTION_KEY || "";
  if (!value) {
    console.error("Unable to decrypt PIN - missing values");
    throw new Error("Missing required environment variable: PIN_ENCRYPTION_KEY");
  }
  return value;
}

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
 * Master encryption key used to encrypt/decrypt PINs.
 *
 * Requirements:
 * - 32 bytes (256 bits)
 * - Stored securely (ENV / Vault / KMS)
 * - NEVER stored in the database or client
 * @constant {Buffer}
 */
const KEY = Buffer.from(getEnv(), "hex");

/**
 * Validate key length to ensure correct AES-256 usage.
 * Failing fast here prevents permanent data corruption.
 */
if (KEY.length !== 32) {
  throw new Error("PIN_ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
}

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
  try {
  /**
   * Initialization Vector (IV)
   * - Must be unique per encryption
   * - 96 bits is recommended for GCM
   * - Not secret, stored alongside ciphertext
   */
    const iv = crypto.randomBytes(12);

    /**
   * Create AES-GCM cipher using key and IV
   */
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    /**
   * Encrypt the PIN and finalize the cipher
   */
    const encrypted = Buffer.concat([
      cipher.update(pin, "utf8"),
      cipher.final(),
    ]);

    /**
   * Authentication tag used to verify data integrity
   * Prevents tampering or modification attacks
   */
    const authTag = cipher.getAuthTag();

    return {
      encryptedPin: encrypted.toString("hex"), // Ciphertext
      iv: iv.toString("hex"), // Initialization Vector
      authTag: authTag.toString("hex"), // Integrity tag
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
  try {
  /**
   * Create decipher using same algorithm, key, and IV
   */
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      KEY,
      Buffer.from(data.iv, "hex")
    );

    /**
   * Attach authentication tag to verify integrity
   */
    decipher.setAuthTag(Buffer.from(data.authTag, "hex"));

    /**
   * Attempt decryption.
   * Throws if authentication fails.
   */
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
  if (!expiryInput) {
    return 0;
  }

  const expiryDate = expiryInput instanceof Date
    ? expiryInput
    : new Date(expiryInput);

  // Invalid date check
  if (!(expiryDate instanceof Date) || isNaN(expiryDate.getTime())) {
    return 0;
  }

  const now = new Date();
  const msDiff = expiryDate.getTime() - now.getTime();
  const daysLeft = Math.floor(msDiff / (1000 * 60 * 60 * 24));

  return Math.max(daysLeft, 0);
}
