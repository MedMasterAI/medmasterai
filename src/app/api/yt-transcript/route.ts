import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import { promises as fsp } from 'fs'
import path from 'path'
import os from 'os'
import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'

export const runtime = 'nodejs'

function getId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
    return u.searchParams.get('v')
  } catch {
    return null
  }
}

async function fetchCaptions(id: string): Promise<string | null> {
  // Try the public youtubetranscript.com API first
  try {
    const ytRes = await fetch(`https://youtubetranscript.com/?server_vid2=${id}`)
    if (ytRes.ok) {
      const data = (await ytRes.json()) as any[]
      if (Array.isArray(data)) {
        const text = data
          .map((c: any) => c.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
        if (text) return text
      }
    }
  } catch (err) {
    console.warn('fetchCaptions yt API error:', (err as any)?.message)
  }

  // Fallback to ytdl-core method
  try {
    const info = await ytdl.getInfo(id)
    const tracks =
      info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks
    if (!tracks?.length) return null
    const track =
      tracks.find((t: any) => t.languageCode === 'es') || tracks[0]
    const res = await fetch(`${track.baseUrl}&fmt=vtt`)
    if (!res.ok) return null
    const vtt = await res.text()
    const text = vtt
      .split('\n')
      .filter(
        (l) =>
          l &&
          l.trim() !== 'WEBVTT' &&
          !l.includes('-->') &&
          !/^[0-9]+$/.test(l.trim())
      )
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    return text || null
  } catch (err) {
    console.warn('fetchCaptions error:', (err as any)?.message)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { videoUrl } = await req.json()
    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json({ error: 'URL invalida' }, { status: 400 })
    }
    const id = getId(videoUrl)
    if (!id) {
      return NextResponse.json({ error: 'URL invalida' }, { status: 400 })
    }

    const captions = await fetchCaptions(id)
    if (captions) {
      return new NextResponse(captions, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${id}.txt"`
        }
      })
    }
    console.warn('No captions found, using Whisper')

    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'yt-'))
    const inputPath = path.join(tmpDir, 'input.webm')
    const mp3Path = path.join(tmpDir, 'audio.mp3')
    try {
      await new Promise((resolve, reject) => {
        ytdl(videoUrl, { quality: 'highestaudio' })
          .pipe(fs.createWriteStream(inputPath))
          .on('finish', resolve)
          .on('error', reject)
      })

      ffmpeg.setFfmpegPath(ffmpegPath || '')
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .audioCodec('libmp3lame')
          .save(mp3Path)
          .on('end', resolve)
          .on('error', reject)
      })

      const audio = await fsp.readFile(mp3Path)
      const form = new FormData()
      form.append('file', new Blob([audio], { type: 'audio/mp3' }), 'audio.mp3')
      form.append('model', 'whisper-1')
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY
      if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing')
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
      const text = String(data.text || '')
      return new NextResponse(text, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${id}.txt"`
        }
      })
    } finally {
      await fsp.rm(tmpDir, { recursive: true, force: true })
    }
  } catch (err: any) {
    console.error('yt-transcript error', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
