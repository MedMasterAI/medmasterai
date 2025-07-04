// src/lib/statusMessages.ts

export type JobStatus =
  | "idle"
  | "validating"
  | "uploading_pdf"
  | "uploading_audio"
  | "saving_firestore"
  | "calling_function"
  | "pending"
  | "processing"
  | "extracting_text"
  | "generating_schema"
  | "formatting_html"
  | "uploading_final_pdf"
  | "completed"
  | "failed"

export const statusMessages: Record<JobStatus, string> = {
  idle: "Esperando acción del usuario.",
  validating: "Validando datos y permisos...",
  uploading_pdf: "Subiendo PDF al almacenamiento...",
  uploading_audio: "Subiendo audio al almacenamiento...",
  saving_firestore: "Guardando registro en Firestore...",
  calling_function: "Iniciando procesamiento con IA...",
  pending: "Envío registrado. Te notificaremos por mail cuando esté listo.",
  processing: "Procesando apunte...",
  extracting_text: "Extrayendo texto del PDF...",
  generating_schema: "Generando esquema del apunte...",
  formatting_html: "Formateando HTML...",
  uploading_final_pdf: "Subiendo PDF final...",
  completed: "¡Apunte generado exitosamente!",
  failed: "Error durante la generación.",
}
