import { google } from "googleapis";
import { JWT } from "google-auth-library";
// Importa las credenciales del service account (asegúrate de que las rutas sean correctas)
import credentials from "../credentials/vision-service-account.js";
const documentai = google.documentai("v1");
const authClient = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});
export async function ocrConDocumentAI(pdfBuffer) {
    try {
        const projectId = credentials.project_id;
        // 🔑 Toma el PROCESSOR_ID de variables de entorno, nunca de functions.config
        const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID || "YOUR_PROCESSOR_ID_HERE";
        if (!processorId || processorId === "YOUR_PROCESSOR_ID_HERE") {
            throw new Error("DOCUMENT_AI_PROCESSOR_ID no está configurado en las variables de entorno de Firebase Functions.");
        }
        // Si tienes LOCATION como variable (opcional):
        const location = process.env.DOCUMENT_AI_LOCATION || "us";
        const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
        const encoded = pdfBuffer.toString("base64");
        const request = {
            name,
            auth: authClient,
            requestBody: {
                rawDocument: {
                    content: encoded,
                    mimeType: "application/pdf",
                },
            },
        };
        const result = (await documentai.projects.locations.processors.process(request));
        const document = result.data.document;
        return document?.text?.trim() ?? "";
    }
    catch (error) {
        const apiError = error;
        const apiErrorMessage = apiError.response?.data?.error?.message;
        const apiResponseData = apiError.response?.data;
        const generalErrorMessage = apiError.message;
        const errorMessageToLog = apiErrorMessage || apiResponseData || generalErrorMessage || error;
        console.error("❌ OCR Document AI Error:", errorMessageToLog);
        const errorMsg = apiError.message || "Desconocido";
        throw new Error(`Document AI OCR falló: ${errorMsg}`);
    }
}
//# sourceMappingURL=ocrConDocumentAI.js.map