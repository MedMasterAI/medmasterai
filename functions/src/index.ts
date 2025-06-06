import "dotenv/config";
import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

initializeApp();

import { pdfExtract } from "./ingesta/pdfExtractPdfReader.js";
import { generarEsquemaJSON } from "./structura/generarEsquemaJSON.js";
import { generarHTMLMedMaster } from "./html/generarHTMLMedMaster.js";
import { sanitizeHtmlContent } from "./validator/htmlSanitizer.js";
import { checkHtmlRules } from "./validator/ruleChecker.js";
import { htmlToPdf } from "./pdf/htmlToPdf.js";
import { ocrConDocumentAI } from "./ocr/ocrConDocumentAI.js";
import { splitPdfByPageCount } from "./pdfsplit/splitPdfBuffer.js";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const jsBeautify = require("js-beautify");
const beautifyHtml = jsBeautify.html_beautify;

interface GenerateNoteRequestData {
  noteId: string;
  plan: "free" | "pro" | "unlimited";
  fileName: string;
  fileMimeType: string;
}

interface GenerateNoteResponseData {
  success: boolean;
  noteId: string;
  publicURL?: string;
}

const CHUNK_TOKEN_SIZE = 10000;

function chunkTextByTokens(text: string, maxTokens = CHUNK_TOKEN_SIZE): string[] {
  const maxChars = maxTokens * 4;
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(text.length, start + maxChars);
    let slice = text.slice(start, end);
    if (end < text.length) {
      const idx = slice.lastIndexOf(". ");
      if (idx > 0) {
        slice = slice.slice(0, idx + 1);
        end = start + slice.length;
      }
    }
    chunks.push(slice.trim());
    start = end;
  }

  return chunks;
}

const db = getFirestore();
const storage = getStorage();
const PDF_EXTENSION_REGEX = /\.pdf$/;

