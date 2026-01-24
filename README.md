# FudFarmer API

A comprehensive backend API for the FudFarmer platform, a farmer data management and engagement system built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. This API is deployed as a **Google Cloud Function** with automated CI/CD via GitHub Actions.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Architecture](#project-architecture)
3. [Technology Stack](#technology-stack)
4. [System Requirements](#system-requirements)
5. [Environment Variables](#environment-variables)
6. [Local Development Setup](#local-development-setup)
7. [Building and Running](#building-and-running)
8. [Firebase Functions Deployment](#firebase-functions-deployment)
9. [Automated Deployment (CI/CD)](#automated-deployment-cicd)
10. [Project Structure](#project-structure)
11. [API Endpoints Overview](#api-endpoints-overview)
12. [Database Models](#database-models)
13. [Authentication & Authorization](#authentication--authorization)
14. [Error Handling](#error-handling)
15. [Maintenance & Troubleshooting](#maintenance--troubleshooting)
16. [Support & Handover Notes](#support--handover-notes)

---

## Overview

The FudFarmer API serves as the backbone for a comprehensive farmer data management platform. It enables:

- **User Management**: Registration, authentication, profile management for farmers and staff
- **Farmer Data Collection**: Comprehensive farmer profiling with biodata, financial information, farm details, crops, animals, and shop locations
- **Bulk Data Uploads**: Efficient offline-first bulk farmer data synchronization
- **Data Validation**: Strict validation of all farmer information with detailed error reporting
- **Submission Tracking**: Monitor farmer submission status (Pending, Approved, Rejected)
- **Reporting & Downloads**: Export raw farmer data for analysis and review
- **Email Notifications**: Automated email delivery for account creation, password resets, contact inquiries
- **Role-Based Access Control**: Fine-grained permissions for Field Officers, Admins, and other user roles

---

## Project Architecture

### Overview Diagram

```
┌─────────────────────────────────────────┐
│   GitHub Repository (source code)       │
│  - dev branch triggers CI/CD workflow   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  GitHub Actions Workflow                │
│  (firebase-hosting-merge.yml)           │
│  - Runs linting & TypeScript build      │
│  - Authenticates with FIREBASE_TOKEN    │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│   Firebase Functions                    │
│   (Project: fudfarm-2ac73)              │
│   - HTTP trigger: /api/*                │
│   - Auto-scales on demand               │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│   MongoDB Atlas Cluster                 │
│   (Connection via MONGODB_URI env var)  │
│   - Farmer profiles & transactions      │
│   - User accounts & authentication      │
│   - Submission tracking                 │
└─────────────────────────────────────────┘
```

### Request Flow

```
HTTP Request → Firebase Function (api)
  ↓
connectToMongoDB() [ensures connection]
  ↓
Express App (routes/v1/app.ts)
  ↓
Middleware Stack
  ├─ CORS
  ├─ Body Parser
  ├─ Cookie Parser
  └─ Custom Auth, Validation, etc.
  ↓
Route Handlers
  ├─ /api/v1/auth
  ├─ /api/v1/farmer
  ├─ /api/v1/staff
  ├─ /api/v1/user
  └─ ... other routes
  ↓
Controllers (business logic)
  ↓
Models (MongoDB interactions)
  ↓
Response → HTTP Response
```

---

## Technology Stack

| Category        | Technology             | Version               |
| --------------- | ---------------------- | --------------------- |
| **Runtime**     | Node.js                | 22                    |
| **Language**    | TypeScript             | Latest                |
| **Framework**   | Express.js             | Latest                |
| **Cloud**       | Google Cloud Functions | v2                    |
| **Database**    | MongoDB Atlas          | (Cloud)               |
| **ODM**         | Mongoose               | ^8.16.1               |
| **Auth**        | JWT (jsonwebtoken)     | Custom implementation |
| **Email**       | Nodemailer             | ^7.0.4                |
| **Validation**  | Zod                    | ^3.25.67              |
| **File Upload** | Multer                 | ^2.0.2                |
| **Security**    | Bcrypt                 | ^6.0.0                |
| **Linting**     | ESLint                 | ^8.9.0                |

---

## System Requirements

### Prerequisites

- **Node.js 22+** (must match `engines.node` in `package.json`)
- **npm or yarn** package manager
- **Git** for version control
- **Firebase CLI** (for local emulation and deployment)
- **Google Cloud SDK** (for advanced GCP operations)
- **MongoDB Atlas Account** (for database access)

### Installation

```bash
# Install Node.js 22
# https://nodejs.org/

# Install Firebase CLI globally
npm install -g firebase-tools

# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Verify installations
node --version      # Should be v22.x.x
npm --version       # Should be 10.x.x or later
firebase --version  # Should be latest
```

---

## Environment Variables

All environment variables are configured via **Google Cloud Console** (Firebase Functions). They are automatically injected into the running function and do **not** need to be set manually in the repository.

### Required Environment Variables

| Variable                   | Description                                          | Example                                              | Set Via        |
| -------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | -------------- |
| `MONGODB_URI`              | MongoDB Atlas connection string                      | `mongodb+srv://user:pass@cluster.mongodb.net/db?...` | Google Console |
| `JWT_SECRET`               | Secret key for signing access tokens                 | 64+ char random string                               | Google Console |
| `JWT_REFRESH_SECRET`       | Secret key for refresh tokens                        | 64+ char random string                               | Google Console |
| `ACCESS_TOKEN_EXPIRES_IN`  | Expiration time for access tokens                    | `1h`                                                 | Google Console |
| `REFRESH_TOKEN_EXPIRES_IN` | Expiration time for refresh tokens                   | `7d`                                                 | Google Console |
| `APP_NAME`                 | Application display name                             | `FudFarmer Admin`                                    | Google Console |
| `ROOT_DOMAIN`              | Primary domain for the application                   | `habideenibrahim.com.ng`                             | Google Console |
| `TIMEZONE`                 | Server timezone for timestamps                       | `Africa/Lagos`                                       | Google Console |
| `EMAIL_HOST`               | SMTP server hostname                                 | `smtp.zoho.com`                                      | Google Console |
| `EMAIL_PORT`               | SMTP server port                                     | `465`                                                | Google Console |
| `EMAIL_SECURE`             | Use TLS for SMTP                                     | `true`                                               | Google Console |
| `EMAIL_USERNAME`           | SMTP authentication username                         | `user@domain.com`                                    | Google Console |
| `EMAIL_PASSWORD`           | SMTP authentication password (app-specific password) | Generated via email provider                         | Google Console |
| `EMAIL_FROM`               | Default sender email address                         | `noreply@domain.com`                                 | Google Console |
| `EMAIL_CONTACT`            | Contact email for inquiries                          | `contact@domain.com`                                 | Google Console |

### Setting Environment Variables

**Via Google Cloud Console:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `fudfarm-2ac73`
3. Navigate to: **Cloud Functions** → **api** → **Runtime settings**
4. Scroll to **Runtime environment variables**
5. Add or update variables
6. Click **Deploy** (or redeploy the function)

**Via gcloud CLI:**

```bash
gcloud functions deploy api \
  --runtime nodejs22 \
  --update-env-vars MONGODB_URI="...",JWT_SECRET="...",EMAIL_HOST="smtp.zoho.com"
```

**⚠️ Important Notes:**

- Never commit `.env` files to Git
- Always use Google Cloud Console for sensitive variables
- For Gmail: Use [App Passwords](https://myaccount.google.com/apppasswords) instead of your main password
- Rotate JWT secrets periodically for security

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fudfarm.git
cd fudfarm
```

### 2. Install Dependencies

```bash
cd functions
npm install
```

### 3. Create a Local `.env` File (for development only)

Create `functions/.env` with the following structure. **Do not commit this file.**

```bash
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/fudfarmerDB?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_secret_key_here_min_64_chars_long
JWT_REFRESH_SECRET=your_refresh_secret_here_min_64_chars_long
ACCESS_TOKEN_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Application
APP_NAME=FudFarmer Admin
ROOT_DOMAIN=localhost:5000
TIMEZONE=Africa/Lagos

# Email (SMTP)
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USERNAME=your_email@domain.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@domain.com
EMAIL_CONTACT=contact@domain.com
```

### 4. Verify TypeScript Configuration

The project uses TypeScript. Ensure `tsconfig.json` is correctly configured:

```bash
cat tsconfig.json
```

Expected output should show:

- `"target": "ES2020"`
- `"module": "commonjs"`
- `"outDir": "./lib"`
- `"rootDir": "./src"`

---

## Building and Running

### Local Development (with Firebase Emulator)

This approach simulates the Firebase Functions environment locally.

```bash
# From the functions directory
cd functions

# Install dependencies (if not done)
npm install

# Start development server with hot-reload
npm run dev
```

This will:

1. Compile TypeScript to JavaScript (`lib/` directory)
2. Watch for file changes and recompile automatically
3. Start Firebase Emulator Suite
4. Make the API available at `http://localhost:5001/fudfarm-2ac73/us-central1/api`

### Using the Emulator

Once the emulator is running, test endpoints:

```bash
curl http://localhost:5001/fudfarm-2ac73/us-central1/api/health
```

### Production Build

```bash
# Compile TypeScript to JavaScript
npm run build

# This generates files in the lib/ directory
# The firebase.json config runs this automatically on deploy
```

### Available npm Scripts

| Command               | Purpose                                 |
| --------------------- | --------------------------------------- |
| `npm run build`       | Compile TypeScript to JavaScript        |
| `npm run build:watch` | Auto-compile on file changes            |
| `npm run lint`        | Run ESLint to check code quality        |
| `npm run serve`       | Run Firebase Functions emulator locally |
| `npm run dev`         | Run build:watch + serve in parallel     |
| `npm run deploy`      | Deploy to Firebase Functions            |
| `npm run logs`        | Stream logs from deployed function      |
| `npm run shell`       | Interactive function shell              |

---

## Firebase Functions Deployment

### Manual Deployment

Deploy the function manually using Firebase CLI:

```bash
# From the repository root
firebase deploy --only functions

# Or with verbose logging
firebase deploy --only functions --debug
```

This process:

1. Authenticates using stored Firebase token
2. Validates `firebase.json` configuration
3. Runs pre-deploy scripts (lint + build)
4. Compresses the `functions/` directory
5. Uploads to Firebase Functions
6. Deploys the function with version tracking

### Deployment Verification

After deployment, verify the function is running:

```bash
# Check function logs
firebase functions:log

# Test the endpoint (requires Bearer token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://us-central1-fudfarm-2ac73.cloudfunctions.net/api/health
```

### Rollback (if needed)

If deployment causes issues:

1. **Via Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select `fudfarm-2ac73` project
   - Navigate to **Functions** → **api**
   - View version history and switch to previous version

2. **Via CLI:**
   ```bash
   firebase functions:describe api
   # View available versions
   ```

---

## Automated Deployment (CI/CD)

### GitHub Actions Workflow

The project uses **GitHub Actions** for automated deployment. Configuration is in `.github/workflows/firebase-hosting-merge.yml`.

### How It Works

```yaml
Trigger: Push to 'dev' branch
    ↓
GitHub Actions Workflow Starts
    ├─ Checkout code
    ├─ Run ESLint (validate code quality)
    ├─ Run TypeScript build (compile src/ → lib/)
    └─ Deploy to Firebase Functions
         └─ Uses FIREBASE_TOKEN secret for authentication
```

### Workflow Details

**File:** `.github/workflows/firebase-hosting-merge.yml`

```yaml
on:
  push:
    branches:
      - dev # Triggered when code is pushed to dev branch

jobs:
  main:
    name: Deploy to Firebase
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: jsryudev/deploy-firebase-functions@v20.0.1
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }} # GitHub secret
          FIREBASE_PROJECT: fudfarm-2ac73 # Firebase project ID
          FUNCTIONS_DIR: functions # Functions directory
```

### Setting Up CI/CD (First Time)

1. **Generate Firebase Token:**

   ```bash
   firebase login:ci
   # This generates a long token
   ```

2. **Add Token to GitHub Secrets:**
   - Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
   - Create new secret `FIREBASE_TOKEN` with the token value
   - ✅ Token is now securely stored in GitHub

3. **Create/Update Workflow File:**
   - Ensure `.github/workflows/firebase-hosting-merge.yml` exists
   - Configure `FIREBASE_PROJECT` to your project ID
   - Commit and push to trigger the workflow

### Monitoring CI/CD

1. **View Workflow Status:**
   - GitHub repo → **Actions** tab
   - See all workflow runs and their status

2. **Debugging Failed Deployments:**
   - Click on failed workflow run
   - View logs to identify issues
   - Common issues:
     - ESLint errors (fix code style)
     - TypeScript compilation errors (fix types)
     - Token expiration (regenerate token)

3. **Disable/Enable Workflows:**
   - GitHub repo → **Actions** → Select workflow → **Disable workflow**
   - (Re)enable manually if needed

---

## Project Structure

```
fudfarm/
├── .github/
│   └── workflows/
│       ├── firebase-hosting-merge.yml      # Auto-deploy on push to dev
│       └── firebase-hosting-pull-request.yml
├── functions/
│   ├── src/
│   │   ├── server.ts                       # Firebase function entry point
│   │   ├── config/
│   │   │   ├── db.ts                       # MongoDB connection
│   │   │   ├── dotenv.ts                   # Environment variable loading
│   │   │   ├── firebase.ts                 # Firebase Admin SDK
│   │   │   └── index.ts
│   │   ├── controllers/
│   │   │   ├── v1/
│   │   │   │   ├── farmer/                 # Farmer management endpoints
│   │   │   │   │   ├── upload.ts           # Bulk farmer data upload
│   │   │   │   │   ├── list.ts             # Farmer listing
│   │   │   │   │   ├── details/            # Farmer detail retrieval
│   │   │   │   │   │   ├── address.ts
│   │   │   │   │   │   ├── biodata.ts
│   │   │   │   │   │   ├── downloadRawData.ts
│   │   │   │   │   │   └── ...
│   │   │   │   │   └── edit/               # Farmer data updates
│   │   │   │   │       ├── address.ts
│   │   │   │   │       ├── biodata.ts
│   │   │   │   │       └── ...
│   │   │   │   ├── admin/
│   │   │   │   │   └── staffRoutes.ts      # Staff management
│   │   │   │   └── authRoutes.ts           # Authentication
│   │   │   └── generalController.ts        # Health checks, etc.
│   │   ├── routes/
│   │   │   ├── v1/
│   │   │   │   ├── app.ts                  # Main Express app
│   │   │   │   ├── farmerRoutes.ts         # Farmer endpoints
│   │   │   │   ├── authRoutes.ts           # Auth endpoints
│   │   │   │   └── ...
│   │   │   └── generalRoutes.ts
│   │   ├── models/
│   │   │   └── v1/
│   │   │       ├── User.ts                 # User schema
│   │   │       └── farmer/
│   │   │           ├── Biodata.ts
│   │   │           ├── Contact.ts
│   │   │           ├── Address.ts
│   │   │           ├── Bank.ts
│   │   │           ├── Farm.ts
│   │   │           ├── Unit.ts
│   │   │           └── ...
│   │   ├── middleware/
│   │   │   ├── auth.ts                     # JWT authentication guard
│   │   │   ├── validate.ts                 # Input validation
│   │   │   └── turnstile.ts                # CAPTCHA verification
│   │   ├── validators/
│   │   │   ├── farmer/
│   │   │   │   ├── biodata.ts
│   │   │   │   ├── contact.ts
│   │   │   │   └── ...
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── mailer.ts                   # Email sending
│   │   │   ├── token.ts                    # JWT utilities
│   │   │   └── passwordPlugin.ts           # Password hashing
│   │   ├── function/
│   │   │   ├── uploadValidation.ts         # Farmer data validation
│   │   │   ├── error.ts                    # Error handling
│   │   │   └── ...
│   │   ├── emails/
│   │   │   ├── layout.ts                   # Email templates
│   │   │   ├── contactUs.ts
│   │   │   ├── reset-password.ts
│   │   │   └── ...
│   │   └── interface/
│   │       └── farmer/
│   │           ├── upload.ts               # Upload data interface
│   │           ├── biodata.ts
│   │           ├── contact.ts
│   │           └── ...
│   ├── lib/                                # Compiled JavaScript (generated)
│   ├── package.json                        # Dependencies
│   ├── tsconfig.json                       # TypeScript config
│   └── .eslintrc.json                      # ESLint config
├── .firebaserc                             # Firebase project config
├── firebase.json                           # Firebase Functions config
├── tsconfig.json                           # Root TypeScript config
├── README.md                               # This file
└── config/
    └── deploy-env.sh                       # Environment variable setup script
```

---

## API Endpoints Overview

The API is organized into several main route groups:

### Authentication Routes (`/api/v1/auth`)

- `POST /register` - User registration
- `POST /login` - User login (returns JWT tokens)
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Confirm password reset

### Farmer Routes (`/api/v1/farmer`)

- `POST /upload` - Bulk upload farmer data (requires Field Officer role)
- `GET /list` - List all farmers (paginated)
- `GET /details/biodata/:id` - Get farmer biodata
- `GET /details/address/:id` - Get farmer address
- `PUT /edit/address/:id` - Update farmer address
- `GET /download/download-rejected-data` - Download all rejected submissions
- `GET /download/download-single-data/:id` - Download single farmer data
- ... (See farmerRoutes.ts for complete list)

### User Management Routes (`/api/v1/user`)

- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change user password

### Staff Routes (`/api/v1/staff`)

- `GET /list` - List staff members (Admin only)
- `POST /create` - Create new staff member (Admin only)
- `PUT /update/:id` - Update staff member (Admin only)

### General Routes (`/`)

- `GET /health` - Health check endpoint
- `POST /contact-us` - Contact form submission
- `POST /feedback` - Submit feedback

---

## Database Models

### Core User Model

```typescript
User {
  _id: string (UUID)
  surname: string
  firstname: string
  email: string (unique)
  phone: string (unique)
  role: "Farmer" | "Field Officer" | "Admin" | "Staff"
  status: "Active" | "Disabled"
  password: string (hashed with bcrypt)
  birthdate: Date
  gender: "M" | "F" | "O"
  maritalStatus: string
  createdAt: Date
  updatedAt: Date
}
```

### Farmer-Related Models

- **Biodata**: Personal information (name, gender, marital status, family count)
- **Contact**: Phone numbers, email, promotional preferences
- **Address**: Residential and permanent address information
- **Bank**: Bank account details (for payments/transfers)
- **Verification**: BVN, NIN, business registration numbers
- **Occupation**: Primary/secondary occupation, years of experience
- **OtherFarmInfo**: Crop count, livestock count, harvest info
- **BusinessType**: Is farmer? Is seller?
- **Workforce**: Staff size, labour type (Permanent, Seasonal, Contract, etc.)
- **FarmInfo**: Farm location, size, crop count
- **CropInfo**: Individual crop records (type, quantity, unit)
- **AnimalInfo**: Individual animal records (type, quantity)
- **ShopLocation**: Shop location details
- **ShopItems**: Items sold at shop locations
- **SubmissionStatus**: Tracking submission state (Pending, Approved, Rejected)
- **Unit**: Measurement units (kg, hectare, pieces, bags, etc.)

---

## Authentication & Authorization

### JWT-Based Authentication

The API uses **JSON Web Tokens (JWT)** for stateless authentication.

#### Token Types

| Token             | Expiration            | Purpose                                         |
| ----------------- | --------------------- | ----------------------------------------------- |
| **Access Token**  | 1 hour (configurable) | Short-lived; used to access protected endpoints |
| **Refresh Token** | 7 days (configurable) | Long-lived; used to obtain new access token     |

#### Authentication Flow

```
1. User submits credentials → POST /api/v1/auth/login
2. Server validates credentials
3. Server generates JWT tokens
4. Tokens sent to client (in response body + httpOnly cookies)
5. Client includes token in Authorization header for subsequent requests
6. Server validates token signature + expiration
7. If valid → request proceeds; If invalid → 401 Unauthorized
8. When access token expires → use refresh token to get new access token
```

#### Using Tokens

**In Request Headers:**

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  https://api.example.com/api/v1/farmer/list
```

**In Cookies:**

```bash
# Token is automatically sent with httpOnly cookies
curl -b "authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  https://api.example.com/api/v1/farmer/list
```

### Role-Based Access Control (RBAC)

The `AuthGuard` middleware enforces role-based access:

```typescript
// Example: Only Field Officers can upload bulk farmer data
farmerRouter.post("/upload", AuthGuard(["Field Officer"]), farmersUpload);

// Example: Only Admins can update record status
validate.put(
  "/update-record-status/:id",
  AuthGuard(["Admin"]),
  updateFarmerRecordStatus,
);

// Example: All authenticated users (any role) can view farmer list
farmerRouter.get("/list", AuthGuard([...USER_ROLES]), farmersList);
```

### Available Roles

- **Farmer**: Basic user; can view their own data
- **Field Officer**: Can upload bulk farmer data, download rejected data
- **Admin**: Full access; can validate/approve/reject submissions, manage staff
- **Staff**: Limited access; specific operational tasks

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "message": "User-friendly error description",
  "error": "Technical error details (sanitized)",
  "statusCode": 400
}
```

### Common HTTP Status Codes

| Code    | Meaning      | Example                                       |
| ------- | ------------ | --------------------------------------------- |
| **200** | OK           | Request successful                            |
| **201** | Created      | Resource created successfully                 |
| **400** | Bad Request  | Invalid input data                            |
| **401** | Unauthorized | Missing/invalid token                         |
| **403** | Forbidden    | Insufficient role/permissions                 |
| **404** | Not Found    | Resource not found                            |
| **409** | Conflict     | Duplicate record (e.g., email already exists) |
| **500** | Server Error | Unexpected error on server                    |

### Error Sanitization

The API automatically sanitizes error messages to prevent information leakage:

- Database connection strings are redacted
- Collection/model names are hidden
- Stack traces are not exposed to clients
- Only user-friendly messages are returned

Example:

```typescript
// Server logs (detailed):
console.error("E11000 duplicate key error collection: users index: email_1 dup key: {email: 'test@example.com'}")

// Client receives (sanitized):
{ "message": "This email address is already registered" }
```

---

## Maintenance & Troubleshooting

### Monitoring & Logs

#### View Deployed Function Logs

```bash
# Stream live logs from deployed function
firebase functions:log

# View logs for a specific time period
firebase functions:log --limit=50
```

#### View Logs in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project `fudfarm-2ac73`
3. Navigate to **Cloud Functions** → **api** → **Logs** tab
4. Filter by:
   - Time range
   - Log level (Error, Info, Debug)
   - Keywords

### Common Issues & Solutions

#### Issue: "MONGODB_URI is undefined"

**Solution:** Check that environment variable is set in Google Cloud Console

```bash
gcloud functions describe api --region=us-central1
# Verify MONGODB_URI in Runtime variables section
```

#### Issue: "JWT_SECRET is not defined"

**Solution:** Same as above; ensure all required environment variables are set

#### Issue: "Function deployment fails with 'Lint errors'"

**Solution:** Fix ESLint errors

```bash
npm run lint
npm run lint -- --fix  # Auto-fix where possible
```

#### Issue: "Function deployment fails with 'TypeScript compilation error'"

**Solution:** Fix TypeScript errors

```bash
npm run build
# Review error messages and fix type issues
```

#### Issue: "MongoDB connection timeout"

**Cause:** MongoDB Atlas cluster is sleeping or IP not whitelisted
**Solution:**

1. Check MongoDB Atlas cluster status at https://cloud.mongodb.com/
2. Verify IP whitelist includes Google Cloud Functions IP
3. Restart cluster if needed

#### Issue: "Email not sending"

**Solution:** Verify SMTP configuration

```bash
# Check email environment variables
gcloud functions describe api --region=us-central1 | grep EMAIL

# Verify credentials are correct
# For Gmail: use App Password instead of main password
# For Zoho/custom: verify SMTP host, port, TLS settings
```

#### Issue: "CORS errors in browser"

**Solution:** Check CORS configuration in `routes/v1/app.ts`

```typescript
const allowedOrigins = [
  "http://localhost:3000",
  "https://yourdomain.com", // Add frontend domain
  process.env.CLIENT_URL || "",
];
```

### Health Check

Verify the function is running:

```bash
# Public health check
curl https://us-central1-fudfarm-2ac73.cloudfunctions.net/api/health

# Should return:
# {"message":"API is healthy","timestamp":"2024-01-20T10:30:00Z"}
```

### Database Connection Testing

```bash
# Test MongoDB connection directly
# In MongoDB Atlas → Connect → choose appropriate connection method
# Or add a debug endpoint to test connectivity
```

### Performance Monitoring

Monitor function performance in Google Cloud Console:

1. **Cloud Functions** → **api** → **Metrics** tab
2. Monitor:
   - Execution count
   - Execution times
   - Error count
   - Memory usage
3. Set up alerts for:
   - High error rate
   - High execution time
   - High memory usage

---

## Support & Handover Notes

### Key Contacts & Resources

- **Firebase Project:** [console.firebase.google.com](https://console.firebase.google.com/) (Select `fudfarm-2ac73`)
- **Google Cloud Console:** [console.cloud.google.com](https://console.cloud.google.com/) (Project: `fudfarm-2ac73`)
- **MongoDB Atlas:** [cloud.mongodb.com](https://cloud.mongodb.com/)
- **GitHub Repository:** [Your GitHub Repo URL]

### Important Accounts & Credentials

| Service            | Account            | Notes                  |
| ------------------ | ------------------ | ---------------------- |
| **Firebase**       | fudfarm-2ac73      | Primary project ID     |
| **Google Cloud**   | fudfarm-2ac73      | GCP project            |
| **MongoDB Atlas**  | [Your MongoDB org] | Database hosting       |
| **GitHub**         | [Your GitHub org]  | Source code repository |
| **Email Provider** | Zoho Mail (SMTP)   | For notifications      |

### Post-Handover Checklist

- [ ] Verify all environment variables are correctly set in Google Cloud Console
- [ ] Test CI/CD workflow by pushing to `dev` branch
- [ ] Verify Firebase token is stored securely in GitHub Secrets
- [ ] Confirm MongoDB Atlas IP whitelist includes Google Cloud Functions
- [ ] Test all critical API endpoints with Bearer token
- [ ] Set up monitoring/alerts in Google Cloud Console
- [ ] Document any custom configurations or modifications
- [ ] Ensure backups are configured in MongoDB Atlas
- [ ] Test password reset and email functionality
- [ ] Review and update email templates as needed

### Maintenance Schedule

| Task                     | Frequency | Notes                                 |
| ------------------------ | --------- | ------------------------------------- |
| Review error logs        | Daily     | Identify issues early                 |
| Monitor function metrics | Weekly    | Check performance & costs             |
| Rotate JWT secrets       | Quarterly | Security best practice                |
| Update dependencies      | Monthly   | `npm update` (with testing)           |
| Test disaster recovery   | Quarterly | Ensure backups work                   |
| Review CORS whitelist    | Quarterly | Add/remove frontend domains as needed |
| Database cleanup         | Monthly   | Archive old submissions if needed     |

### Useful Commands

```bash
# Deploy function
firebase deploy --only functions

# View real-time logs
firebase functions:log --tail

# Lint code
npm run lint

# Build project
npm run build

# Run local emulator
npm run dev

# List all functions
firebase functions:list

# View specific function details
firebase functions:describe api

# Delete a function (be careful!)
firebase functions:delete api
```

### Database Backup & Recovery

MongoDB Atlas automatic backups are configured. To restore:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) → Cluster → Backup
2. Select a backup snapshot
3. Click "Restore" and choose restore method
4. Verify restoration in a staging environment first

### Scaling & Cost Optimization

Firebase Functions auto-scales based on demand. To monitor costs:

1. **Google Cloud Console** → **Billing** → **Reports**
2. Filter by:
   - Service: "Cloud Functions"
   - Region: "us-central1"
3. Monitor:
   - Invocation costs
   - Network egress costs
   - Memory allocation costs

To optimize:

- Increase memory if frequent timeouts (better CPU = faster execution = lower cost)
- Review long-running operations
- Optimize database queries

### Future Enhancements

Recommended improvements for future development:

1. **Caching**: Implement Redis for frequently accessed farmer data
2. **Queue System**: Use Cloud Tasks for async operations (email, reports)
3. **API Versioning**: Prepare for v2 with breaking changes
4. **GraphQL**: Consider GraphQL API for complex queries
5. **Rate Limiting**: Implement rate limiting to prevent abuse
6. **Webhook Events**: Publish farmer submission events for external systems
7. **Audit Logging**: Comprehensive audit trail for compliance

---

## Quick Start Guide

### For New Developers

```bash
# 1. Clone the repo
git clone <repo-url>
cd fudfarm/functions

# 2. Install dependencies
npm install

# 3. Set up environment (copy example)
cp .env.example .env
# Edit .env with your values

# 4. Start development server
npm run dev

# 5. Test an endpoint
curl http://localhost:5001/fudfarm-2ac73/us-central1/api/health
```

### For DevOps Engineers

```bash
# 1. Authenticate with Firebase
firebase login

# 2. Set Firebase project
firebase use fudfarm-2ac73

# 3. Deploy
firebase deploy --only functions

# 4. Monitor
firebase functions:log --tail
```

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Developed By:** Bravy Technology Solutions  
**Author:** HABIDEEN Ibrahim Akinlara  
**Next Review Date:** April 2026
