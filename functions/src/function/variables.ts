export const maritalStatuses = [
  "Single",
  "Married",
  "Separated",
  "Divorced",
  "Widowed",
] as const;
export type IMaritalStatus = (typeof maritalStatuses)[number];

export const SERVER = {
  ASSET_BUCKET_URL: "fudfarm-2ac73.firebasestorage.app",
  FARMER_IMAGE_PATH: "images/users",
  FARMER_CONSENT_PATH: "videos/consent",
};
