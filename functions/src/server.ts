/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import app from "./app";
import { connectToMongoDB } from "./config/db";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const api = onRequest(app);
export const api = onRequest(async (req, res) => {
  await connectToMongoDB(); // ensure MongoDB is connected before handling request
  return app(req, res);
});

// onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
