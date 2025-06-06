// lib/ingesta/pdfToText.ts
import * as pdfParse from 'pdf-parse'

/**
 * Dado un Uint8Array con el PDF, devuelve un array de textos,
 * uno por página (separado por form feeds \f).
 */
export async function pdfToText(data: Uint8Array): Promise<string[]> {
  // Asegúrate de que es un Buffer
  const buffer = Buffer.from(data)

  // Llama a pdf-parse correctamente
  const result = await (pdfParse as any)(buffer)

  // Divide por form feed (fin de página)
  const pages = (result.text as string)
    .split('\f')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  // Si no encontró '\f', separa por dobles saltos
  if (pages.length === 0) {
    return (result.text as string)
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
  }

  return pages
}
