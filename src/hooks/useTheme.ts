import { useEffect, useCallback } from 'react'
import { useMediaQuery } from './useMediaQuery'
import { useEditorStore } from '../stores/editorStore'
import type { ThemeMode } from '../types'

const STORAGE_KEY = 'canvas-studio-theme'

interface UseThemeReturn {
  isDark: boolean
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

function getStoredThemeMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isValidThemeMode(stored) ? stored : 'system'
}

export function useTheme(): UseThemeReturn {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const isDarkMode = useEditorStore((state) => state.isDarkMode)
  const setDarkMode = useEditorStore((state) => state.setDarkMode)

  const themeMode = getStoredThemeMode()

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && prefersDark)

  // Sync dark class on <html> and update store
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    setDarkMode(isDark)
  }, [isDark, setDarkMode])

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      localStorage.setItem(STORAGE_KEY, mode)
      const newIsDark =
        mode === 'dark' || (mode === 'system' && prefersDark)
      const root = document.documentElement
      if (newIsDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      setDarkMode(newIsDark)
    },
    [prefersDark, setDarkMode]
  )

  const toggleTheme = useCallback(() => {
    const newMode: ThemeMode = isDark ? 'light' : 'dark'
    setThemeMode(newMode)
  }, [isDark, setThemeMode])

  return { isDark: isDarkMode, themeMode, setThemeMode, toggleTheme }
}
