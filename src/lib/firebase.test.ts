/**
 * Firebase initialization tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore'
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage'

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(),
  getApp: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  connectAuthEmulator: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  connectFirestoreEmulator: vi.fn(),
}))

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  connectStorageEmulator: vi.fn(),
}))

describe('firebase', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    authDomain: 'test-auth-domain',
    projectId: 'test-project-id',
    storageBucket: 'test-storage-bucket',
    messagingSenderId: 'test-sender-id',
    appId: 'test-app-id',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment variables
    delete process.env.VITE_FIREBASE_API_KEY
    delete process.env.VITE_FIREBASE_AUTH_DOMAIN
    delete process.env.VITE_FIREBASE_PROJECT_ID
    delete process.env.VITE_FIREBASE_STORAGE_BUCKET
    delete process.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    delete process.env.VITE_FIREBASE_APP_ID
    delete process.env.VITE_FIREBASE_EMULATOR_HOST
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('initializeApp', () => {
    it('should initialize Firebase app with environment variables', async () => {
      // Setup
      process.env.VITE_FIREBASE_API_KEY = mockConfig.apiKey
      process.env.VITE_FIREBASE_AUTH_DOMAIN = mockConfig.authDomain
      process.env.VITE_FIREBASE_PROJECT_ID = mockConfig.projectId
      process.env.VITE_FIREBASE_STORAGE_BUCKET = mockConfig.storageBucket
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = mockConfig.messagingSenderId
      process.env.VITE_FIREBASE_APP_ID = mockConfig.appId

      const mockApp = { name: 'test-app' } as FirebaseApp
      vi.mocked(getApps).mockReturnValue([])
      vi.mocked(initializeApp).mockReturnValue(mockApp)

      // Test
      const { initFirebase } = await import('./firebase')
      const app = initFirebase()

      // Assert
      expect(initializeApp).toHaveBeenCalledWith({
        apiKey: mockConfig.apiKey,
        authDomain: mockConfig.authDomain,
        projectId: mockConfig.projectId,
        storageBucket: mockConfig.storageBucket,
        messagingSenderId: mockConfig.messagingSenderId,
        appId: mockConfig.appId,
      })
      expect(app).toBe(mockApp)
    })

    it('should reuse existing Firebase app if already initialized', async () => {
      // Setup
      process.env.VITE_FIREBASE_API_KEY = mockConfig.apiKey
      process.env.VITE_FIREBASE_AUTH_DOMAIN = mockConfig.authDomain
      process.env.VITE_FIREBASE_PROJECT_ID = mockConfig.projectId
      process.env.VITE_FIREBASE_STORAGE_BUCKET = mockConfig.storageBucket
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = mockConfig.messagingSenderId
      process.env.VITE_FIREBASE_APP_ID = mockConfig.appId

      const mockExistingApp = { name: 'existing-app' } as FirebaseApp
      vi.mocked(getApps).mockReturnValue([mockExistingApp])
      vi.mocked(getApp).mockReturnValue(mockExistingApp)

      // Test
      const { initFirebase } = await import('./firebase')
      const app = initFirebase()

      // Assert
      expect(initializeApp).not.toHaveBeenCalled()
      expect(getApp).toHaveBeenCalled()
      expect(app).toBe(mockExistingApp)
    })

    it('should throw error if required environment variables are missing', async () => {
      // Setup - missing all required variables
      vi.mocked(getApps).mockReturnValue([])

      // Test & Assert
      const { initFirebase } = await import('./firebase')
      expect(() => initFirebase()).toThrow()
    })
  })

  describe('getAuthInstance', () => {
    it('should export getAuthInstance function', async () => {
      // Setup
      process.env.VITE_FIREBASE_API_KEY = mockConfig.apiKey
      process.env.VITE_FIREBASE_AUTH_DOMAIN = mockConfig.authDomain
      process.env.VITE_FIREBASE_PROJECT_ID = mockConfig.projectId
      process.env.VITE_FIREBASE_STORAGE_BUCKET = mockConfig.storageBucket
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = mockConfig.messagingSenderId
      process.env.VITE_FIREBASE_APP_ID = mockConfig.appId

      const mockApp = { name: 'test-app' } as FirebaseApp
      const mockAuth = { currentUser: null } as Auth
      vi.mocked(getApps).mockReturnValue([])
      vi.mocked(initializeApp).mockReturnValue(mockApp)
      vi.mocked(getAuth).mockReturnValue(mockAuth)

      // Test
      const { getAuthInstance } = await import('./firebase')
      const auth = getAuthInstance()

      // Assert
      expect(auth).toBe(mockAuth)
    })
  })

  describe('getFirestoreInstance', () => {
    it('should export getFirestoreInstance function', async () => {
      // Setup
      process.env.VITE_FIREBASE_API_KEY = mockConfig.apiKey
      process.env.VITE_FIREBASE_AUTH_DOMAIN = mockConfig.authDomain
      process.env.VITE_FIREBASE_PROJECT_ID = mockConfig.projectId
      process.env.VITE_FIREBASE_STORAGE_BUCKET = mockConfig.storageBucket
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = mockConfig.messagingSenderId
      process.env.VITE_FIREBASE_APP_ID = mockConfig.appId

      const mockApp = { name: 'test-app' } as FirebaseApp
      const mockDb = { type: 'firestore' } as Firestore
      vi.mocked(getApps).mockReturnValue([])
      vi.mocked(initializeApp).mockReturnValue(mockApp)
      vi.mocked(getFirestore).mockReturnValue(mockDb)

      // Test
      const { getFirestoreInstance } = await import('./firebase')
      const db = getFirestoreInstance()

      // Assert
      expect(db).toBe(mockDb)
    })
  })

  describe('getStorageInstance', () => {
    it('should export getStorageInstance function', async () => {
      // Setup
      process.env.VITE_FIREBASE_API_KEY = mockConfig.apiKey
      process.env.VITE_FIREBASE_AUTH_DOMAIN = mockConfig.authDomain
      process.env.VITE_FIREBASE_PROJECT_ID = mockConfig.projectId
      process.env.VITE_FIREBASE_STORAGE_BUCKET = mockConfig.storageBucket
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = mockConfig.messagingSenderId
      process.env.VITE_FIREBASE_APP_ID = mockConfig.appId

      const mockApp = { name: 'test-app' } as FirebaseApp
      const mockStorage = {
        app: mockApp,
        maxOperationRetryTime: 0,
        maxUploadRetryTime: 0,
      } as FirebaseStorage
      vi.mocked(getApps).mockReturnValue([])
      vi.mocked(initializeApp).mockReturnValue(mockApp)
      vi.mocked(getStorage).mockReturnValue(mockStorage)

      // Test
      const { getStorageInstance } = await import('./firebase')
      const storage = getStorageInstance()

      // Assert
      expect(storage).toBe(mockStorage)
    })
  })

  describe('emulator connection', () => {
    it('should connect to emulators when VITE_FIREBASE_EMULATOR_HOST is set', async () => {
      // Setup
      process.env.VITE_FIREBASE_API_KEY = mockConfig.apiKey
      process.env.VITE_FIREBASE_AUTH_DOMAIN = mockConfig.authDomain
      process.env.VITE_FIREBASE_PROJECT_ID = mockConfig.projectId
      process.env.VITE_FIREBASE_STORAGE_BUCKET = mockConfig.storageBucket
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = mockConfig.messagingSenderId
      process.env.VITE_FIREBASE_APP_ID = mockConfig.appId
      process.env.VITE_FIREBASE_EMULATOR_HOST = 'localhost:9099'

      const mockApp = { name: 'test-app' } as FirebaseApp
      const mockAuth = { currentUser: null } as Auth
      const mockDb = { type: 'firestore' } as Firestore
      const mockStorage = {
        app: mockApp,
        maxOperationRetryTime: 0,
        maxUploadRetryTime: 0,
      } as FirebaseStorage

      vi.mocked(getApps).mockReturnValue([])
      vi.mocked(initializeApp).mockReturnValue(mockApp)
      vi.mocked(getAuth).mockReturnValue(mockAuth)
      vi.mocked(getFirestore).mockReturnValue(mockDb)
      vi.mocked(getStorage).mockReturnValue(mockStorage)

      // Test
      const { initFirebase } = await import('./firebase')
      initFirebase()

      // Assert
      expect(connectAuthEmulator).toHaveBeenCalledWith(mockAuth, 'http://localhost:9099', {
        disableWarnings: true,
      })
      expect(connectFirestoreEmulator).toHaveBeenCalledWith(mockDb, 'localhost', 8080)
      expect(connectStorageEmulator).toHaveBeenCalledWith(mockStorage, 'localhost', 9199)
    })
  })
})
