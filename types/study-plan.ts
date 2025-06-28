export interface StudyTopic {
  id: string
  nombre: string
  fechaLimite?: string
  dificultad: number
  bloques: string[]
}

export interface StudySubject {
  id: string
  nombre: string
  importancia: number
  tipoEvaluacion: string
  temas: StudyTopic[]
}

export interface DailyPlan {
  fecha: string
  bloquesRecomendados: string[]
}

export interface StudyPlan {
  usuario: string
  preferencias: {
    bloquesCortos: boolean
    maxBloquesPorDia: number
    bloqueMinutos: number
    descansoMinutos: number
    metodosFavoritos: string[]
    metodoOrganizacion: string
  }
  materias: StudySubject[]
  planDiario: DailyPlan[]
  historialBloques?: {
    fecha: string
    materiaId: string
    temaId: string
    metodo: string
    resultado: number
    feedback?: string
  }[]
  analisisIA?: {
    mejorMetodo: string
    sugerencias: string
    cambios: string[]
  }
  progresoGeneral?: number
  avancePorMateria?: Record<string, number>
  bloquesCompletadosSemana?: number
  bloquesReplanificados?: number
  rachaEstudioDias?: number
}