export interface Tema {
  nombre: string;
  dificultad: "fácil" | "intermedio" | "difícil";
  recursos?: string[];
}

export interface Materia {
  nombre: string;
  prioridad: "alta" | "media" | "baja";
  temas: Tema[];
  fecha?: string;
}

export interface Disponibilidad {
  [dia: string]: string[];
}

export interface PlanItem {
  fecha: string;
  materia: string;
  tema: string;
  tipo: string;
  dificultad: "fácil" | "intermedio" | "difícil";
  metodo_estudio: string;
  recursos?: string[];
  justificacion: string;
  hecho?: boolean;
}

export interface LUPData {
  materias: Materia[];
  disponibilidad: Disponibilidad;
  presentacion: string;
  metodoEstudio: string[];
  plan: PlanItem[];
}

export interface LUPResponse {
  plan: PlanItem[];
  sugerencias?: string[];
  raw?: string;
}
