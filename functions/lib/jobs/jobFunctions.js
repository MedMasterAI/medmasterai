import 'dotenv/config'; // Load environment variables from .env file
import { google } from 'googleapis';
import * as functions from 'firebase-functions/v2';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { dbAdmin, storageAdmin } from "../firebase-admin.js"; // PONÉ .js si usás ES Modules y .ts si usás TS directo
import { callGemini, callOpenAI } from '../utils/apiWrappers.js';
const db = dbAdmin;
const storage = storageAdmin;
const JOB_TOPIC = process.env.JOB_TOPIC || 'jobs';
const JOB_LIMIT = Number(process.env.JOBS_PER_MINUTE || '5');
const PROJECT_ID = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || '';
async function publishJob(jobId) {
    const auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = google.pubsub({ version: 'v1', auth });
    await client.projects.topics.publish({
        topic: `projects/${PROJECT_ID}/topics/${JOB_TOPIC}`,
        requestBody: {
            messages: [{ data: Buffer.from(JSON.stringify({ jobId })).toString('base64') }],
        },
    });
}
export const createJob = functions.https.onRequest({ memory: '2GiB', timeoutSeconds: 540, cpu: 2 }, async (req, res) => {
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
        const data = req.body;
        const userRef = db.collection('users').doc(uid);
        const snap = await userRef.get();
        let jobs = (snap.exists && snap.get('recentJobs')) || [];
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
    }
    catch (err) {
        console.error('createJob error', err);
        res.status(500).json({ error: 'internal' });
        return;
    }
});
async function processJob(jobId) {
    const jobRef = db.collection('jobs').doc(jobId);
    const snap = await jobRef.get();
    if (!snap.exists)
        throw new Error('Job not found');
    const job = snap.data();
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
    }
    catch (err) {
        console.error('worker error', err);
        await jobRef.update({ status: 'failed', updatedAt: FieldValue.serverTimestamp(), error: String(err) });
        throw err; // trigger retry
    }
}
export const worker = functions.pubsub.onMessagePublished({ topic: JOB_TOPIC, memory: '2GiB', timeoutSeconds: 540, cpu: 2 }, async (event) => {
    const payload = Buffer.from(event.data.message.data || '', 'base64').toString();
    const { jobId } = JSON.parse(payload);
    await processJob(jobId);
});
export const getJobStatus = functions.https.onRequest({ memory: '1GiB', timeoutSeconds: 60 }, async (req, res) => {
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
});
export const downloadJobResult = functions.https.onRequest({ memory: '1GiB', timeoutSeconds: 60 }, async (req, res) => {
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
});
const JOB_RETENTION_DAYS = Number(process.env.JOB_RETENTION_DAYS || '30');
export const cleanupOldJobs = functions.pubsub.schedule('every 24 hours').onRun(async () => {
    const cutoff = Date.now() - JOB_RETENTION_DAYS * 86400000;
    const query = db
        .collection('jobs')
        .where('status', 'in', ['completed', 'failed'])
        .where('updatedAt', '<', new Date(cutoff));
    const snap = await query.get();
    for (const doc of snap.docs) {
        const data = doc.data();
        if (data.resultPath) {
            try {
                await storage.file(data.resultPath).delete();
            }
            catch (err) {
                console.error('cleanupOldJobs delete', err);
            }
        }
        await doc.ref.delete();
    }
});
//# sourceMappingURL=jobFunctions.js.map