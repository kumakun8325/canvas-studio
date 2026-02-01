import { useState, useEffect } from 'react'

/**
 * メディアクエリを監視するカスタムフック
 *
 * @param query - CSSメディアクエリ文字列 (例: '(min-width: 768px)')
 * @returns メディアクエリにマッチしているかどうか
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery('(min-width: 1024px)')
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

    // 初期値を設定
    setMatches(mediaQuery.matches)

    // 変更リスナーを登録
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // 現代的なaddEventListenerを使用（addListenerは非推奨）
    mediaQuery.addEventListener('change', handleChange)

    // クリーンアップ時にリスナーを解除
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}
