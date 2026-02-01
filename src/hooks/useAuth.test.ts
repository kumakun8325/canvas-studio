/**
 * useAuth hook tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type NextOrObserver,
  type User,
  type UserCredential,
} from 'firebase/auth'
import { useAuth } from './useAuth'

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn().mockImplementation(() => ({
    providerId: 'google.com',
  })),
}))

// Mock Firebase module
vi.mock('../lib/firebase', () => ({
  getAuthInstance: vi.fn(() => ({
    currentUser: null,
  })),
}))

const invokeAuthCallback = (
  callback: NextOrObserver<User> | null,
  user: User | null
) => {
  if (!callback) {
    return
  }
  if (typeof callback === 'function') {
    callback(user)
    return
  }
  callback.next?.(user)
}

describe('useAuth', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    emailVerified: true,
    isAnonymous: false,
    providerData: [],
    refreshToken: 'refresh-token',
    tenantId: null,
    metadata: {},
    phoneNumber: null,
    providerId: 'google.com',
    toJSON: vi.fn(),
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    linkWithPopup: vi.fn(),
    linkWithRedirect: vi.fn(),
    reauthenticateWithPopup: vi.fn(),
    reauthenticateWithRedirect: vi.fn(),
    reload: vi.fn(),
    sendEmailVerification: vi.fn(),
    unlink: vi.fn(),
    updateEmail: vi.fn(),
    updatePassword: vi.fn(),
    updatePhoneNumber: vi.fn(),
    updateProfile: vi.fn(),
    verifyBeforeUpdateEmail: vi.fn(),
  } as User

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('initial state', () => {
    it('should return initial loading state', () => {
      // Setup
      vi.mocked(onAuthStateChanged).mockImplementation((_auth, _callback) => {
        return () => {} // Unsubscribe function
      })

      // Test
      const { result } = renderHook(() => useAuth())

      // Assert
      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('onAuthStateChanged', () => {
    it('should set user when authenticated', async () => {
      // Setup
      let authCallback: NextOrObserver<User> | null = null
      vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
        authCallback = callback
        return () => {}
      })

      // Test
      const { result } = renderHook(() => useAuth())

      // Simulate authentication
      await act(async () => {
        invokeAuthCallback(authCallback, mockUser)
      })

      // Assert
      await waitFor(() => {
        expect(result.current.user).toBe(mockUser)
        expect(result.current.loading).toBe(false)
      })
    })

    it('should clear user when signed out', async () => {
      // Setup
      let authCallback: NextOrObserver<User> | null = null
      vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
        authCallback = callback
        return () => {}
      })

      // Test
      const { result } = renderHook(() => useAuth())

      // Simulate authentication
      await act(async () => {
        invokeAuthCallback(authCallback, mockUser)
      })

      await waitFor(() => {
        expect(result.current.user).toBe(mockUser)
      })

      // Simulate sign out
      await act(async () => {
        invokeAuthCallback(authCallback, null)
      })

      // Assert
      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle auth state change errors', async () => {
      // Setup
      const mockError = new Error('Auth error')
      vi.mocked(onAuthStateChanged).mockImplementation((_auth, _callback, errorCallback) => {
        if (errorCallback) {
          errorCallback(mockError)
        }
        return () => {}
      })

      // Test
      const { result } = renderHook(() => useAuth())

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe(mockError)
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('signInWithGoogle', () => {
    it('should sign in with Google provider', async () => {
      // Setup
      vi.mocked(onAuthStateChanged).mockImplementation(() => {
        return () => {}
      })
      const mockCredential: UserCredential = {
        user: mockUser,
        providerId: 'google.com',
        operationType: 'signIn',
      }
      vi.mocked(signInWithPopup).mockResolvedValue(mockCredential)

      // Test
      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signInWithGoogle()
      })

      // Assert
      expect(signInWithPopup).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Object)
      )
    })

    it('should set error when sign in fails', async () => {
      // Setup
      const mockError = new Error('Sign in failed')
      vi.mocked(onAuthStateChanged).mockImplementation(() => {
        return () => {}
      })
      vi.mocked(signInWithPopup).mockRejectedValue(mockError)

      // Test
      const { result } = renderHook(() => useAuth())

      // Act - call signInWithGoogle which should catch the error
      await act(async () => {
        try {
          await result.current.signInWithGoogle()
        } catch {
          // The hook throws the error after setting it
        }
      })

      // Assert - error should be set in state
      await waitFor(() => {
        expect(result.current.error).toBe(mockError)
      })
    })
  })

  describe('signOut', () => {
    it('should sign out user', async () => {
      // Setup
      vi.mocked(onAuthStateChanged).mockImplementation(() => {
        return () => {}
      })
      vi.mocked(signOut).mockResolvedValue(undefined)

      // Test
      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signOut()
      })

      // Assert
      expect(signOut).toHaveBeenCalled()
    })

    it('should set error when sign out fails', async () => {
      // Setup
      const mockError = new Error('Sign out failed')
      vi.mocked(onAuthStateChanged).mockImplementation(() => {
        return () => {}
      })
      vi.mocked(signOut).mockRejectedValue(mockError)

      // Test
      const { result } = renderHook(() => useAuth())

      // Act - call signOut which should catch the error
      await act(async () => {
        try {
          await result.current.signOut()
        } catch {
          // The hook throws the error after setting it
        }
      })

      // Assert - error should be set in state
      await waitFor(() => {
        expect(result.current.error).toBe(mockError)
      })
    })
  })

  describe('cleanup', () => {
    it('should unsubscribe from auth state changes on unmount', () => {
      // Setup
      const unsubscribe = vi.fn()
      vi.mocked(onAuthStateChanged).mockReturnValue(unsubscribe)

      // Test
      const { unmount } = renderHook(() => useAuth())

      // Assert
      expect(unsubscribe).not.toHaveBeenCalled()

      unmount()

      expect(unsubscribe).toHaveBeenCalled()
    })
  })
})
