import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

// Mock useMediaQuery
const mockMediaMatches = vi.fn(() => false)
vi.mock('./useMediaQuery', () => ({
  useMediaQuery: () => mockMediaMatches(),
}))

// Mock editorStore
const mockSetDarkMode = vi.fn()
vi.mock('../stores/editorStore', () => ({
  useEditorStore: (selector: (state: { isDarkMode: boolean; setDarkMode: typeof mockSetDarkMode }) => unknown) =>
    selector({ isDarkMode: false, setDarkMode: mockSetDarkMode }),
}))

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    mockMediaMatches.mockReturnValue(false)
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark')
    localStorage.clear()
  })

  describe('initial state', () => {
    it('should default to system mode when no localStorage value', () => {
      const { result } = renderHook(() => useTheme())
      expect(result.current.themeMode).toBe('system')
    })

    it('should restore themeMode from localStorage', () => {
      localStorage.setItem('canvas-studio-theme', 'dark')
      const { result } = renderHook(() => useTheme())
      expect(result.current.themeMode).toBe('dark')
    })

    it('should fallback to system for invalid localStorage value', () => {
      localStorage.setItem('canvas-studio-theme', 'invalid-value')
      const { result } = renderHook(() => useTheme())
      expect(result.current.themeMode).toBe('system')
    })
  })

  describe('dark class on <html>', () => {
    it('should add dark class when mode is dark', () => {
      localStorage.setItem('canvas-studio-theme', 'dark')
      renderHook(() => useTheme())
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should remove dark class when mode is light', () => {
      document.documentElement.classList.add('dark')
      localStorage.setItem('canvas-studio-theme', 'light')
      renderHook(() => useTheme())
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should follow OS preference when mode is system', () => {
      mockMediaMatches.mockReturnValue(true)
      localStorage.setItem('canvas-studio-theme', 'system')
      renderHook(() => useTheme())
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(mockSetDarkMode).toHaveBeenCalledWith(true)
    })

    it('should not add dark class when system and OS prefers light', () => {
      mockMediaMatches.mockReturnValue(false)
      localStorage.setItem('canvas-studio-theme', 'system')
      renderHook(() => useTheme())
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('setThemeMode', () => {
    it('should persist to localStorage', () => {
      const { result } = renderHook(() => useTheme())
      act(() => {
        result.current.setThemeMode('dark')
      })
      expect(localStorage.getItem('canvas-studio-theme')).toBe('dark')
    })

    it('should update dark class when set to dark', () => {
      const { result } = renderHook(() => useTheme())
      act(() => {
        result.current.setThemeMode('dark')
      })
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should remove dark class when set to light', () => {
      document.documentElement.classList.add('dark')
      const { result } = renderHook(() => useTheme())
      act(() => {
        result.current.setThemeMode('light')
      })
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should sync isDarkMode to editorStore', () => {
      const { result } = renderHook(() => useTheme())
      act(() => {
        result.current.setThemeMode('dark')
      })
      expect(mockSetDarkMode).toHaveBeenCalledWith(true)
    })
  })

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      localStorage.setItem('canvas-studio-theme', 'light')
      const { result } = renderHook(() => useTheme())
      act(() => {
        result.current.toggleTheme()
      })
      expect(localStorage.getItem('canvas-studio-theme')).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should toggle from dark to light', () => {
      localStorage.setItem('canvas-studio-theme', 'dark')
      const { result } = renderHook(() => useTheme())
      act(() => {
        result.current.toggleTheme()
      })
      expect(localStorage.getItem('canvas-studio-theme')).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })
})
