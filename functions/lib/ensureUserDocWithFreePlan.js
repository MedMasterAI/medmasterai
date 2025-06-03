// Importa los módulos de Firestore desde Firebase Admin SDK
import { getFirestore, FieldValue } from "firebase-admin/firestore";
// No necesitamos importar 'app' aquí si ya inicializaste el Admin SDK en index.ts
// Asegura que el usuario tenga un doc en Firestore con plan "free"
export async function ensureUserDocWithFreePlan(uid, email) {
    // Obtén la instancia de Firestore desde la Admin SDK
    // Asumiendo que 'firebase-admin' ya se inicializó en tu 'index.ts'
    const db = getFirestore(); // No necesita 'app' como argumento con Admin SDK
    const userRef = db.collection("users").doc(uid); // Admin SDK usa .collection().doc()
    const userSnap = await userRef.get(); // Admin SDK usa .get() en la referencia del documento
    if (!userSnap.exists) { // La propiedad es .exists, no .exists()
        await userRef.set({
            plan: "free",
            planExpiresAt: null,
            email: email || "",
            createdAt: FieldValue.serverTimestamp(), // Usar serverTimestamp() para marcas de tiempo del servidor
        });
        return "created";
    }
    return "exists";
}
//# sourceMappingURL=ensureUserDocWithFreePlan.js.map