import { useState, useEffect } from 'react'
import type { StudyPlan } from '@/types/study-plan'

const STORAGE_KEY = 'study-plan'

export function useStudyPlan() {
  const [plan, setPlan] = useState<StudyPlan | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setPlan(JSON.parse(saved))
      } catch (err) {
        console.error('Error parsing study plan', err)
      }
    }
  }, [])

  useEffect(() => {
    if (!plan) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
  }, [plan])

  return { plan, setPlan }
}
