// src/lib/logger.ts
import { dbAdmin } from './firebase-admin'

/**
 * Registra acciones para auditoría en Firestore.
 * Si ocurre un error, simplemente se loguea por consola.
 */
export async function logAction(action: string, details: any) {
  try {
    await dbAdmin.collection('logs').add({
      action,
      details,
      timestamp: new Date(),
    })
  } catch (err) {
    console.error('Failed to log action', err)
  }
}
