import type { StudyPlan, DailyPlan } from '@/types/study-plan'

/** Simple planner that distributes topics into daily blocks. */
export function generateDailyPlan(plan: StudyPlan, days = 7): DailyPlan[] {
  const topics = plan.materias.flatMap(m =>
    m.temas.map(t => ({
      materiaId: m.id,
      id: t.id,
      fechaLimite: t.fechaLimite || '',
      dificultad: t.dificultad || 1,
    }))
  )

  topics.sort((a, b) => {
    const diff = b.dificultad - a.dificultad
    if (diff !== 0) return diff
    const ad = a.fechaLimite ? new Date(a.fechaLimite).getTime() : Infinity
    const bd = b.fechaLimite ? new Date(b.fechaLimite).getTime() : Infinity
    return ad - bd
  })

  const result: DailyPlan[] = []
  let index = 0
  for (let d = 0; d < days && index < topics.length; d++) {
    const bloques: string[] = []
    for (
      let b = 0;
      b < plan.preferencias.maxBloquesPorDia && index < topics.length;
      b++
    ) {
      bloques.push(topics[index].id)
      index++
    }
    result.push({
      fecha: new Date(Date.now() + d * 86400000)
        .toISOString()
        .slice(0, 10),
      bloquesRecomendados: bloques,
    })
  }
  return result
}
