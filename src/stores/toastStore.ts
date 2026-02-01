/**
 * Toast store for managing toast notifications
 * Pure state management - no timers here (timers are in useToast hook)
 */
import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Toast) => void
  removeToast: (id: string) => void
  reset: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, toast],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  reset: () => set({ toasts: [] }),
}))
