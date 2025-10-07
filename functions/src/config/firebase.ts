// File: functions/src/config/firebase.ts
// use Firebase environment variables instead of dotenv

export const firebaseConfig = {
  // port: Number(process.env.PORT) || 3000,
  appName: process.env.APP_NAME || "",
  mongoUri: process.env.MONGODB_URI || "",
  timezone: process.env.TIMEZONE || "UTC" || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "1h",
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "30d",
  rootDomain: process.env.ROOT_DOMAIN,

  // Email configuration
  emailUsername: process.env.EMAIL_USERNAME || "",
  emailPassword: process.env.EMAIL_PASSWORD || "",
  emailFrom: process.env.EMAIL_FROM || "",
  emailHost: process.env.EMAIL_HOST || "",
  emailPort: Number(process.env.EMAIL_PORT) || 587,
  emailSecure: process.env.EMAIL_SECURE === "true" || false,
};
