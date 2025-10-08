export const maritalStatuses = [
  "Single",
  "Married",
  "Separated",
  "Divorced",
  "Widowed",
] as const;
export type IMaritalStatus = (typeof maritalStatuses)[number];
