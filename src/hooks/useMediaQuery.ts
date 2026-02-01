import { useState, useEffect } from 'react'

/**
 * メディアクエリを監視するフック
 *
 * @param query - メディアクエリ文字列 (例: "(min-width: 768px)")
 * @returns メディアクエリに一致するかどうか
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery('(min-width: 1024px)')
 * const isTablet = useMediaQuery('(min-width: 768px)')
 * const isMobile = useMediaQuery('(max-width: 767px)')
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches)

    // 現在の値を設定（初期化時の不一致を防ぐ）
    setMatches(mediaQuery.matches)

    // イベントリスナーを追加
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}
