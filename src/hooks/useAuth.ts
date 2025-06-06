import { useState, useEffect } from "react"
import { onUserChanged } from "@/lib/firebase"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore"
import type { User as FirebaseUser } from "firebase/auth"

/**
 * useAuth hook: mantiene el usuario autenticado y el estado de suscripción "Plus".
 */
export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlus, setIsPlus] = useState(false)

  // 1) Escuchar cambios de autenticación
  useEffect(() => {
    const unsubscribeAuth = onUserChanged((u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribeAuth
  }, [])

  // 2) Si hay usuario, suscribirse a Firestore para detectar plan Plus activo
  useEffect(() => {
    if (!user) {
      setIsPlus(false)
      return
    }

    // Colección "subscriptions" filtrando estado y expiración
    const subsRef = collection(db, "users", user.uid, "subscriptions")
    const q = query(
      subsRef,
      where("status", "==", "approved"),
      where("expiresAt", ">", Timestamp.now())
    )
    const unsubscribeSubs = onSnapshot(q, (snapshot) => {
      setIsPlus(!snapshot.empty)
    })

    return unsubscribeSubs
  }, [user])

  return { user, loading, isPlus }
}
