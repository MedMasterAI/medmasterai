import { sanitizeHtmlContent } from "../validator/htmlSanitizer.js";
import { checkHtmlRules } from "../validator/ruleChecker.js";
import "dotenv/config";
// Si tu entorno es Node < 18, descomenta la siguiente línea:
// import fetch from "node-fetch";
export async function htmlToPdf(html) {
    // Paso 1: Sanitizar el HTML
    const htmlLimpio = sanitizeHtmlContent(html);
    // Paso 2: Verificar reglas prohibidas
    checkHtmlRules(htmlLimpio);
    // Paso 3: Validar que no esté vacío ni malformado
    if (!htmlLimpio || typeof htmlLimpio !== "string" || !htmlLimpio.trim()) {
        throw new Error("El HTML entregado está vacío o malformado.");
    }
    // === LOG COMPLETO DE LO QUE SE ENVÍA ===
    const endpoint = process.env.PDF_SERVICE_URL;
    const payload = { html: htmlLimpio };
    if (process.env.DEBUG_PDF === 'true') {
        console.log("\n[DEBUG: htmlToPdf] === ENVÍO A FUNCTION 2 (fetch) ===");
        console.log("Endpoint:", endpoint);
        console.log("Payload (JSON):", JSON.stringify(payload, null, 2));
        console.log("Tipo de htmlLimpio:", typeof htmlLimpio);
        console.log("Largo de htmlLimpio:", htmlLimpio.length);
        console.log("Primeros 200 caracteres:", htmlLimpio.slice(0, 200));
        console.log("=========================\n");
    }
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`[${response.status}] Error response: ${text}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
    catch (error) {
        console.error("[htmlToPdf][fetch] Error:", error);
        throw new Error(`Fallo al generar PDF (fetch): ${error.message || error}`);
    }
}
//# sourceMappingURL=htmlToPdf.js.map