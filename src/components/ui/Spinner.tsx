/**
 * Unified Spinner component - Replaces all inline spinner implementations
 */
type SpinnerSize = 'small' | 'medium' | 'large'

interface SpinnerProps {
  size?: SpinnerSize
  message?: string
  showMessage?: boolean
  className?: string
}

const SIZE_MAP: Record<SpinnerSize, string> = {
  small: 'h-8 w-8 border-2',
  medium: 'h-12 w-12 border-2',
  large: 'h-16 w-16 border-3',
}

export function Spinner({
  size = 'medium',
  message = 'Loading...',
  showMessage = true,
  className = '',
}: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400 mx-auto ${SIZE_MAP[size]}`}
          role="status"
          aria-live="polite"
        >
          <span className="sr-only">{message}</span>
        </div>
        {showMessage && (
          <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>
        )}
      </div>
    </div>
  )
}
