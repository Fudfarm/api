export const AdminConfig = {
  projectId: process.env.GCS_PROJECT_ID,
  storageBucket: process.env.GCS_STORAGE_BUCKET,
  serviceAccount: {
    type: process.env.GCS_TYPE || "",
    project_id: process.env.GCS_PROJECT_ID || "",
    private_key_id: process.env.GCS_PRIVATE_KEY_ID || "",
    private_key: (process.env.GCS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    client_email: process.env.GCS_CLIENT_EMAIL || "",
    client_id: process.env.GCS_CLIENT_ID || "",
    auth_uri: process.env.GCS_AUTH_URI || "",
    token_uri: process.env.GCS_TOKEN_URI || "",
    auth_provider_x509_cert_url: process.env.GCS_AUTH_PROVIDER_X509_CERT_URL || "",
    client_x509_cert_url: process.env.GCS_CLIENT_X509_CERT_URL || "",
    universe_domain: process.env.GCS_UNIVERSE_DOMAIN || "",
  },
};

/**
 * Convert the service account object to valid JSON
 * usable by firebase-admin credential.cert()
 */
export const ServiceAccountJSON = JSON.parse(
  JSON.stringify(AdminConfig.serviceAccount)
);
