import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getFirebaseApp } from "./firebase";

export async function isProfileComplete(uid: string): Promise<boolean> {
  const db = getFirestore(getFirebaseApp());
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.data();
  return !!data?.profileCompleted;
}
