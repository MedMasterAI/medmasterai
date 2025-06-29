export interface Tema {
  nombre: string
  dificultad: number
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
}

export interface LUPData {
  materias: Materia[]
  disponibilidad: Disponibilidad
  presentacion: string
  plan: PlanItem[]
}

export interface LUPResponse {
  plan: PlanItem[]
  sugerencias?: string[]
  raw?: string
}
