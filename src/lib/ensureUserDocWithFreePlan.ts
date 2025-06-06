import { getFirestore, doc, getDoc, setDoc, Timestamp } from "firebase/firestore"
import { app } from "./firebase"

// Asegura que el usuario tenga un doc en Firestore con plan "free"
export async function ensureUserDocWithFreePlan(uid: string, email?: string) {
  const db = getFirestore(app)
  const userRef = doc(db, "users", uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      plan: "free",
      planExpiresAt: null,
      email: email || "",
      createdAt: Timestamp.now(),
    })
    return "created"
  }
  return "exists"
}
