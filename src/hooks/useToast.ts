/**
 * useToast hook for managing toast notifications with auto-dismiss
 * Timer management is handled here (store is pure)
 */
import { useCallback } from 'react'
import { useToastStore, type ToastType } from '../stores/toastStore'

// Auto-dismiss duration by toast type (ms)
const DURATION_MAP: Record<ToastType, number> = {
  success: 3000,
  info: 4000,
  error: 6000,
}

interface ToastOptions {
  type: ToastType
  message: string
  duration?: number
}

interface UseToastReturn {
  showToast: (options: ToastOptions) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

export function useToast(): UseToastReturn {
  const { addToast, removeToast } = useToastStore()

  const showToast = useCallback(
    ({ type, message, duration }: ToastOptions) => {
      const id = crypto.randomUUID()
      const dismissDuration = duration ?? DURATION_MAP[type]

      addToast({ id, type, message })

      // Auto-dismiss after duration
      setTimeout(() => {
        removeToast(id)
      }, dismissDuration)
    },
    [addToast, removeToast]
  )

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'success', message, duration })
    },
    [showToast]
  )

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'error', message, duration })
    },
    [showToast]
  )

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast({ type: 'info', message, duration })
    },
    [showToast]
  )

  return { showToast, success, error, info }
}
