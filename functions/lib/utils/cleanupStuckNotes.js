import { getFirestore, FieldValue } from "firebase-admin/firestore";
/**
 * Limpia notas estancadas en status "pending" o "processing" por más de 15 minutos
 */
export async function cleanupStuckNotes(uid) {
    const db = getFirestore();
    const THRESHOLD_MINUTES = 15;
    const now = Date.now();
    const notesSnap = await db
        .collection("users")
        .doc(uid)
        .collection("notes")
        .where("status", "in", ["pending", "processing"])
        .get();
    const batch = db.batch();
    let cleaned = 0;
    notesSnap.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toMillis?.() || 0;
        const ageMinutes = (now - createdAt) / 60000;
        if (ageMinutes > THRESHOLD_MINUTES) {
            batch.update(doc.ref, { status: "failed" });
            cleaned++;
        }
    });
    if (cleaned > 0) {
        await batch.commit();
        await db.collection("users").doc(uid).update({
            activeNoteCount: FieldValue.increment(-cleaned),
        });
    }
    return cleaned;
}
//# sourceMappingURL=cleanupStuckNotes.js.map