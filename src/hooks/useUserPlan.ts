'use client'

import { useEffect, useState } from "react"
import { getFirestore, doc, getDoc, Timestamp } from "firebase/firestore"
import { getFirebaseApp } from "@/lib/firebase"

interface UserPlanStatus {
  plan: "free" | "pro" | "unlimited"
  expiresAt: Date | null
  daysLeft: number
  isActive: boolean
  isNearExpiration: boolean
  loading: boolean // 👈 agregado
}

/**
 * Obtain the current subscription plan of a user.
 *
 * @param uid User ID whose plan should be fetched.
 * @returns Plan status information including expiration and loading state.
 */
export function useUserPlan(uid: string | null): UserPlanStatus {
  const [status, setStatus] = useState<UserPlanStatus>({
    plan: "free",
    expiresAt: null,
    daysLeft: 0,
    isActive: false,
    isNearExpiration: false,
    loading: true, // 👈 inicia en true
  })

  useEffect(() => {
    if (!uid) {
      setStatus({
        plan: "free",
        expiresAt: null,
        daysLeft: 0,
        isActive: false,
        isNearExpiration: false,
        loading: false, // 👈 ya terminó de “cargar”
      })
      return
    }

    setStatus((prev) => ({ ...prev, loading: true })) // 👈 está cargando...

    const fetchPlan = async () => {
      try {
        const db = getFirestore(getFirebaseApp())
        const userRef = doc(db, `users/${uid}`)
        const userSnap = await getDoc(userRef)

        // Por defecto: plan free
        let plan: "free" | "pro" | "unlimited" = "free"
        let expiresAt: Date | null = null
        let daysLeft = 0
        let isActive = false

        if (userSnap.exists()) {
          const data = userSnap.data()
          plan = (data.plan as UserPlanStatus["plan"]) || "free"
          if (data.planExpiresAt) {
            const expiresAtRaw =
              data.planExpiresAt instanceof Timestamp
                ? data.planExpiresAt.toDate()
                : new Date(data.planExpiresAt)
            expiresAt = expiresAtRaw
            const now = new Date()
            const msLeft = expiresAtRaw.getTime() - now.getTime()
            daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)))
            isActive = msLeft > 0 && plan !== "free"
          }
        }

        setStatus({
          plan,
          expiresAt,
          daysLeft,
          isActive,
          isNearExpiration: isActive && daysLeft <= 3,
          loading: false, // 👈 terminó de cargar
        })
      } catch (err) {
        console.error("❌ useUserPlan error:", err)
        setStatus({
          plan: "free",
          expiresAt: null,
          daysLeft: 0,
          isActive: false,
          isNearExpiration: false,
          loading: false, // 👈 también terminó de cargar
        })
      }
    }

    fetchPlan()
  }, [uid])

  return status
}
