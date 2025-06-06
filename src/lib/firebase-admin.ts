// src/lib/firebase-admin.ts
import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Usa variables secretas para admin SDK
const adminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

export const adminApp: App = !getApps().length ? initializeApp(adminConfig) : getApp();
export const dbAdmin = getFirestore(adminApp);
export const storageAdmin = getStorage(adminApp);