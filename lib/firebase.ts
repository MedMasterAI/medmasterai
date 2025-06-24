// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

// ——— Helpers de Auth ———
const googleProvider = new GoogleAuthProvider()
const appleProvider = new OAuthProvider("apple.com")

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export function signInWithApple() {
  return signInWithPopup(auth, appleProvider)
}

export function signOut() {
  return fbSignOut(auth)
}

export function onUserChanged(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb)
}

// ——— Inicialización de Analytics sólo en cliente ———
export async function initFirebaseAnalytics() {
  if (typeof window === "undefined") return
  // dinámicamente importamos analytics para que no se evalúe en SSR
  const { isSupported, getAnalytics } = await import("firebase/analytics")
  if (await isSupported()) {
    getAnalytics(app)
  }
}
