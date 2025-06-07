// src/hooks/useAuthRedirect.ts
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirebaseApp } from '@/lib/firebase'

/**
 * Redirect authenticated users to the dashboard page.
 *
 * @returns Nothing. The hook only performs navigation side effects.
 */
export function useAuthRedirect() {
  const router = useRouter()
  useEffect(() => {
    const auth = getAuth(getFirebaseApp())
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/dashboard')
      }
    })
    return () => unsubscribe()
  }, [router])
}
