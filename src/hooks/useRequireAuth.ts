// src/hooks/useRequireAuth.ts
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { getFirebaseApp } from '@/lib/firebase'

/**
 * Ensure a user is authenticated before accessing a page.
 *
 * @returns The authenticated user or redirects to the login page.
 */
export function useRequireAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth(getFirebaseApp())
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (!user) {
        router.replace('/login')
      }
    })
    return () => unsubscribe()
  }, [router])

  return user
}
