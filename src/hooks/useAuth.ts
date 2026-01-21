/**
 * useAuth hook - Manages Firebase authentication state
 */
import { useState, useEffect, useCallback } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth'
import { getAuthInstance } from '../lib/firebase'

export interface AuthState {
  user: FirebaseUser | null
  loading: boolean
  error: Error | null
}

export function useAuth(): AuthState & {
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
} {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const auth = getAuthInstance()

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user)
        setLoading(false)
        setError(null)
      },
      (error) => {
        setError(error as Error)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setError(null)
    try {
      const auth = getAuthInstance()
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    setError(null)
    try {
      const auth = getAuthInstance()
      await signOut(auth)
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut: handleSignOut,
  }
}
