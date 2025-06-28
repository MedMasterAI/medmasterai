import { useState, useEffect } from 'react'
import type { StudyPlan } from '@/types/study-plan'
import { generateDailyPlan } from '@/lib/study-planner'

const STORAGE_KEY = 'study-plan'

const DEFAULT_PLAN: StudyPlan = {
  usuario: '',
  preferencias: {
    bloquesCortos: false,
    maxBloquesPorDia: 4,
    bloqueMinutos: 50,
    descansoMinutos: 10,
    metodosFavoritos: [],
    metodoOrganizacion: ''
  },
  materias: [],
  planDiario: []
}

export function useStudyPlan() {
  const [plan, setPlan] = useState<StudyPlan | null>(null)

  const updateDailyPlan = () => {
    if (!plan) return
    const planDiario = generateDailyPlan(plan)
    setPlan({ ...plan, planDiario })
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setPlan(JSON.parse(saved))
      } catch (err) {
        console.error('Error parsing study plan', err)
        setPlan(DEFAULT_PLAN)
      }
    } else {
      setPlan(DEFAULT_PLAN)
    }
  }, [])

  useEffect(() => {
    if (!plan) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
  }, [plan])

  return { plan, setPlan, updateDailyPlan }
}