import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseApp } from "./firebase";
import { PLAN_LIMITS } from "./plans";

// Asegura que el usuario tenga un doc en Firestore con plan "free"
export async function ensureUserDocWithFreePlan(uid: string, email?: string) {
  const db = getFirestore(getFirebaseApp());
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      plan: "free",
      planExpiresAt: null,
      email: email || "",
      createdAt: Timestamp.now(),
      pdfCredits: PLAN_LIMITS.free.pdf,
      videoCredits: PLAN_LIMITS.free.video,
      name: "",
      country: "",
      language: "",
      study: "",
      heardFrom: "",
      profileCompleted: false,
    });
    return "created";
  }
  return "exists";
}
