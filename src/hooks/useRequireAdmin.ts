'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from './useRequireAuth'

export function useRequireAdmin() {
  const user = useRequireAuth()
  const router = useRouter()
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

  useEffect(() => {
    if (user && adminEmail && user.email !== adminEmail) {
      router.replace('/dashboard')
    }
  }, [user, router, adminEmail])

  if (!user || user.email !== adminEmail) return null
  return user
}
