'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from './useRequireAuth'

export function useRequireAdmin() {
  const user = useRequireAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    const check = async () => {
      if (!user) return
      try {
        const token = await user.getIdToken()
        const res = await fetch('/api/is-admin', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
          router.replace('/dashboard')
        }
      } catch (err) {
        console.error('check admin error', err)
        setIsAdmin(false)
        router.replace('/dashboard')
      }
    }
    check()
  }, [user, router])

  if (!user || isAdmin !== true) return null
  return user
}
