import { File } from 'formidable'

/**
 * Verifica que exista un archivo con key "file" y que su MIME sea válido.
 * @param files Objeto de archivos resultante de formidable.parse()
 * @throws Error con statusCode (400 o 415) si falla la validación
 * @returns El File validado
 */
export function validateUpload(files: Record<string, File>) {
  const uploaded = files.file
  if (!uploaded) {
    const err = new Error("No se encontró el archivo 'file' en la solicitud.")
    ;(err as any).statusCode = 400
    throw err
  }

  const { mimetype } = uploaded
  const allowed = ['application/pdf', 'image/png', 'image/jpeg']
  if (!mimetype || !allowed.includes(mimetype)) {
    const err = new Error(`Tipo de archivo no permitido: ${mimetype}`)
    ;(err as any).statusCode = 415
    throw err
  }

  return uploaded
}
