import "dotenv/config";
import * as functions from "firebase-functions";
import "./firebase-admin.js";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { pdfExtractFile } from "./ingesta/pdfExtractPdfReader.js";
import { generarEsquemaJSON } from "./structura/generarEsquemaJSON.js";
import { generarHTMLMedMaster } from "./html/generarHTMLMedMaster.js";
import { sanitizeHtmlContent } from "./validator/htmlSanitizer.js";
import { checkHtmlRules } from "./validator/ruleChecker.js";
import { htmlToPdf } from "./pdf/htmlToPdf.js";
import { ocrConDocumentAI } from "./ocr/ocrConDocumentAI.js";
import { splitPdfByPageCount } from "./pdfsplit/splitPdfBuffer.js";
import { cleanupStuckNotes } from "./utils/cleanupStuckNotes.js";
import { procesarAudioMedMasterStream } from "./lib/procesarAudioMedMaster.js";
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const jsBeautify = require("js-beautify");
const beautifyHtml = jsBeautify.html_beautify;
interface StorageFile {
  exists(): Promise<[boolean]>;
  createReadStream(): NodeJS.ReadableStream;
}

async function waitForFile(
  file: StorageFile,
  retries = 3,
  delayMs = 1000
): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    const [exists] = await file.exists();
    if (exists) return true;
    await new Promise((res) => setTimeout(res, delayMs));
  }
  return false;
}

interface GenerateNoteRequestData {
  noteId: string;
  plan: "free" | "basic" | "pro" | "express" | "extra" | "unlimited";
  fileName: string;
  fileMimeType: string;
}

interface GenerateNoteWithEmphasisRequestData extends GenerateNoteRequestData {
  emphasis: string;
}

interface GenerateNoteResponseData {
  success: boolean;
  noteId: string;
  publicURL?: string;
}

const CHUNK_TOKEN_SIZE = 10000;

/**
 * Split a large text into token-sized chunks.
 *
 * @param text The text to divide into pieces.
 * @param maxTokens Maximum token count per chunk. Defaults to `CHUNK_TOKEN_SIZE`.
 * @returns Array of chunked strings.
 */
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

/**
 * Generate a summarized note from a PDF uploaded by the client.
 *
 * @param request Callable request containing authentication and file metadata.
 * @returns Result with success flag, note ID and a signed URL to the final file.
 */
export const generateNoteFromPdf = functions.https.onCall(
  { memory: '2GiB', timeoutSeconds: 540, cpu: 2 },
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
    const tmpPdfPath = path.join(tmpdir(), `${noteId}-${fileName}`);
    await cleanupStuckNotes(uid);
    const startTime = Date.now();
    const startMem = process.memoryUsage().rss;
    console.log(`generateNoteFromPdf start - rss: ${startMem}`);
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

      const exists = await waitForFile(file);
      if (!exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "El archivo PDF no se encontró en Cloud Storage."
        );
      }

      await pipeline(file.createReadStream(), fs.createWriteStream(tmpPdfPath));

      let rawText = await pdfExtractFile(tmpPdfPath);
      await noteRef.update({
        status: "processing",
        progress: 30,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      // OCR solo para usuarios Plus si no hay texto extraído
      if (isPlus && (!rawText || rawText.trim().length < 200)) {
        const buffer = await fsp.readFile(tmpPdfPath);
        const partes = await splitPdfByPageCount(buffer, 15);
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
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "Payload a PDF:",
          JSON.stringify({ html: prettyHtml }).substring(0, 1000),
          "..."
        );

        console.log("======= HTML enviado a función PDF =======");

        console.log(prettyHtml.substring(0, 1000)); // Muestra los primeros 1000 caracteres

        console.log("... [HTML truncado]");

        console.log("Largo total de HTML:", prettyHtml.length);

        console.log("==========================================");
      }

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
      await fsp.unlink(tmpPdfPath).catch(() => {});

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
    } finally {
      console.log(
        `generateNoteFromPdf end - duration: ${Date.now() - startTime}ms rss:` +
          ` ${process.memoryUsage().rss}`
      );
      await fsp.unlink(tmpPdfPath).catch(() => {});
    }
  }
);

