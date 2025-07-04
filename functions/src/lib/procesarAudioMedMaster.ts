import beautify from 'js-beautify';
const beautifyHtml = beautify.html;
import { GoogleGenerativeAI } from '@google/generative-ai'
import { generarEsquemaJSON } from '../structura/generarEsquemaJSON.js'
import { generarHTMLMedMaster } from '../html/generarHTMLMedMaster.js'
import { sanitizeHtmlContent } from '../validator/htmlSanitizer.js'
import { checkHtmlRules } from '../validator/ruleChecker.js'
import { htmlToPdf } from '../pdf/htmlToPdf.js'

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
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

const OPENAI_AUDIO_LIMIT = 25 * 1024 * 1024 // 25 MB

function splitAudioBuffer(buffer: Buffer, maxBytes = OPENAI_AUDIO_LIMIT): Buffer[] {
  const chunks: Buffer[] = []
  for (let i = 0; i < buffer.length; i += maxBytes) {
    chunks.push(buffer.subarray(i, i + maxBytes))
  }
  return chunks
}

async function transcribeAudio(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-pro' })
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Transcribe el siguiente audio en texto:' },
            { inlineData: { mimeType, data: buffer.toString('base64') } }
          ]
        }
      ]
    })
    return result.response?.text() || ''
  } catch (err) {
    console.warn('Gemini transcription failed:', (err as any)?.message)
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) throw err

    if (buffer.length > OPENAI_AUDIO_LIMIT) {
      throw new Error('El archivo de audio supera el límite de 25 MB para transcripción.')
    }

    const form = new FormData()
    const blob = new Blob([buffer], { type: mimeType })
    form.append('file', blob, 'audio')
    form.append('model', 'whisper-1')

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`OpenAI error ${res.status}: ${txt}`)
    }

    const data = (await res.json()) as any
    return String(data.text || '')
  }
}

async function transcribeAudioChunks(buffer: Buffer, mimeType: string): Promise<string> {
  if (buffer.length <= OPENAI_AUDIO_LIMIT) {
    return transcribeAudio(buffer, mimeType)
  }
  const parts = splitAudioBuffer(buffer, OPENAI_AUDIO_LIMIT)
  let result = ''
  for (const part of parts) {
    result += `${await transcribeAudio(part, mimeType)} `
  }
  return result.trim()
}

export async function procesarAudioMedMaster(buffer: Buffer, mimeType: string) {
  const rawText = await transcribeAudioChunks(buffer, mimeType)
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
    end_with_newline: true
  })
  const pdfBuffer = await htmlToPdf(prettyHtml)
  return { pdfBuffer, rawText, prettyHtml }
}
