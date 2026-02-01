/**
 * useTheme hook tests
 */
import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../useTheme'
import { useEditorStore } from '../../stores/editorStore'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock matchMedia for theme detection
const mockMatchMedia = vi.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

describe('useTheme', () => {
  // Mock matchMedia to return prefers-color-scheme: light by default
  const defaultMediaQueryList = {
    matches: false,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    // Clear vi mocks
    vi.clearAllMocks()
    // Reset editor store
    useEditorStore.setState({ isDarkMode: false })
    // Reset document class
    document.documentElement.classList.remove('dark')
    // Mock matchMedia to return light mode by default
    mockMatchMedia.mockReturnValue(defaultMediaQueryList)
  })

  afterEach(() => {
    // Cleanup document classes
    document.documentElement.classList.remove('dark')
  })

  describe('初期状態', () => {
    it('localStorageが空の場合、systemモードで初期化され、OS設定（ライト）に追従する', () => {
      mockMatchMedia.mockReturnValue({ ...defaultMediaQueryList, matches: false })

      const { result } = renderHook(() => useTheme())

      expect(result.current.themeMode).toBe('system')
      expect(result.current.isDark).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(useEditorStore.getState().isDarkMode).toBe(false)
    })

    it('localStorageがdarkの場合、ダークモードで初期化される', () => {
      localStorage.setItem('canvas-studio-theme', 'dark')

      const { result } = renderHook(() => useTheme())

      expect(result.current.themeMode).toBe('dark')
      expect(result.current.isDark).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(useEditorStore.getState().isDarkMode).toBe(true)
    })

    it('localStorageがlightの場合、ライトモードで初期化される', () => {
      localStorage.setItem('canvas-studio-theme', 'light')

      const { result } = renderHook(() => useTheme())

      expect(result.current.themeMode).toBe('light')
      expect(result.current.isDark).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(useEditorStore.getState().isDarkMode).toBe(false)
    })

    it('localStorageに不正値がある場合、systemにフォールバックする', () => {
      localStorage.setItem('canvas-studio-theme', 'invalid')

      const { result } = renderHook(() => useTheme())

      expect(result.current.themeMode).toBe('system')
      expect(result.current.isDark).toBe(false)
    })
  })

  describe('systemモードでのOS設定追従', () => {
    it('OSがダークモードの場合、isDarkがtrueになる', () => {
      localStorage.setItem('canvas-studio-theme', 'system')
      mockMatchMedia.mockReturnValue({ ...defaultMediaQueryList, matches: true })

      const { result } = renderHook(() => useTheme())

      expect(result.current.themeMode).toBe('system')
      expect(result.current.isDark).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(useEditorStore.getState().isDarkMode).toBe(true)
    })

    it('OSがライトモードの場合、isDarkがfalseになる', () => {
      localStorage.setItem('canvas-studio-theme', 'system')
      mockMatchMedia.mockReturnValue({ ...defaultMediaQueryList, matches: false })

      const { result } = renderHook(() => useTheme())

      expect(result.current.themeMode).toBe('system')
      expect(result.current.isDark).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(useEditorStore.getState().isDarkMode).toBe(false)
    })
  })

  describe('setThemeMode', () => {
    it('setThemeMode("dark")でダークモードに切り替わる', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setThemeMode('dark')
      })

      expect(result.current.themeMode).toBe('dark')
      expect(result.current.isDark).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(useEditorStore.getState().isDarkMode).toBe(true)
      expect(localStorage.getItem('canvas-studio-theme')).toBe('dark')
    })

    it('setThemeMode("light")でライトモードに切り替わる', () => {
      // Start with dark mode
      localStorage.setItem('canvas-studio-theme', 'dark')
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setThemeMode('light')
      })

      expect(result.current.themeMode).toBe('light')
      expect(result.current.isDark).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(useEditorStore.getState().isDarkMode).toBe(false)
      expect(localStorage.getItem('canvas-studio-theme')).toBe('light')
    })

    it('setThemeMode("system")でシステム設定に戻る', () => {
      // Start with dark mode
      localStorage.setItem('canvas-studio-theme', 'dark')
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setThemeMode('system')
      })

      expect(result.current.themeMode).toBe('system')
      // OS is light mode by default in tests
      expect(result.current.isDark).toBe(false)
      expect(localStorage.getItem('canvas-studio-theme')).toBe('system')
    })
  })

  describe('toggleTheme', () => {
    it('ライトモードからダークモードに切り替わる', () => {
      const { result } = renderHook(() => useTheme())

      expect(result.current.isDark).toBe(false)

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.themeMode).toBe('dark')
      expect(result.current.isDark).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(useEditorStore.getState().isDarkMode).toBe(true)
    })

    it('ダークモードからライトモードに切り替わる', () => {
      localStorage.setItem('canvas-studio-theme', 'dark')
      const { result } = renderHook(() => useTheme())

      expect(result.current.isDark).toBe(true)

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.themeMode).toBe('light')
      expect(result.current.isDark).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(useEditorStore.getState().isDarkMode).toBe(false)
    })

    it('systemモード（ライトOS）からダークモードに切り替わる', () => {
      mockMatchMedia.mockReturnValue({ ...defaultMediaQueryList, matches: false })
      localStorage.setItem('canvas-studio-theme', 'system')
      const { result } = renderHook(() => useTheme())

      expect(result.current.isDark).toBe(false)

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.themeMode).toBe('dark')
      expect(result.current.isDark).toBe(true)
    })

    it('systemモード（ダークOS）からライトモードに切り替わる', () => {
      mockMatchMedia.mockReturnValue({ ...defaultMediaQueryList, matches: true })
      localStorage.setItem('canvas-studio-theme', 'system')
      const { result } = renderHook(() => useTheme())

      expect(result.current.isDark).toBe(true)

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.themeMode).toBe('light')
      expect(result.current.isDark).toBe(false)
    })
  })

  describe('document.documentElement.classList', () => {
    it('isDarkがtrueの時darkクラスが付与される', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setThemeMode('dark')
      })

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('isDarkがfalseの時darkクラスが除去される', () => {
      localStorage.setItem('canvas-studio-theme', 'dark')
      const { result } = renderHook(() => useTheme())

      // Initially has dark class
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      act(() => {
        result.current.setThemeMode('light')
      })

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('editorStore同期', () => {
    it('ダークモード設定がeditorStoreに同期される', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setThemeMode('dark')
      })

      expect(useEditorStore.getState().isDarkMode).toBe(true)

      act(() => {
        result.current.setThemeMode('light')
      })

      expect(useEditorStore.getState().isDarkMode).toBe(false)
    })
  })
})
