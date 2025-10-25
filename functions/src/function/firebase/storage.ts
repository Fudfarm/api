import { Bucket, Storage } from "@google-cloud/storage";
import { AdminConfig } from "./config";

/**
 * Lazily initialized Google Cloud Storage instance.
 * This prevents deploy-time crashes when environment variables
 * aren't yet available (e.g., during Firebase build analysis).
 */
let storageInstance: Storage | null = null;
let bucketInstance: Bucket | null = null;

/**
 * Get or initialize the default GCS bucket at runtime.
 * @throws Error if GCS_STORAGE_BUCKET is missing
 * @return {Bucket} The initialized Google Cloud Storage bucket.
 */
function getBucket(): Bucket {
  if (!bucketInstance) {
    const rawName = AdminConfig.storageBucket || "";
    const bucketName = rawName.replace(/^gs:\/\//, "").trim();

    if (!bucketName) {
      throw new Error(
        "Missing storage bucket name. Ensure GCS_STORAGE_BUCKET is set in Cloud Functions environment."
      );
    }

    storageInstance = new Storage({
      projectId: AdminConfig.projectId,
      credentials: AdminConfig.serviceAccount,
    });

    bucketInstance = storageInstance.bucket(bucketName);
  }

  return bucketInstance;
}

/**
 * Rename (move) a file in Firebase Storage / Google Cloud Storage.
 * Copies the file to the new path and deletes the old one.
 *
 * @param {string} oldPath - Current file path in the bucket
 * @param {string} newPath - New file path to rename/move to
 * @return {Promise<void>} A promise that resolves when operation is complete
 */
export async function renameStorageFile(oldPath: string, newPath: string): Promise<void> {
  const bucket = getBucket();
  const oldFile = bucket.file(oldPath);
  const newFile = bucket.file(newPath);

  const [exists] = await oldFile.exists();
  if (!exists) {
    console.warn(`⚠️ Source file not found: ${oldPath}`);
    return;
  }

  await oldFile.copy(newFile);
  await oldFile.delete();
}
