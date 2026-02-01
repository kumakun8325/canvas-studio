import { useState, useEffect } from 'react'
import { useMediaQuery } from './useMediaQuery'
import { useEditorStore } from '../stores/editorStore'
import type { ThemeMode } from '../types'

const STORAGE_KEY = 'canvas-studio-theme'

function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

function getStoredThemeMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isValidThemeMode(stored) ? stored : 'system'
}

interface UseThemeReturn {
  isDark: boolean
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

export function useTheme(): UseThemeReturn {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredThemeMode)
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const setDarkMode = useEditorStore(state => state.setDarkMode)

  const isDark = themeMode === 'dark' || (themeMode === 'system' && prefersDark)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    setDarkMode(isDark)
  }, [isDark, setDarkMode])

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode)
    localStorage.setItem(STORAGE_KEY, mode)
  }

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark')
  }

  return { isDark, themeMode, setThemeMode, toggleTheme }
}
