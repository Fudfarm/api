export const maritalStatuses = [
  "Single",
  "Married",
  "Separated",
  "Divorced",
  "Widowed",
] as const;
export type IMaritalStatus = (typeof maritalStatuses)[number];

export const SERVER = {
  ASSET_BUCKET_URL: "fudfarmer-c78cb.firebasestorage.app",
  FARMER_IMAGE_PATH: "images/farmer",
  FARMER_CONSENT_PATH: "video/consent/farmer",
};
