import 'dotenv/config';
import express, { Request, Response } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.PROJECT_ID,
      clientEmail: process.env.CLIENT_EMAIL,
      privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.STORAGE_BUCKET,
  });
}

const db = getFirestore(getApp());
const storage = getStorage(getApp()).bucket();
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function callGemini(prompt: string) {
  const model = ai.getGenerativeModel({ model: process.env.MODEL_GEMINI || 'gemini-pro' });
  const response = await model.generateContent(prompt);
  return response.response?.text();
}

async function callOpenAI(prompt: string) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const data = (await res.json()) as any;
  return data.choices?.[0]?.message?.content as string;
}

async function processJob(jobId: string) {
  const jobRef = db.collection('jobs').doc(jobId);
  const snap = await jobRef.get();
  if (!snap.exists) throw new Error('Job not found');
  const job = snap.data() as any;
  await jobRef.update({ status: 'processing', updatedAt: FieldValue.serverTimestamp() });
  try {
    const file = storage.file(job.request.filePath);
    const [buffer] = await file.download();
    const prompt = buffer.toString().slice(0, 1000);
    let result = await callGemini(prompt);
    if (!result) {
      console.warn('Gemini falló, usando OpenAI');
      result = await callOpenAI(prompt);
    }
    const outFile = storage.file(`jobs/${jobId}/result.txt`);
    await outFile.save(result);
    await jobRef.update({
      status: 'completed',
      updatedAt: FieldValue.serverTimestamp(),
      resultPath: outFile.name,
    });
  } catch (err: any) {
    console.error('worker error', err);
    await jobRef.update({ status: 'failed', updatedAt: FieldValue.serverTimestamp(), error: String(err) });
    throw err;
  }
}

const app = express();
app.use(express.json());

app.post('/', async (req: Request, res: Response) => {
  const encoded = req.body?.message?.data;
  if (!encoded) {
    res.status(400).json({ error: 'No message data' });
    return;
  }
  try {
    const payload = Buffer.from(encoded, 'base64').toString();
    const { jobId } = JSON.parse(payload) as { jobId: string };
    await processJob(jobId);
    res.status(204).end();
  } catch (err: any) {
    console.error('processJob failed', err);
    res.status(500).json({ error: err.message || 'internal' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Job worker listening on port ${PORT}`);
});
