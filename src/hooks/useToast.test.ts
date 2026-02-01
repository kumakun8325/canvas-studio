/**
 * useToast hook tests
 */
import { renderHook, act } from '@testing-library/react'
import { useToast } from './useToast'
import { useToastStore } from '../stores/toastStore'

describe('useToast', () => {
  beforeEach(() => {
    // Reset store and timers before each test
    const { reset } = useToastStore.getState()
    reset()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('showToast', () => {
    it('should add a toast and auto-remove after duration', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.showToast({ type: 'success', message: 'Success!' })
      })

      let { toasts } = useToastStore.getState()
      expect(toasts).toHaveLength(1)

      // Fast forward 3 seconds (default for success)
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(0)
    })

    it('should use correct duration for each type', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => useToast())

      const durations: Record<string, number> = {
        success: 3000,
        info: 4000,
        error: 6000,
      }

      Object.entries(durations).forEach(([type, duration]) => {
        act(() => {
          result.current.showToast({
            type: type as 'success' | 'error' | 'info',
            message: `${type} message`,
          })
        })

        const { toasts } = useToastStore.getState()
        expect(toasts).toHaveLength(1)
        expect(toasts[0].type).toBe(type)

        // Should NOT be removed yet
        act(() => {
          vi.advanceTimersByTime(duration - 100)
        })

        const { toasts: toastsDuring } = useToastStore.getState()
        expect(toastsDuring).toHaveLength(1)

        // Should be removed after full duration
        act(() => {
          vi.advanceTimersByTime(100)
        })

        const { toasts: toastsAfter } = useToastStore.getState()
        expect(toastsAfter).toHaveLength(0)
      })
    })

    it('should generate unique id for each toast', () => {
      const { result } = renderHook(() => useToast())
      vi.useFakeTimers()

      act(() => {
        result.current.showToast({ type: 'success', message: 'First' })
        result.current.showToast({ type: 'error', message: 'Second' })
      })

      const { toasts } = useToastStore.getState()
      expect(toasts).toHaveLength(2)
      expect(toasts[0].id).not.toBe(toasts[1].id)
    })
  })

  describe('success, error, info convenience methods', () => {
    it('should provide convenience methods', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.success('Success message')
      })

      let { toasts } = useToastStore.getState()
      expect(toasts).toHaveLength(1)
      expect(toasts[0]).toEqual({
        id: toasts[0].id,
        type: 'success',
        message: 'Success message',
      })

      act(() => {
        result.current.error('Error message')
      })

      toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(2)
      expect(toasts[1].type).toBe('error')

      act(() => {
        result.current.info('Info message')
      })

      toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(3)
      expect(toasts[2].type).toBe('info')
    })
  })
})
