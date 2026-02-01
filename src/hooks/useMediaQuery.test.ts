/**
 * useMediaQuery hook tests
 * TDD: RED phase - Tests are written before implementation
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useMediaQuery } from './useMediaQuery'

describe('useMediaQuery', () => {
  // Store original matchMedia
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
    cleanup()
  })

  afterEach(() => {
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia
    cleanup()
  })

  describe('initial state', () => {
    it('should return true when media query initially matches', () => {
      // Arrange - Mock matchMedia to return matching result
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: true,
        media: '(min-width: 768px)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
      window.matchMedia = mockMatchMedia

      // Act
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

      // Assert
      expect(result.current).toBe(true)
      expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 768px)')
    })

    it('should return false when media query initially does not match', () => {
      // Arrange - Mock matchMedia to return non-matching result
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '(min-width: 1024px)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
      window.matchMedia = mockMatchMedia

      // Act
      const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))

      // Assert
      expect(result.current).toBe(false)
      expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 1024px)')
    })
  })

  describe('event listener registration', () => {
    it('should add change listener on mount', () => {
      // Arrange
      const mockAddEventListener = vi.fn()
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: true,
        media: '(min-width: 768px)',
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn(),
      })
      window.matchMedia = mockMatchMedia

      // Act
      renderHook(() => useMediaQuery('(min-width: 768px)'))

      // Assert
      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should remove change listener on unmount', () => {
      // Arrange
      const mockRemoveEventListener = vi.fn()
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: true,
        media: '(min-width: 768px)',
        addEventListener: vi.fn(),
        removeEventListener: mockRemoveEventListener,
      })
      window.matchMedia = mockMatchMedia

      // Act
      const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))
      unmount()

      // Assert
      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })

  describe('responsive state updates', () => {
    it('should update to true when media query starts matching', () => {
      // Arrange
      let changeListener: ((event: MediaQueryListEvent) => void) | null = null
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '(min-width: 768px)',
        addEventListener: (_event: string, listener: EventListener) => {
          changeListener = listener as ((event: MediaQueryListEvent) => void)
        },
        removeEventListener: vi.fn(),
      })
      window.matchMedia = mockMatchMedia

      // Act
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
      expect(result.current).toBe(false)

      // Simulate media query change to matching
      act(() => {
        changeListener?.(new MediaQueryListEvent('change', { matches: true, media: '(min-width: 768px)' }))
      })

      // Assert
      expect(result.current).toBe(true)
    })

    it('should update to false when media query stops matching', () => {
      // Arrange
      let changeListener: ((event: MediaQueryListEvent) => void) | null = null
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: true,
        media: '(min-width: 768px)',
        addEventListener: (_event: string, listener: EventListener) => {
          changeListener = listener as ((event: MediaQueryListEvent) => void)
        },
        removeEventListener: vi.fn(),
      })
      window.matchMedia = mockMatchMedia

      // Act
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
      expect(result.current).toBe(true)

      // Simulate media query change to not matching
      act(() => {
        changeListener?.(new MediaQueryListEvent('change', { matches: false, media: '(min-width: 768px)' }))
      })

      // Assert
      expect(result.current).toBe(false)
    })
  })

  describe('media query validation', () => {
    it('should accept valid media query strings', () => {
      // Arrange
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '(max-width: 640px)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
      window.matchMedia = mockMatchMedia

      // Act
      const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'))

      // Assert
      expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 640px)')
      expect(result.current).toBeDefined()
    })

    it('should handle complex media queries', () => {
      // Arrange
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: true,
        media: '(min-width: 768px) and (max-width: 1024px)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
      window.matchMedia = mockMatchMedia

      // Act
      const { result } = renderHook(() =>
        useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
      )

      // Assert
      expect(result.current).toBe(true)
    })
  })
})
