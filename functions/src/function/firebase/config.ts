
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { firebaseAdminConfig } from "../../config/firebase";

export const firebaseConfig = {
  apiKey: firebaseAdminConfig.apiKey,
  authDomain: firebaseAdminConfig.authDomain,
  projectId: firebaseAdminConfig.projectId,
  storageBucket: firebaseAdminConfig.storageBucket,
  messagingSenderId: firebaseAdminConfig.messagingSenderId,
  appId: firebaseAdminConfig.appId,
  measurementId: firebaseAdminConfig.measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);

export const db = getFirestore(app);
