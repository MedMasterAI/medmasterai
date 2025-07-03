import { dbAdmin } from './firebase-admin'

export type CreditType = 'pdf' | 'video'
export interface UserCredits {
  pdf: number
  video: number
}

export async function getUserCredits(uid: string): Promise<UserCredits> {
  const docRef = dbAdmin.collection('users').doc(uid)
  const snap = await docRef.get()
  const data = snap.data() || {}
  return {
    pdf: data.pdfCredits ?? 0,
    video: data.videoCredits ?? 0,
  }
}

export async function consumeCredit(uid: string, type: CreditType): Promise<UserCredits> {
  const userRef = dbAdmin.collection('users').doc(uid)
  let updated: UserCredits = { pdf: 0, video: 0 }
  await dbAdmin.runTransaction(async (tx) => {
    const snap = await tx.get(userRef)
    const data = snap.data() || {}
    const credits: UserCredits = {
      pdf: data.pdfCredits ?? 0,
      video: data.videoCredits ?? 0,
    }
    if (credits[type] <= 0) {
      throw new Error('Sin créditos disponibles')
    }
    credits[type] -= 1
    tx.set(userRef, {
      pdfCredits: credits.pdf,
      videoCredits: credits.video,
    }, { merge: true })
    updated = credits
  })
  return updated
}
