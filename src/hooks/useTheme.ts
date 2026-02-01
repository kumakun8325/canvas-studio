import { useEffect } from 'react'
import { useThemeStore } from '../stores/themeStore'

/**
 * テーマ管理 Hook
 *
 * 注意: この Hook は App.tsx で1回だけ実行すること。
 * ThemeToggle などの子コンポーネントでは useThemeStore を直接使用する。
 */
export function useTheme() {
  const mode = useThemeStore((state) => state.mode)
  const setResolved = useThemeStore((state) => state.setResolved)

  useEffect(() => {
    const root = document.documentElement

    function applyTheme(dark: boolean) {
      if (dark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      setResolved(dark ? 'dark' : 'light')
    }

    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mq.matches)
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }

    applyTheme(mode === 'dark')
  }, [mode, setResolved])

  return null // 副作用のみで返り値不要
}
