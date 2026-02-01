/**
 * Spinner component tests
 */
import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('should render spinner element', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('should use default size when not specified', () => {
    const { container } = render(<Spinner />)
    const spinnerDiv = container.querySelector('.animate-spin')
    expect(spinnerDiv?.className).toContain('h-12 w-12')
  })

  it('should use small size when size is "small"', () => {
    const { container } = render(<Spinner size="small" />)
    const spinnerDiv = container.querySelector('.animate-spin')
    expect(spinnerDiv?.className).toContain('h-8 w-8')
  })

  it('should use large size when size is "large"', () => {
    const { container } = render(<Spinner size="large" />)
    const spinnerDiv = container.querySelector('.animate-spin')
    expect(spinnerDiv?.className).toContain('h-16 w-16')
  })

  it('should render visible message when not specified', () => {
    render(<Spinner />)
    const messages = screen.getAllByText('Loading...')
    const visibleMessage = messages.find((el) => !el.classList.contains('sr-only'))
    expect(visibleMessage?.tagName).toBe('P')
  })

  it('should render custom message when provided', () => {
    render(<Spinner message="読み込み中..." />)
    // Get all elements with the text and find the non-sr-only one
    const messages = screen.getAllByText('読み込み中...')
    const visibleMessage = messages.find((el) => !el.classList.contains('sr-only'))
    expect(visibleMessage?.tagName).toBe('P')
  })

  it('should not render visible message when showMessage is false', () => {
    render(<Spinner showMessage={false} />)
    screen.queryByText('Loading...')
    // Should only have sr-only version, not visible
    const srOnly = screen.getByText('Loading...')
    expect(srOnly).toHaveClass('sr-only')
  })

  it('should include screen reader text', () => {
    render(<Spinner />)
    const srOnlyTexts = screen.getAllByText('Loading...')
    const srOnly = srOnlyTexts.find((el) => el.classList.contains('sr-only'))
    expect(srOnly).toBeInTheDocument()
  })
})
