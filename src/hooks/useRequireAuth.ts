// src/hooks/useRequireAuth.ts
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { app } from '@/lib/firebase'

export function useRequireAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth(app)
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
