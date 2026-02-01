/**
 * Toast component tests
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { Toast } from './Toast'
import { useToastStore } from '../../stores/toastStore'

describe('Toast', () => {
  beforeEach(() => {
    const { reset } = useToastStore.getState()
    reset()
  })

  it('should render nothing when no toasts', () => {
    const { container } = render(<Toast />)
    expect(container.firstChild).toBe(null)
  })

  it('should render toast notifications', () => {
    const { addToast } = useToastStore.getState()
    addToast({
      id: 'test-1',
      type: 'success',
      message: 'Success message',
    })

    render(<Toast />)

    expect(screen.getByText('Success message')).toBeInTheDocument()
  })

  it('should render multiple toasts', () => {
    const { addToast } = useToastStore.getState()
    addToast({
      id: 'test-1',
      type: 'success',
      message: 'First',
    })
    addToast({
      id: 'test-2',
      type: 'error',
      message: 'Second',
    })

    render(<Toast />)

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('should apply correct styles for each type', () => {
    const { addToast } = useToastStore.getState()
    addToast({
      id: 'test-1',
      type: 'success',
      message: 'Success',
    })
    addToast({
      id: 'test-2',
      type: 'error',
      message: 'Error',
    })
    addToast({
      id: 'test-3',
      type: 'info',
      message: 'Info',
    })

    render(<Toast />)

    const successEl = screen.getByText('Success').closest('div')
    const errorEl = screen.getByText('Error').closest('div')
    const infoEl = screen.getByText('Info').closest('div')

    // Check for color classes
    expect(successEl?.className).toContain('bg-green-500')
    expect(errorEl?.className).toContain('bg-red-500')
    expect(infoEl?.className).toContain('bg-blue-500')
  })

  it('should remove toast when close button clicked', () => {
    const { addToast } = useToastStore.getState()
    addToast({
      id: 'test-1',
      type: 'success',
      message: 'Success message',
    })

    render(<Toast />)

    const closeButton = screen.getByRole('button', { name: 'Close' })
    fireEvent.click(closeButton)

    const { toasts } = useToastStore.getState()
    expect(toasts).toHaveLength(0)
  })

  it('should render toasts in correct order (newest at bottom)', () => {
    const { addToast } = useToastStore.getState()
    addToast({
      id: 'test-1',
      type: 'success',
      message: 'First',
    })
    addToast({
      id: 'test-2',
      type: 'error',
      message: 'Second',
    })

    render(<Toast />)

    const toastElements = screen.getAllByRole('alert')
    expect(toastElements).toHaveLength(2)
    expect(toastElements[0]).toHaveTextContent('First')
    expect(toastElements[1]).toHaveTextContent('Second')
  })
})
