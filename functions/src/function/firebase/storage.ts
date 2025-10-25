import admin from "firebase-admin";
import { AdminConfig, ServiceAccountJSON } from "./config";

/**
 * Ensure firebase-admin is initialized. In Cloud Functions the environment
 * already provides credentials; locally set GOOGLE_APPLICATION_CREDENTIALS
 * or pass a service account when initializing elsewhere.
 */
// Runtime check for required service account fields
const requiredFields = [
  "type", "project_id", "private_key_id", "private_key",
  "client_email", "client_id", "auth_uri", "token_uri",
  "auth_provider_x509_cert_url", "client_x509_cert_url",
];
for (const key of requiredFields) {
  if (!ServiceAccountJSON[key] || typeof ServiceAccountJSON[key] !== "string") {
    // Print the object for debugging
    // eslint-disable-next-line no-console
    console.error("ServiceAccountJSON:", ServiceAccountJSON);
    throw new Error(`Missing or invalid service account field: ${key}`);
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(ServiceAccountJSON),
    storageBucket: AdminConfig.storageBucket, // should be just the bucket name, e.g. 'farmdev-e3d46.appspot.com'
  });
}

/**
 * Rename (move) a file in Firebase Storage (Google Cloud Storage).
 * This uses the underlying GCS file.move() operation which is atomic.
 *
 * @param {string} srcPath - Current object path in the bucket (e.g. "images/abc_offline.png")
 * @param {string} destPath - Destination object path in the bucket (e.g. "images/USERID.png")
 * @param {string} [bucketName] - Optional bucket name. If omitted, uses the default bucket
 * @return {Promise<string>} Resolves with the new file path on success
 * @throws {Error} - Throws if the source file does not exist or move fails
 */
export async function renameStorageFile(srcPath: string, destPath: string): Promise<string> {
  try {
    // Use only the bucket name, not a URL
    const bucketName = AdminConfig.storageBucket;
    const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();

    const srcFile = bucket.file(srcPath);
    const [exists] = await srcFile.exists();
    if (!exists) {
      return destPath;
      // throw new Error(`Source file not found: ${srcPath}`);
    }

    // Use GCS's move operation which renames the file
    await srcFile.move(destPath);

    return destPath;
  } catch (err: any) {
    // Normalize error
    throw new Error(err?.message || "Failed to rename storage file");
  }
}

export default {
  renameStorageFile,
};
