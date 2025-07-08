import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { storageAdmin } from '../firebase-admin.js'

export const deleteApiCacheFile = onDocumentDeleted('apiCache/{docId}', async (event) => {
  const data = event.data?.data() as any
  const path = data?.storagePath
  if (path) {
    try {
      await storageAdmin.file(path).delete()
    } catch (err) {
      console.error('deleteApiCacheFile', err)
    }
  }
});
