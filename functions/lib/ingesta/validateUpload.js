// lib/ingesta/validateUpload.ts
// Asumiendo que es una función que valida datos de una solicitud HTTP,
// como las que se usan en Firebase Functions.
/**
 * Valida si el tipo MIME del archivo es PDF.
 * @param mimeType El tipo MIME del archivo.
 * @returns true si es PDF, false en caso contrario.
 */
export function validateFileType(mimeType) {
    return mimeType.startsWith("application/pdf"); // Corregido: comillas dobles
}
/**
 * Valida los datos de la solicitud de subida del archivo.
 * @param requestData Los datos recibidos en la solicitud.
 * @returns Un objeto con 'isValid' (booleano) y un 'message' (opcional) si hay un error.
 */
export function validateUpload(requestData) {
    const { fileName, fileMimeType } = requestData; // Ya no debería ser 'any' si requestData está tipado
    // Comprobaciones explícitas para asegurar que los valores existen y son strings
    if (typeof fileName !== "string" || fileName.trim() === "" || // Corregido: comillas dobles
        typeof fileMimeType !== "string" || fileMimeType.trim() === "") { // Corregido: comillas dobles
        return { isValid: false, message: "Faltan el nombre del archivo o el tipo MIME." }; // Corregido: comillas dobles
    }
    if (!validateFileType(fileMimeType)) {
        return { isValid: false, message: "Tipo de archivo no soportado. Sólo se permiten PDFs." }; // Corregido: comillas dobles
    }
    return { isValid: true };
}
//# sourceMappingURL=validateUpload.js.map