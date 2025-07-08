import * as functions from 'firebase-functions'
import { storageAdmin } from '../firebase-admin.js'

export const deleteApiCacheFile = functions.firestore
  .document('apiCache/{docId}')
  .onDelete(async snapshot => {
    const data = snapshot.data() as any
    const path = data?.storagePath
    if (path) {
      try {
        await storageAdmin.file(path).delete()
      } catch (err) {
        console.error('deleteApiCacheFile', err)
      }
    }
  })
