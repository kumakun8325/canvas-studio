import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'

// localStorage から安全に初期値を取得
function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system'

  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

interface ThemeStore {
  mode: ThemeMode
  resolved: 'light' | 'dark'

  setMode: (mode: ThemeMode) => void
  setResolved: (resolved: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: getInitialMode(),
  resolved: 'light',

  setMode: (mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', mode)
    }
    set({ mode })
  },

  setResolved: (resolved) => set({ resolved }),
}))
