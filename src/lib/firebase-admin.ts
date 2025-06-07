import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";

function loadServiceAccount() {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }

  const customPath =
    process.env.FIREBASE_ADMIN_SDK_PATH ||
    fs
      .readdirSync(path.join(process.cwd(), "src", "lib"))
      .find((f) =>
        /^frontedwebmedmaster-firebase-adminsdk-fbsvc-.*\.json$/.test(f)
      );

  if (!customPath) {
    throw new Error(
      "Firebase Admin credentials not found. Set env vars or place the service account JSON in src/lib/."
    );
  }

  const credentialPath = path.isAbsolute(customPath)
    ? customPath
    : path.join(process.cwd(), "src", "lib", customPath);
  const raw = fs.readFileSync(credentialPath, "utf8");
  return JSON.parse(raw);
}

const serviceAccount = loadServiceAccount();

const adminConfig = {
  credential: cert(serviceAccount as any),
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || serviceAccount.storageBucket,
};

export const adminApp: App =
  !getApps().length ? initializeApp(adminConfig) : getApp();
export const dbAdmin = getFirestore(adminApp);
export const storageAdmin = getStorage(adminApp);

