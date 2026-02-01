/**
 * toastStore tests
 */
import { renderHook, act } from '@testing-library/react'
import { useToastStore } from './toastStore'

describe('toastStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { reset } = useToastStore.getState()
    reset()
  })

  describe('addToast', () => {
    it('should add a toast to the store', () => {
      const { result } = renderHook(() => useToastStore())

      act(() => {
        result.current.addToast({
          id: 'test-1',
          type: 'success',
          message: 'Success message',
        })
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0]).toEqual({
        id: 'test-1',
        type: 'success',
        message: 'Success message',
      })
    })

    it('should add multiple toasts', () => {
      const { result } = renderHook(() => useToastStore())

      act(() => {
        result.current.addToast({
          id: 'test-1',
          type: 'success',
          message: 'First',
        })
        result.current.addToast({
          id: 'test-2',
          type: 'error',
          message: 'Second',
        })
      })

      expect(result.current.toasts).toHaveLength(2)
    })
  })

  describe('removeToast', () => {
    it('should remove a toast by id', () => {
      const { result } = renderHook(() => useToastStore())

      act(() => {
        result.current.addToast({
          id: 'test-1',
          type: 'success',
          message: 'Success',
        })
        result.current.addToast({
          id: 'test-2',
          type: 'error',
          message: 'Error',
        })
      })

      expect(result.current.toasts).toHaveLength(2)

      act(() => {
        result.current.removeToast('test-1')
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].id).toBe('test-2')
    })

    it('should handle removing non-existent toast', () => {
      const { result } = renderHook(() => useToastStore())

      act(() => {
        result.current.removeToast('non-existent')
      })

      expect(result.current.toasts).toHaveLength(0)
    })
  })

  describe('reset', () => {
    it('should clear all toasts', () => {
      const { result } = renderHook(() => useToastStore())

      act(() => {
        result.current.addToast({
          id: 'test-1',
          type: 'success',
          message: 'Success',
        })
        result.current.addToast({
          id: 'test-2',
          type: 'error',
          message: 'Error',
        })
      })

      expect(result.current.toasts).toHaveLength(2)

      act(() => {
        result.current.reset()
      })

      expect(result.current.toasts).toHaveLength(0)
    })
  })
})
