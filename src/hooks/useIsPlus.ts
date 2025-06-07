import { useEffect, useState } from "react"
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore"
import { getFirebaseApp } from "@lib/firebase"

interface PlusStatus {
  isPlus: boolean
  daysLeft: number
  isNearExpiration: boolean
}

/**
 * Check if a user currently has an active Plus subscription.
 *
 * @param uid User ID to query subscriptions for.
 * @returns Subscription status including remaining days and expiration flag.
 */
export function useIsPlus(uid: string | null): PlusStatus {
  const [status, setStatus] = useState<PlusStatus>({
    isPlus: false,
    daysLeft: 0,
    isNearExpiration: false,
  })

  useEffect(() => {
    if (!uid) return

    const checkPlusStatus = async () => {
      try {
        const db = getFirestore(getFirebaseApp())
        const ref = collection(db, `users/${uid}/subscriptions`)
        const q = query(ref, orderBy("expiresAt", "desc"), limit(1))
        const snap = await getDocs(q)

        if (snap.empty) {
          setStatus({ isPlus: false, daysLeft: 0, isNearExpiration: false })
          return
        }

        const sub = snap.docs[0].data()
        const now = Timestamp.now()

        const expiresAt = sub.expiresAt instanceof Timestamp
          ? sub.expiresAt
          : Timestamp.fromDate(new Date(sub.expiresAt?.toDate?.() || sub.expiresAt))

        const isValid =
          sub.status === "approved" && expiresAt.toMillis() > now.toMillis()

        if (isValid) {
          const msLeft = expiresAt.toMillis() - now.toMillis()
          const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24))
          setStatus({
            isPlus: true,
            daysLeft,
            isNearExpiration: daysLeft <= 3,
          })
        } else {
          setStatus({ isPlus: false, daysLeft: 0, isNearExpiration: false })
        }
      } catch (err) {
        console.error("❌ useIsPlus error:", err)
        setStatus({ isPlus: false, daysLeft: 0, isNearExpiration: false })
      }
    }

    checkPlusStatus()
  }, [uid])

  return status
}
