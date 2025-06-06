// src/lib/
// .ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";
import { GoogleAuthProvider, signInWithPopup, OAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// 👇 Solo en client-side (Next.js)
function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") throw new Error("Firebase no está disponible en SSR");
  return !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

export const app: FirebaseApp = getFirebaseApp();
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app, "us-central1");

export const onUserChanged = (cb: (user: any) => void) => {
  return auth.onAuthStateChanged(cb);
};
export const signOut = () => auth.signOut();
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};
export const signInWithApple = async () => {
  const provider = new OAuthProvider("apple.com");
  return signInWithPopup(auth, provider);
};