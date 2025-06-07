'use client'


import { useEffect, useState } from "react"
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore"
import { getFirebaseApp } from "@/lib/firebase"

/**
 * Subscribe to the notes collection of a user and keep it in state.
 *
 * @param uid User identifier whose notes should be loaded.
 * @returns Object containing an array of notes and a loading flag.
 */
export function useUserNotes(uid: string | null) {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    const db = getFirestore(getFirebaseApp())
    const notesRef = collection(db, `users/${uid}/notes`)
    const q = query(notesRef, orderBy("createdAt", "desc"))

    let unsubscribe: Unsubscribe | undefined

    try {
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          setNotes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
          setLoading(false)
        },
        (error) => {
          console.error("❌ Error al obtener apuntes:", error.message)
          setNotes([])
          setLoading(false)
        }
      )
    } catch (err: any) {
      console.error("❌ Error inesperado en useUserNotes:", err.message)
      setNotes([])
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [uid])

  return { notes, loading }
}
