import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import "dotenv/config";
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.PROJECT_ID,
      clientEmail: process.env.CLIENT_EMAIL,
      privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.STORAGE_BUCKET,
  });
}

// Exportá SIEMPRE así:
export const dbAdmin = getFirestore(getApp());
export const storageAdmin = getStorage(getApp()).bucket();

if (process.env.NODE_ENV !== "production") {
  console.log({
    storageBucket: process.env.STORAGE_BUCKET,
  });
}
