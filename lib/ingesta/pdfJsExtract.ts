// lib/ingesta/pdfJsExtract.ts
import { PDFExtract, PDFExtractOptions } from 'pdf.js-extract'

/**
 * Toma un PDF en Uint8Array y devuelve todo el texto,
 * concatenando las páginas con '\f'.
 */
export async function pdfJsExtract(data: Uint8Array): Promise<string> {
  const pdfExtract = new PDFExtract()
  // Puedes afinar opciones si lo necesitas
  const options: PDFExtractOptions = {
    // ej: normalizeWhitespace: true,
    //      includeMarkedContent: false,
  }

  // extrae a partir de un buffer
  const result = await pdfExtract.extractBuffer(Buffer.from(data), options)

  // result.pages es un array, cada una tiene .content con trozos {str, x, y,...}
  const pagesText = result.pages.map(page =>
    page.content.map(item => item.str).join(' ')
  )

  // Unimos las páginas con salto de página '\f'
  return pagesText.join('\f')
}
