import { NextRequest, NextResponse } from 'next/server'
import { html as beautifyHtml } from 'js-beautify'
import { pdfExtract } from '@lib/ingesta/pdfExtractPdfReader'
import { generarEsquemaJSON } from '@lib/structura/generarEsquemaJSON'
import { generarHTMLMedMaster } from '@lib/html/generarHTMLMedMaster'
import { sanitizeHtmlContent } from '@lib/validator/htmlSanitizer'
import { checkHtmlRules } from '@lib/validator/ruleChecker'
import { htmlToPdf } from '@lib/pdf/htmlToPdf'
import { consumeCredit } from '@/lib/credits'
import { slugify, extractTitle } from '@lib/utils/slugify'

export const runtime = 'nodejs'
// Cantidad de tokens objetivo por chunk de entrada
const CHUNK_TOKEN_SIZE = 5000

/**
 * Divide un texto en fragmentos aproximados de maxTokens tokens
 * usando un ratio de ~4 caracteres por token y preferencia por oraciones.
 */
function chunkTextByTokens(text: string, maxTokens = CHUNK_TOKEN_SIZE): string[] {
  const maxChars = maxTokens * 4
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = Math.min(text.length, start + maxChars)
    let slice = text.slice(start, end)

    // Si no es el último bloque, intenta cortar al final de la última oración
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const uid = formData.get('uid')
    if (typeof uid !== 'string' || !uid) {
      return NextResponse.json({ error: 'UID requerido' }, { status: 400 })
    }

  let rawText: string

  // 1️⃣ YouTube → Transcripción interna
  const videoUrl = formData.get('videoUrl')
  if (typeof videoUrl === 'string' && videoUrl.trim()) {
    await consumeCredit(uid, 'video')
    const transcriptRes = await fetch(new URL('/api/yt-transcript', request.nextUrl.origin), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: videoUrl.trim() })
    })
    if (!transcriptRes.ok) {
      const err = await transcriptRes.json().catch(() => ({ error: transcriptRes.statusText }))
      return NextResponse.json(
        { error: err.error || transcriptRes.statusText },
        { status: transcriptRes.status }
      )
    }
    rawText = await transcriptRes.text()
  } else {
      // 2️⃣ PDF → texto plano
      const file = formData.get('file')
      if (!file || typeof file === 'string') {
        return NextResponse.json(
          { error: 'Envía un PDF o una URL de YouTube.' },
          { status: 400 }
        )
      }
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { error: `Tipo no permitido: ${file.type}` },
          { status: 415 }
        )
      }
      await consumeCredit(uid, 'pdf')
      const buffer = Buffer.from(await file.arrayBuffer())
      rawText = await pdfExtract(buffer)
    }

    // 3️⃣ Chunking del texto en trozos manejables
    const bloques = chunkTextByTokens(rawText, CHUNK_TOKEN_SIZE)

    // 4️⃣ Generar HTML parcial por cada chunk y acumular
    const htmlFragments: string[] = []
    for (let i = 0; i < bloques.length; i++) {
      const texto = bloques[i]
      // 4.1) Generar esquema JSON de este chunk
      const esquemaParcial = await generarEsquemaJSON(texto)
      // 4.2) Generar HTML de este esquema
      const htmlParcial = await generarHTMLMedMaster(esquemaParcial)
      htmlFragments.push(htmlParcial)
    }

    // 5️⃣ Concatenar todos los HTML parciales
    const fullHtml = htmlFragments.join('\n\n')

    // 6️⃣ Sanitizar y validar reglas
    const cleanHtml = sanitizeHtmlContent(fullHtml)
    checkHtmlRules(cleanHtml)

    // 7️⃣ Beautify al estilo Gemini
    const prettyHtml = beautifyHtml(cleanHtml, {
      indent_size: 2,
      wrap_line_length: 0,
      preserve_newlines: true,
      max_preserve_newlines: 2,
      end_with_newline: true
    })

    const title = extractTitle(prettyHtml) || 'Apunte-MedMaster'
    const fileSlug = slugify(title)

    // 8️⃣ Convertir a PDF y devolver
    const pdfBuffer = await htmlToPdf(prettyHtml)
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileSlug}.pdf"`,
        'Content-Length': String(pdfBuffer.length)
      }
    })

  } catch (err: any) {
    console.error('❌ Error en /api/generar:', err)
    const status = err.message === 'Sin créditos disponibles' ? 402 : 500
    return NextResponse.json(
      { error: err.message || 'Error interno' },
      { status }
    )
  }
}
