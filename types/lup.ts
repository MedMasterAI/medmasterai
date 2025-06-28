export interface Materia {
  nombre: string
  temas: string[]
  fecha?: string
}

export interface Disponibilidad {
  [dia: string]: string[]
}

export interface LUPData {
  materias: Materia[]
  disponibilidad: Disponibilidad
  presentacion: string
  plan: { fecha: string; materia: string; tema: string; tipo: string }[]
}
