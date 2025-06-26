import { NextRequest, NextResponse } from 'next/server'
import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { GoogleGenAI } from '@google/genai'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { videoUrl } = await req.json()
    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json({ error: 'URL invalida' }, { status: 400 })
    }

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'yt-'))
    const inputPath = path.join(tmpDir, 'input.webm')
    const mp3Path = path.join(tmpDir, 'audio.mp3')

    try {
      await new Promise((resolve, reject) => {
        ytdl(videoUrl, { quality: 'highestaudio' })
          .pipe(fs.createWriteStream(inputPath))
          .on('finish', resolve)
          .on('error', reject)
      })

      ffmpeg.setFfmpegPath(ffmpegPath.path)
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .audioCodec('libmp3lame')
          .save(mp3Path)
          .on('end', resolve)
          .on('error', reject)
      })

      const audio = await fs.readFile(mp3Path)
      const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! })
      const result = await ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Transcribe el siguiente audio en texto:' },
              { inlineData: { mimeType: 'audio/mp3', data: audio.toString('base64') } }
            ]
          }
        ]
      })

      const transcript = result.text || ''
      return NextResponse.json({ transcript })
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true })
    }
  } catch (err: any) {
    console.error('audioai error', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
