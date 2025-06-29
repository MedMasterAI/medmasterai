'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { getFirestoreDb } from '@/lib/firebase'

export interface StoredLupPlan {
  id: string
  materias: any[]
  disponibilidad: any
  presentacion: string
  metodoEstudio: string
  plan: any[]
  createdAt: any
}

export function useUserLupPlans(uid: string | null) {
  const [plans, setPlans] = useState<StoredLupPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    const ref = collection(getFirestoreDb(), 'users', uid, 'lupPlans')
    const q = query(ref, orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      snap => {
        setPlans(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
        setLoading(false)
      },
      err => {
        console.error('Error loading plans', err)
        setPlans([])
        setLoading(false)
      }
    )
    return unsub
  }, [uid])

  return { plans, loading }
}
