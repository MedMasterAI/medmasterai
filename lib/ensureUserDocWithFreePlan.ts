

// src/lib/ensureUserDocWithFreePlan.ts
import { getAuth } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@lib/firebase"

export async function ensureUserDocWithFreePlan() {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) return

  const userRef = doc(db, "users", user.uid)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      plan: "free",
      email: user.email,
      displayName: user.displayName ?? null,
    })
    console.log("✅ Usuario creado con plan free")
  }
}
