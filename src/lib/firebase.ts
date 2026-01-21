/**
 * Firebase initialization and configuration
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore'
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

/**
 * Initialize Firebase app
 * @returns Firebase app instance
 */
export function initFirebase(): FirebaseApp {
  if (app) {
    return app
  }

  const apps = getApps()
  if (apps.length > 0) {
    app = getApp()
    return app
  }

  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase configuration is missing. Check your environment variables.')
  }

  app = initializeApp(firebaseConfig)

  const emulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST
  if (emulatorHost) {
    const authInstance = getAuth(app)
    const dbInstance = getFirestore(app)
    const storageInstance = getStorage(app)

    connectAuthEmulator(authInstance, `http://${emulatorHost}`, {
      disableWarnings: true,
    })
    connectFirestoreEmulator(dbInstance, 'localhost', 8080)
    connectStorageEmulator(storageInstance, 'localhost', 9199)
  }

  return app
}

/**
 * Get Firebase Auth instance
 * @returns Auth instance
 */
export function getAuthInstance(): Auth {
  if (!auth) {
    const firebaseApp = initFirebase()
    auth = getAuth(firebaseApp)
  }
  return auth
}

/**
 * Get Firestore instance
 * @returns Firestore instance
 */
export function getFirestoreInstance(): Firestore {
  if (!db) {
    const firebaseApp = initFirebase()
    db = getFirestore(firebaseApp)
  }
  return db
}

/**
 * Get Firebase Storage instance
 * @returns Storage instance
 */
export function getStorageInstance(): FirebaseStorage {
  if (!storage) {
    const firebaseApp = initFirebase()
    storage = getStorage(firebaseApp)
  }
  return storage
}

// Re-export Firebase functions for convenience
export { getAuth, getFirestore, getStorage }
