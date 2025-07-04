import 'dotenv/config'; // Load environment variables from .env file
import { google } from 'googleapis';
import * as functions from 'firebase-functions/v2';
import { Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { dbAdmin, storageAdmin } from "../firebase-admin.js"; // PONÉ .js si usás ES Modules y .ts si usás TS directo
const db = dbAdmin;
const storage = storageAdmin;

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const JOB_TOPIC = process.env.JOB_TOPIC || 'jobs';
const JOB_LIMIT = Number(process.env.JOBS_PER_MINUTE || '5');
const PROJECT_ID = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || '';

interface JobRequest {
  type: 'pdf' | 'video';
  filePath: string;
  [key: string]: any;
}


async function publishJob(jobId: string) {
  
  const auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = google.pubsub({ version: 'v1', auth });
  await client.projects.topics.publish({
    topic: `projects/${PROJECT_ID}/topics/${JOB_TOPIC}`,
    requestBody: {
      messages: [{ data: Buffer.from(JSON.stringify({ jobId })).toString('base64') }],
    },
  });
}

export const createJob = functions.https.onRequest(
  { memory: '2GiB', timeoutSeconds: 540, cpu: 2 },
  async (req: Request, res: Response): Promise<void> => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing token' });
      return;
    }
    try {
      const idToken = authHeader.split(' ')[1];
      const decoded = await getAuth().verifyIdToken(idToken);
      const uid = decoded.uid;
      const data = req.body as JobRequest;
      const userRef = db.collection('users').doc(uid);
      const snap = await userRef.get();
      let jobs: number[] = (snap.exists && snap.get('recentJobs')) || [];
      const now = Date.now();
      jobs = jobs.filter(ts => now - ts < 60000);
      if (jobs.length >= JOB_LIMIT) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }
      jobs.push(now);
      await userRef.set({ recentJobs: jobs }, { merge: true });
      const jobRef = db.collection('jobs').doc();
      await jobRef.set({
        userId: uid,
        status: 'queued',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        request: data,
      });
      await publishJob(jobRef.id);
      res.json({ jobId: jobRef.id });
      return;
    } catch (err: any) {
      console.error('createJob error', err);
      res.status(500).json({ error: 'internal' });
      return;
    }
  }
);

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
    // Placeholder: read file from Storage
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
    throw err; // trigger retry
  }
}

export const worker = functions.pubsub.onMessagePublished(
  { topic: JOB_TOPIC, memory: '2GiB', timeoutSeconds: 540, cpu: 2 },
  async event => {
    const payload = Buffer.from(event.data.message.data || '', 'base64').toString();
    const { jobId } = JSON.parse(payload) as { jobId: string };
    await processJob(jobId);
  }
);

export const getJobStatus = functions.https.onRequest(
  { memory: '1GiB', timeoutSeconds: 60 },
  async (req: Request, res: Response): Promise<void> => {
    const jobId = String(req.query.jobId || '');
    if (!jobId) {
      res.status(400).json({ error: 'jobId required' });
      return;
    }
    const doc = await db.collection('jobs').doc(jobId).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    const data = doc.data();
    res.json({ status: data?.status, updatedAt: data?.updatedAt, resultPath: data?.resultPath });
    return;
  }
);

export const downloadJobResult = functions.https.onRequest(
  { memory: '1GiB', timeoutSeconds: 60 },
  async (req: Request, res: Response): Promise<void> => {
    const jobId = String(req.query.jobId || '');
    if (!jobId) {
      res.status(400).json({ error: 'jobId required' });
      return;
    }
    const doc = await db.collection('jobs').doc(jobId).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    const data = doc.data() as any;
    if (data.status !== 'completed') {
      res.status(400).json({ error: 'not ready' });
      return;
    }
    const [url] = await storage.file(data.resultPath).getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000,
    });
    res.json({ url });
    return;
  }
);
