export interface StudyBlock {
  id: string
  tipo: string
  duracion: number
  metodoNeuro: string
  recomendadoPara: string
  estado: string
}

export interface StudyTopic {
  id: string
  nombre: string
  fechaLimite: string
  dificultad: number
  bloques: StudyBlock[]
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
}
