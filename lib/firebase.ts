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
  apiKey: "AIzaSyANF0IgWoPLeAeWnBq4CCTuyUep1H6-P2o",
  authDomain: "frontedwebmedmaster.firebaseapp.com",
  projectId: "frontedwebmedmaster",
  storageBucket: "frontedwebmedmaster.firebasestorage.app",
  messagingSenderId: "489873459052",
  appId: "1:489873459052:web:f6cc00766421a725d8d549",
  measurementId: "G-MG27W8BTC7",
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
