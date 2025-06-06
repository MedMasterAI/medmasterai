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
import { app } from "@/lib/firebase"

export function useUserNotes(uid: string | null) {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    const db = getFirestore(app)
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
