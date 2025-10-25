
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyD5fveswOtoD8RrpvwjVWdPlyfMtVsFKEY",
  authDomain: "farmdev-e3d46.firebaseapp.com",
  projectId: "farmdev-e3d46",
  storageBucket: "farmdev-e3d46.firebasestorage.app",
  messagingSenderId: "634886761560",
  appId: "1:634886761560:web:3f02664ead8ef8b3966e2d",
  measurementId: "G-Y6V7F0CGTC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);

export const db = getFirestore(app);
