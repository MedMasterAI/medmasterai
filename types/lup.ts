export interface Tema {
  nombre: string
  dificultad: 'fácil' | 'intermedio' | 'difícil'
}

export interface Materia {
  nombre: string
  importancia: number
  temas: Tema[]
  fecha?: string
}

export interface Disponibilidad {
  [dia: string]: string[]
}

export interface PlanItem {
  fecha: string
  materia: string
  tema: string
  tipo: string
  dificultad: 'fácil' | 'intermedio' | 'difícil'
  metodo_estudio: string
  justificacion: string
}

export interface LUPData {
  materias: Materia[]
  disponibilidad: Disponibilidad
  presentacion: string
  metodoEstudio: string
  plan: PlanItem[]
}

export interface LUPResponse {
  plan: PlanItem[]
  sugerencias?: string[]
  raw?: string
}
