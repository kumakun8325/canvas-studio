/**
 * ConfirmDialog component tests
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        title="Test"
        message="Test message"
        onConfirm={() => {}}
      />
    )
    expect(container.firstChild).toBe(null)
  })

  it('should render dialog when isOpen is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={() => {}}
      />
    )

    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('should call onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        onConfirm={onConfirm}
      />
    )

    const confirmButton = screen.getByRole('button', { name: '確認' })
    fireEvent.click(confirmButton)

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when cancel button clicked', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    )

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
    fireEvent.click(cancelButton)

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should use default button labels when not provided', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        onConfirm={() => {}}
      />
    )

    expect(screen.getByRole('button', { name: '確認' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
  })

  it('should use custom button labels when provided', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        onConfirm={() => {}}
        confirmLabel="削除"
        cancelLabel="やめる"
      />
    )

    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'やめる' })).toBeInTheDocument()
  })

  it('should apply danger style when isDanger is true', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete"
        message="Are you sure?"
        onConfirm={() => {}}
        isDanger={true}
      />
    )

    const confirmButton = screen.getByRole('button', { name: '確認' })
    expect(confirmButton.className).toContain('bg-red-500')
  })

  it('should not apply danger style when isDanger is false', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        message="Are you sure?"
        onConfirm={() => {}}
        isDanger={false}
      />
    )

    const confirmButton = screen.getByRole('button', { name: '確認' })
    expect(confirmButton.className).toContain('bg-blue-500')
  })
})
