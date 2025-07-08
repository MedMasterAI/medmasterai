import crypto from 'crypto'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { dbAdmin, storageAdmin } from '../firebase-admin.js'
import { getThrottler } from './throttler.js'

const API_CACHE_TTL_DAYS = Number(process.env.API_CACHE_TTL_DAYS || '30')

const geminiThrottle = getThrottler('gemini', Number(process.env.GEMINI_TPS || '1'))
const openAIThrottle = getThrottler('openai', Number(process.env.OPENAI_TPS || '1'))

function hashKey(obj: any): string {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex')
}

async function backoff<T>(fn: () => Promise<T>, retries = 5, base = 500): Promise<T> {
  let attempt = 0
  while (true) {
    try {
      return await fn()
    } catch (err) {
      attempt++
      if (attempt > retries) throw err
      await new Promise(r => setTimeout(r, base * 2 ** (attempt - 1)))
    }
  }
}

async function getCached(service: string, key: string): Promise<any | null> {
  const ref = dbAdmin.collection('apiCache').doc(`${service}_${key}`)
  const snap = await ref.get()
  if (!snap.exists) return null
  const data = snap.data() as any
  if (data.expireAt && data.expireAt.toMillis && data.expireAt.toMillis() < Date.now()) {
    // expired entry
    return null
  }
  if (data.response) return JSON.parse(data.response)
  if (data.storagePath) {
    const [buf] = await storageAdmin.file(data.storagePath).download()
    return JSON.parse(buf.toString('utf8'))
  }
  return null
}

async function setCached(service: string, key: string, value: any): Promise<void> {
  const ref = dbAdmin.collection('apiCache').doc(`${service}_${key}`)
  const str = JSON.stringify(value)
  const expireAt = Timestamp.fromMillis(Date.now() + API_CACHE_TTL_DAYS * 86400000)
  if (Buffer.byteLength(str, 'utf8') < 900000) {
    await ref.set({ response: str, createdAt: FieldValue.serverTimestamp(), expireAt })
  } else {
    const path = `apiCache/${service}/${key}.json`
    await storageAdmin.file(path).save(str)
    await ref.set({ storagePath: path, createdAt: FieldValue.serverTimestamp(), expireAt })
  }
}

export async function callDumplingAI(params: {
  videoUrl: string
  includeTimestamps: boolean
  timestampsToCombine: number
  preferredLanguage: string
}): Promise<any> {
  const key = hashKey(params)
  const cached = await getCached('dumpling', key)
  if (cached) return cached
  const fn = async () => {
    const res = await fetch('https://app.dumplingai.com/api/v1/get-youtube-transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DUMPLING_API_KEY}`
      },
      body: JSON.stringify(params)
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Dumpling AI error ${res.status}: ${txt}`)
    }
    return res.json()
  }
  const result = await backoff(fn)
  await setCached('dumpling', key, result)
  return result
}

export async function callGemini(prompt: string, model = process.env.MODEL_GEMINI || 'gemini-pro'): Promise<string> {
  const key = hashKey({ prompt, model })
  const cached = await getCached('gemini', key)
  if (cached) return cached
  await geminiThrottle.acquire()
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  const fn = async () => {
    const m = ai.getGenerativeModel({ model })
    const resp = await m.generateContent(prompt)
    const txt = resp.response?.text()
    if (!txt) throw new Error('No text from Gemini')
    return txt
  }
  const result = await backoff(fn)
  await setCached('gemini', key, result)
  return result
}

export async function callOpenAI(prompt: string): Promise<string> {
  const key = hashKey({ prompt })
  const cached = await getCached('openai', key)
  if (cached) return cached
  await openAIThrottle.acquire()
  const fn = async () => {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }]
      })
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`OpenAI error ${res.status}: ${txt}`)
    }
    const data = await res.json() as any
    return data.choices?.[0]?.message?.content as string
  }
  const result = await backoff(fn)
  await setCached('openai', key, result)
  return result
}