export const generateNoteFromPdf = functions.https.onCall(
  async (
    request: functions.https.CallableRequest<GenerateNoteRequestData>
  ): Promise<GenerateNoteResponseData> => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "La función debe ser llamada por un usuario autenticado."
      );
    }

    const uid = request.auth.uid;
    const { noteId, plan, fileName, fileMimeType } = request.data;

    if (!noteId || !plan || !fileName || !fileMimeType) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Faltan argumentos necesarios para procesar el apunte."
      );
    }

    const isPlus = plan === "pro" || plan === "unlimited";
    const noteRef = db.collection("users").doc(uid).collection("notes").doc(noteId);
    let fileBuffer: Buffer | undefined;

    try {
      // Estado: PROCESANDO (inicio real del procesamiento)
      await noteRef.update({
        status: "processing",
        progress: 10,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      const bucket = storage.bucket();
      const filePath = `temp_uploads/${uid}/${noteId}/${fileName}`;
      const file = bucket.file(filePath);

      const [exists] = await file.exists();
      if (!exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "El archivo PDF no se encontró en Cloud Storage."
        );
      }

      const [downloadedBuffer] = await file.download();
      fileBuffer = downloadedBuffer;

      let rawText = await pdfExtract(fileBuffer);
      await noteRef.update({
        status: "processing",
        progress: 30,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      // OCR solo para usuarios Plus si no hay texto extraído
      if (isPlus && (!rawText || rawText.trim().length < 200)) {
        const partes = await splitPdfByPageCount(fileBuffer, 15);
        const textos: string[] = [];
        for (let i = 0; i < partes.length; i++) {
          const texto = await ocrConDocumentAI(partes[i]);
          textos.push(texto);
        }
        rawText = textos.join("\n\n");
      } else if (!isPlus && (!rawText || rawText.trim().length < 200)) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "No se pudo extraer texto del PDF (requiere plan Plus para OCR)."
        );
      }

      await noteRef.update({
        status: "processing",
        progress: 60,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      const bloques = chunkTextByTokens(rawText);
      const htmlFragments: string[] = [];

      for (const texto of bloques) {
        const esquema = await generarEsquemaJSON(texto);
        const html = await generarHTMLMedMaster(esquema);
        htmlFragments.push(html);
      }

      await noteRef.update({
        status: "processing",
        progress: 85,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      const fullHtml = htmlFragments.join("\n\n");
      const cleanHtml = sanitizeHtmlContent(fullHtml);
      checkHtmlRules(cleanHtml);

      const prettyHtml = beautifyHtml(cleanHtml, {
        indent_size: 2,
        wrap_line_length: 0,
        preserve_newlines: true,
        max_preserve_newlines: 2,
        end_with_newline: true,
      });

      await noteRef.update({
        status: "processing",
        progress: 95,
        lastUpdated: FieldValue.serverTimestamp(),
      });
      console.log("Payload a PDF:", JSON.stringify({ html: prettyHtml }).substring(0, 1000), "...");

      console.log("======= HTML enviado a función PDF =======");

      console.log(prettyHtml.substring(0, 1000)); // Muestra los primeros 1000 caracteres

      console.log("... [HTML truncado]");

      console.log("Largo total de HTML:", prettyHtml.length);

      console.log("==========================================");

      const pdfBuffer = await htmlToPdf(prettyHtml);
      const timestamp = Date.now();
      const finalNoteFilePath =
        `users/${uid}/notes/${timestamp}-${fileName.replace(PDF_EXTENSION_REGEX, "_note.pdf")}`;
      const fileRef = storage.bucket().file(finalNoteFilePath);

      const bufferToSave = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
      await fileRef.save(bufferToSave, { contentType: "application/pdf" });

      const [publicURL] = await fileRef.getSignedUrl({
        action: "read",
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      // Estado: COMPLETADO
      await noteRef.update({
        title: fileName.replace(PDF_EXTENSION_REGEX, "") || "Apunte desde PDF",
        url: publicURL,
        type: "pdf",
        rawText: rawText.substring(0, 5000),
        htmlContent: prettyHtml.substring(0, 5000),
        createdAt: FieldValue.serverTimestamp(),
        usedOcr: isPlus,
        usedVision: false,
        visionInsights: [],
        status: "completed", // ⬅️ aquí el valor esperado por tu frontend
        progress: 100,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      await bucket.file(filePath).delete().catch((err: unknown) => {
        if (err instanceof Error) {
          console.error("Error deleting temp file:", err.message);
        } else {
          console.error("Error deleting temp file:", err);
        }
      });

      return { success: true, noteId: noteId, publicURL: publicURL };
    } catch (err: unknown) {
      let errorMessage = "Error desconocido";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      // Estado: FALLIDO
      await noteRef.update({
        status: "failed",
        errorMessage: errorMessage,
        lastUpdated: FieldValue.serverTimestamp(),
      });
      throw new functions.https.HttpsError("internal", errorMessage);
    }
  }
);
export const generateNoteFromVideo = functions.https.onCall(
  async (
    request: functions.https.CallableRequest<
      GenerateNoteRequestData & { videoUrl: string }
    >
  ): Promise<GenerateNoteResponseData> => {
    // 🔒 Chequeo de auth igual que PDF
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "La función debe ser llamada por un usuario autenticado."
      );
    }

    // 📦 Extraer datos igual que PDF
    const uid = request.auth.uid;
    const { noteId, plan, videoUrl, fileName } = request.data;

    if (!noteId || !plan || !videoUrl || !fileName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Faltan argumentos necesarios para procesar el apunte de video."
      );
    }

    // 📍 Referencia en Firestore
    const noteRef = db.collection("users").doc(uid).collection("notes").doc(noteId);

    try {
      // Estado inicial
      await noteRef.set(
        {
          status: "processing",
          progress: 10,
          lastUpdated: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // 1️⃣ Llama a Dumpling AI
      const DUMPLING_API_KEY = process.env.DUMPLING_API_KEY!;
      const dumplingRes = await fetch("https://app.dumplingai.com/api/v1/get-youtube-transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DUMPLING_API_KEY}`,
        },
        body: JSON.stringify({
          videoUrl: videoUrl.trim(),
          includeTimestamps: true,
          timestampsToCombine: 5,
          preferredLanguage: "es",
        }),
      });

      if (!dumplingRes.ok) {
        throw new functions.https.HttpsError(
          "internal",
          `Dumpling AI error: ${dumplingRes.statusText}`
        );
      }

      // Recibe transcript (string o array)
      const dumplingData = await dumplingRes.json() as any;
      const transcript = dumplingData.transcript;
      const rawText = Array.isArray(transcript)
        ? transcript.map((item: any) => (typeof item === "string" ? item : item.text || "")).join(" ")
        : String(transcript);

      await noteRef.update({
        status: "processing",
        progress: 40,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      // 2️⃣ Pipeline de HTML (igual que PDF)
      const bloques = chunkTextByTokens(rawText);
      const htmlFragments: string[] = [];

      for (const texto of bloques) {
        const esquema = await generarEsquemaJSON(texto);
        const html = await generarHTMLMedMaster(esquema);
        htmlFragments.push(html);
      }

      await noteRef.update({
        status: "processing",
        progress: 75,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      // 3️⃣ Sanitiza y embellece HTML
      const fullHtml = htmlFragments.join("\n\n");
      const cleanHtml = sanitizeHtmlContent(fullHtml);
      checkHtmlRules(cleanHtml);

      const prettyHtml = beautifyHtml(cleanHtml, {
        indent_size: 2,
        wrap_line_length: 0,
        preserve_newlines: true,
        max_preserve_newlines: 2,
        end_with_newline: true,
      });

      await noteRef.update({
        status: "processing",
        progress: 95,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      // 4️⃣ Genera el PDF
      const pdfBuffer = await htmlToPdf(prettyHtml);
      const timestamp = Date.now();
      const finalNoteFilePath = `users/${uid}/notes/${timestamp}-${fileName.replace(PDF_EXTENSION_REGEX, "_note.pdf")}`;
      const fileRef = storage.bucket().file(finalNoteFilePath);

      const bufferToSave = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
      await fileRef.save(bufferToSave, { contentType: "application/pdf" });

      const [publicURL] = await fileRef.getSignedUrl({
        action: "read",
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      // Estado: COMPLETADO
      await noteRef.update({
        title: fileName.replace(PDF_EXTENSION_REGEX, "") || "Apunte desde Video",
        url: publicURL,
        type: "pdf",
        rawText: rawText.substring(0, 5000),
        htmlContent: prettyHtml.substring(0, 5000),
        createdAt: FieldValue.serverTimestamp(),
        usedOcr: false,
        usedVision: false,
        visionInsights: [],
        status: "completed",
        progress: 100,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      return { success: true, noteId, publicURL };
    } catch (err: any) {
      let errorMessage = "Error desconocido";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      // Estado: FALLIDO
      await noteRef.update({
        status: "failed",
        errorMessage,
        lastUpdated: FieldValue.serverTimestamp(),
      });
      throw new functions.https.HttpsError("internal", errorMessage);
    }
  }
);