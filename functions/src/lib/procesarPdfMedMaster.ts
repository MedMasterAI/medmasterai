// src/lib/procesarPdfMedMaster.ts
import { html as beautifyHtml } from 'js-beautify'
import { pdfExtract, pdfExtractFile } from '@lib/ingesta/pdfExtractPdfReader.js'
import * as fs from 'node:fs/promises'
import { generarEsquemaJSON } from '@lib/structura/generarEsquemaJSON.js'
import { generarHTMLMedMaster } from '@lib/html/generarHTMLMedMaster.js'
import { sanitizeHtmlContent } from '@lib/validator/htmlSanitizer.js'
import { checkHtmlRules } from '@lib/validator/ruleChecker.js'
import { htmlToPdf } from '@lib/pdf/htmlToPdf.js'
import { ocrConDocumentAI } from '@/ocr/ocrConDocumentAI.js'
import { splitPdfByPageCount } from '@/pdfsplit/splitPdfBuffer.js'

const CHUNK_TOKEN_SIZE = 10000

function chunkTextByTokens(text: string, maxTokens = CHUNK_TOKEN_SIZE): string[] {
  const maxChars = maxTokens * 4
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = Math.min(text.length, start + maxChars)
    let slice = text.slice(start, end)
    if (end < text.length) {
      const idx = slice.lastIndexOf('. ')
      if (idx > 0) {
        slice = slice.slice(0, idx + 1)
        end = start + slice.length
      }
    }
    chunks.push(slice.trim())
    start = end
  }
  return chunks
}

export async function procesarPdfMedMaster(buffer: Buffer, { isPlus = false } = {}) {
  let rawText = await pdfExtract(buffer)

  if (isPlus && (!rawText || rawText.trim().length < 200)) {
    const partes = await splitPdfByPageCount(buffer, 15)
    const textos: string[] = []
    for (let i = 0; i < partes.length; i++) {
      const texto = await ocrConDocumentAI(partes[i])
      textos.push(texto)
    }
    rawText = textos.join('\n\n')
  } else if (!isPlus && (!rawText || rawText.trim().length < 200)) {
    throw new Error('No se pudo extraer texto del PDF.')
  }

  const bloques = chunkTextByTokens(rawText)
  const htmlFragments: string[] = []

  for (const texto of bloques) {
    const esquema = await generarEsquemaJSON(texto)
    const html = await generarHTMLMedMaster(esquema)
    htmlFragments.push(html)
  }

  const fullHtml = htmlFragments.join('\n\n')
  const cleanHtml = sanitizeHtmlContent(fullHtml)
  checkHtmlRules(cleanHtml)

  const prettyHtml = beautifyHtml(cleanHtml, {
    indent_size: 2,
    wrap_line_length: 0,
    preserve_newlines: true,
    max_preserve_newlines: 2,
    end_with_newline: true,
  })

  const pdfBuffer = await htmlToPdf(prettyHtml)

  return { pdfBuffer, rawText, prettyHtml }
}

export async function procesarPdfMedMasterFile(filePath: string, { isPlus = false } = {}) {
  let rawText = await pdfExtractFile(filePath);
  const buffer = await fs.readFile(filePath);
  if (isPlus && (!rawText || rawText.trim().length < 200)) {
    const partes = await splitPdfByPageCount(buffer, 15);
    const textos: string[] = [];
    for (const parte of partes) {
      const texto = await ocrConDocumentAI(parte);
      textos.push(texto);
    }
    rawText = textos.join('\n\n');
  } else if (!isPlus && (!rawText || rawText.trim().length < 200)) {
    throw new Error('No se pudo extraer texto del PDF.');
  }
  const bloques = chunkTextByTokens(rawText);
  const htmlFragments: string[] = [];
  for (const texto of bloques) {
    const esquema = await generarEsquemaJSON(texto);
    const html = await generarHTMLMedMaster(esquema);
    htmlFragments.push(html);
  }
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
  const pdfBuffer = await htmlToPdf(prettyHtml);
  return { pdfBuffer, rawText, prettyHtml };
}
