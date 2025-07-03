// lib/ingesta/pdfExtractPdfReader.ts
import { PdfReader } from "pdfreader"

/**
 * Extrae todo el texto de un PDF dado como Uint8Array.
 * Concatena líneas cuando cambia la coordenada Y.
 */
export async function pdfExtract(data: Uint8Array): Promise<string> {
  return new Promise((resolve, reject) => {
    // PdfReader.parseBuffer necesita un Buffer de Node.js
    const buffer = Buffer.from(data)
    let lastY: number | null = null
    let result = ""

    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        return reject(err)
      }
      // cuando item === null, terminó la lectura
      if (!item) {
        return resolve(result)
      }
      // solo procesamos los items que tienen texto
      // casteamos a `any` para poder leer .text y .y sin error TS
      const it = item as any
      if (typeof it.text === "string") {
        // si cambiamos de línea vertical, metemos un salto
        if (lastY !== it.y) {
          result += "\n"
          lastY = it.y
        }
        result += it.text
      }
    })
  })
}
