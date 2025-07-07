import fs from 'fs'
import { promises as fsp } from 'fs'
import path from 'path'
import os from 'os'
import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import fetch from 'node-fetch'
import FormData from 'form-data'

async function main() {
  const videoUrl = process.argv[2]
  if (!videoUrl) {
    console.error('Usage: node scripts/transcribe-youtube.js <youtube-url>')
    process.exit(1)
  }

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
    form.append('file', audio, { filename: 'audio.mp3', contentType: 'audio/mp3' })
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

    const data = await res.json()
    const text = String(data.text || '')
    const output = path.join(process.cwd(), 'transcription.txt')
    await fsp.writeFile(output, text, 'utf8')
    console.log(`Transcription saved to ${output}`)
  } finally {
    await fsp.rm(tmpDir, { recursive: true, force: true })
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})