export const generateNoteFromPdfEmphasis = functions.https.onCall(
  { memory: '2GiB', timeoutSeconds: 540, cpu: 2 },
  async (
    request: functions.https.CallableRequest<GenerateNoteWithEmphasisRequestData>
  ): Promise<GenerateNoteResponseData> => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'La función debe ser llamada por un usuario autenticado.'
      );
    }

    const uid = request.auth.uid;
    const { noteId, plan, fileName, fileMimeType, emphasis } = request.data;

    if (!noteId || !plan || !fileName || !fileMimeType) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Faltan argumentos necesarios para procesar el apunte.'
      );
    }

    const isPlus = plan === 'pro' || plan === 'unlimited';
    const noteRef = db.collection('users').doc(uid).collection('notes').doc(noteId);
    const tmpPdfPath = path.join(tmpdir(), `${noteId}-${fileName}`);
    await cleanupStuckNotes(uid);
    const startTime = Date.now();
    const startMem = process.memoryUsage().rss;
    console.log(`generateNoteFromPdfEmphasis start - rss: ${startMem}`);
    try {
      await noteRef.update({
        status: 'processing',
        progress: 10,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      const bucket = storage.bucket();
      const filePath = `temp_uploads/${uid}/${noteId}/${fileName}`;
      const file = bucket.file(filePath);

      const [exists] = await file.exists();
      if (!exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'El archivo PDF no se encontró en Cloud Storage.'
        );
      }

      await pipeline(file.createReadStream(), fs.createWriteStream(tmpPdfPath));

      let rawText = await pdfExtractFile(tmpPdfPath);
      await noteRef.update({
        status: 'processing',
        progress: 30,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      if (isPlus && (!rawText || rawText.trim().length < 200)) {
        const buffer = await fsp.readFile(tmpPdfPath);
        const partes = await splitPdfByPageCount(buffer, 15);
        const textos: string[] = [];
        for (let i = 0; i < partes.length; i++) {
          const texto = await ocrConDocumentAI(partes[i]);
          textos.push(texto);
        }
        rawText = textos.join('\n\n');
      } else if (!isPlus && (!rawText || rawText.trim().length < 200)) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'No se pudo extraer texto del PDF (requiere plan Plus para OCR).'
        );
      }

      await noteRef.update({
        status: 'processing',
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
        status: 'processing',
        progress: 85,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      const fullHtml = htmlFragments.join('\n\n');
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
        status: 'processing',
        progress: 95,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      const pdfBuffer = await htmlToPdf(prettyHtml);
      const timestamp = Date.now();
      const finalNoteFilePath =
        `users/${uid}/notes/${timestamp}-${fileName.replace(PDF_EXTENSION_REGEX, '_note.pdf')}`;
      const fileRef = storage.bucket().file(finalNoteFilePath);

      const bufferToSave = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
      await fileRef.save(bufferToSave, { contentType: 'application/pdf' });

      const [publicURL] = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      await noteRef.update({
        title: fileName.replace(PDF_EXTENSION_REGEX, '') || 'Apunte desde PDF',
        url: publicURL,
        type: 'pdf',
        rawText: rawText.substring(0, 5000),
        htmlContent: prettyHtml.substring(0, 5000),
        createdAt: FieldValue.serverTimestamp(),
        usedOcr: isPlus,
        usedVision: false,
        visionInsights: [],
        status: 'completed',
        progress: 100,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      await bucket.file(filePath).delete().catch((err: unknown) => {
        if (err instanceof Error) {
          console.error('Error deleting temp file:', err.message);
        } else {
          console.error('Error deleting temp file:', err);
        }
      });
      await fsp.unlink(tmpPdfPath).catch(() => {});

      return { success: true, noteId: noteId, publicURL: publicURL };
    } catch (err: unknown) {
      let errorMessage = 'Error desconocido';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      await noteRef.update({
        status: 'failed',
        errorMessage: errorMessage,
        lastUpdated: FieldValue.serverTimestamp(),
      });
      throw new functions.https.HttpsError('internal', errorMessage);
    } finally {
      console.log(
        `generateNoteFromPdfEmphasis end - duration: ${Date.now() - startTime}ms rss:` +
          ` ${process.memoryUsage().rss}`
      );
      await fsp.unlink(tmpPdfPath).catch(() => {});
    }
  }
);
/**
 * Generate a summarized note from a YouTube video URL.
 *
 * @param request Callable request containing auth info, video URL and note details.
 * @returns Object with success flag, note ID and the public URL to the generated PDF.
 */
export const generateNoteFromVideo = functions.https.onCall(
  { memory: '2GiB', timeoutSeconds: 540, cpu: 2 },
  async (
    request: functions.https.CallableRequest<
      GenerateNoteRequestData & { videoUrl: string }
    >
  ): Promise<GenerateNoteResponseData> => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "La función debe ser llamada por un usuario autenticado."
      );
    }

    const uid = request.auth.uid;
    const { noteId, plan, videoUrl, fileName } = request.data;

    if (!noteId || !plan || !videoUrl || !fileName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Faltan argumentos necesarios para procesar el apunte de video."
      );
    }

    const userRef = db.collection("users").doc(uid);
    const noteRef = userRef.collection("notes").doc(noteId);
    const isPlus = plan === "pro" || plan === "unlimited";

    await cleanupStuckNotes(uid);
    try {
      await db.runTransaction(async tx => {
        const snap = await tx.get(userRef);
        const activeCount = snap.exists ? snap.get('activeNoteCount') || 0 : 0;
        console.log(`Concurrencia actual: ${activeCount}`);

        if (activeCount >= 3) {
          throw new functions.https.HttpsError(
            'resource-exhausted',
            'Ya estás generando 3 tareas. Espera a que finalicen.'
          );
        }

        tx.update(userRef, {
          activeNoteCount: FieldValue.increment(1),
        });
      });
    } catch (err) {
      if ((err as functions.https.HttpsError).code === 'resource-exhausted') {
        await noteRef.set(
          {
            status: 'failed',
            errorMessage:
              'Ya estás generando 3 videos, espera a que finalicen para enviar más',
            lastUpdated: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
      throw err;
    }

    const startTime = Date.now();
    const startMem = process.memoryUsage().rss;
    console.log(`generateNoteFromVideo start - rss: ${startMem}`);

    try {
      await noteRef.set(
        {
          status: "processing",
          progress: 10,
          lastUpdated: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

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

      await noteRef.update({
        status: "failed",
        errorMessage,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      throw new functions.https.HttpsError("internal", errorMessage);
    } finally {
      console.log(
        `generateNoteFromVideo end - duration: ${Date.now() - startTime}ms rss:` +
          ` ${process.memoryUsage().rss}`
      );
  await userRef.update({
        activeNoteCount: FieldValue.increment(-1),
      });
    }
  }
);

export const generateNoteFromVideoEmphasis = functions.https.onCall(
  { memory: '2GiB', timeoutSeconds: 540, cpu: 2 },
  async (
    request: functions.https.CallableRequest<
      GenerateNoteWithEmphasisRequestData & { videoUrl: string }
    >
  ): Promise<GenerateNoteResponseData> => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'La función debe ser llamada por un usuario autenticado.'
      );
    }

    const uid = request.auth.uid;
    const { noteId, plan, videoUrl, fileName, emphasis } = request.data;

    if (!noteId || !plan || !videoUrl || !fileName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Faltan argumentos necesarios para procesar el apunte de video.'
      );
    }

    const userRef = db.collection('users').doc(uid);
    const noteRef = userRef.collection('notes').doc(noteId);
    const isPlus = plan === 'pro' || plan === 'unlimited';

    await cleanupStuckNotes(uid);
    try {
      await db.runTransaction(async tx => {
        const snap = await tx.get(userRef);
        const activeCount = snap.exists ? snap.get('activeNoteCount') || 0 : 0;
        console.log(`Concurrencia actual: ${activeCount}`);

        if (activeCount >= 3) {
          throw new functions.https.HttpsError(
            'resource-exhausted',
            'Ya estás generando 3 tareas. Espera a que finalicen.'
          );
        }

        tx.update(userRef, {
          activeNoteCount: FieldValue.increment(1),
        });
      });
    } catch (err) {
      if ((err as functions.https.HttpsError).code === 'resource-exhausted') {
        await noteRef.set(
          {
            status: 'failed',
            errorMessage:
              'Ya estás generando 3 videos, espera a que finalicen para enviar más',
            lastUpdated: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
      throw err;
    }

    const startTime = Date.now();
    const startMem = process.memoryUsage().rss;
    console.log(`generateNoteFromVideoEmphasis start - rss: ${startMem}`);

    try {
      await noteRef.set(
        {
          status: 'processing',
          progress: 10,
          lastUpdated: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      const DUMPLING_API_KEY = process.env.DUMPLING_API_KEY!;
      const dumplingRes = await fetch('https://app.dumplingai.com/api/v1/get-youtube-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DUMPLING_API_KEY}`,
        },
        body: JSON.stringify({
          videoUrl: videoUrl.trim(),
          includeTimestamps: true,
          timestampsToCombine: 5,
          preferredLanguage: 'es',
        }),
      });

      if (!dumplingRes.ok) {
        throw new functions.https.HttpsError(
          'internal',
          `Dumpling AI error: ${dumplingRes.statusText}`
        );
      }

      const dumplingData = (await dumplingRes.json()) as any;
      const transcript = dumplingData.transcript;
      const rawText = Array.isArray(transcript)
        ? transcript.map((item: any) => (typeof item === 'string' ? item : item.text || '')).join(' ')
        : String(transcript);

      await noteRef.update({
        status: 'processing',
        progress: 40,
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
        status: 'processing',
        progress: 75,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      const fullHtml = htmlFragments.join('\n\n');
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
        status: 'processing',
        progress: 95,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      const pdfBuffer = await htmlToPdf(prettyHtml);
      const timestamp = Date.now();
      const finalNoteFilePath = `users/${uid}/notes/${timestamp}-${fileName.replace(PDF_EXTENSION_REGEX, '_note.pdf')}`;
      const fileRef = storage.bucket().file(finalNoteFilePath);

      const bufferToSave = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
      await fileRef.save(bufferToSave, { contentType: 'application/pdf' });

      const [publicURL] = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      await noteRef.update({
        title: fileName.replace(PDF_EXTENSION_REGEX, '') || 'Apunte desde Video',
        url: publicURL,
        type: 'pdf',
        rawText: rawText.substring(0, 5000),
        htmlContent: prettyHtml.substring(0, 5000),
        createdAt: FieldValue.serverTimestamp(),
        usedOcr: false,
        usedVision: false,
        visionInsights: [],
        status: 'completed',
        progress: 100,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      return { success: true, noteId, publicURL };
    } catch (err: any) {
      let errorMessage = 'Error desconocido';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      await noteRef.update({
        status: 'failed',
        errorMessage,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      throw new functions.https.HttpsError('internal', errorMessage);
    } finally {
      console.log(
        `generateNoteFromVideoEmphasis end - duration: ${Date.now() - startTime}ms rss:` +
          ` ${process.memoryUsage().rss}`
      );
      await userRef.update({
        activeNoteCount: FieldValue.increment(-1),
      });
    }
  }
);

export const generateNoteFromAudio = functions.https.onCall(
  { memory: '2GiB', timeoutSeconds: 540, cpu: 2 },
  async (
    request: functions.https.CallableRequest<
      GenerateNoteRequestData & { audioUrl?: string; fileMimeType: string }
    >,
  ): Promise<GenerateNoteResponseData> => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'La función debe ser llamada por un usuario autenticado.'
      );
    }

    const uid = request.auth.uid;
    const { noteId, plan, audioUrl, fileName, fileMimeType } = request.data;

    if (!noteId || !plan || !fileName || !fileMimeType) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Faltan argumentos necesarios para procesar el audio.'
      );
    }

    const noteRef = db.collection('users').doc(uid).collection('notes').doc(noteId);
    const bucket = storage.bucket();
    const filePath = `temp_uploads/${uid}/${noteId}/${fileName}`;

    const startTime = Date.now();
    const startMem = process.memoryUsage().rss;
    console.log(`generateNoteFromAudio start - rss: ${startMem}`);

    try {
      await noteRef.set(
        {
          status: 'processing',
          progress: 10,
          lastUpdated: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      let audioStream: Readable;
      if (audioUrl) {
        const res = await fetch(audioUrl);
        if (!res.ok) throw new Error(`Fetch ${res.status}`);
        audioStream = res.body ? Readable.fromWeb(res.body as any) : Readable.from([]);
      } else {
        const file = bucket.file(filePath);
        const [exists] = await file.exists();
        if (!exists) {
          throw new functions.https.HttpsError('not-found', 'Archivo no encontrado');
        }
        audioStream = file.createReadStream() as unknown as Readable;
      }

      await noteRef.update({
        status: 'processing',
        progress: 40,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      const { pdfBuffer, rawText, prettyHtml } = await procesarAudioMedMasterStream(audioStream, fileMimeType);

      await noteRef.update({
        status: 'processing',
        progress: 95,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      const timestamp = Date.now();
      const finalNoteFilePath = `users/${uid}/notes/${timestamp}-${fileName.replace(/\.[^./]+$/, '_note.pdf')}`;
      const fileRef = bucket.file(finalNoteFilePath);
      await fileRef.save(Buffer.from(pdfBuffer), { contentType: 'application/pdf' });

      const [publicURL] = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      await noteRef.update({
        title: fileName.replace(/\.[^./]+$/, '') || 'Apunte desde Audio',
        url: publicURL,
        type: 'pdf',
        rawText: rawText.substring(0, 5000),
        htmlContent: prettyHtml.substring(0, 5000),
        createdAt: FieldValue.serverTimestamp(),
        usedOcr: false,
        usedVision: false,
        visionInsights: [],
        status: 'completed',
        progress: 100,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      if (!audioUrl) {
        await bucket.file(filePath).delete().catch(() => {});
      }

      return { success: true, noteId, publicURL };
    } catch (err: any) {
      let errorMessage = 'Error desconocido';
      if (err instanceof Error) errorMessage = err.message;
      await noteRef.update({
        status: 'failed',
        errorMessage,
        lastUpdated: FieldValue.serverTimestamp(),
      });
      throw new functions.https.HttpsError('internal', errorMessage);
    } finally {
      console.log(
        `generateNoteFromAudio end - duration: ${Date.now() - startTime}ms rss:` +
          ` ${process.memoryUsage().rss}`
      );
    }
  }
);

export { createJob, worker, getJobStatus, downloadJobResult, cleanupOldJobs } from './jobs/jobFunctions.js';
export { deleteApiCacheFile } from './utils/apiCacheCleanup.js';
