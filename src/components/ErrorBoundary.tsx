/**
 * ErrorBoundary - Catches React errors and displays user-friendly message
 * Class component (cannot use hooks)
 */
import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for debugging
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 text-center">
              {/* Error icon */}
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Error message */}
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                エラーが発生しました
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                予期しないエラーが発生しました。ページをリロードしてください。
              </p>

              {/* Reload button */}
              <button
                onClick={this.handleReload}
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                ページをリロード
              </button>

              {/* Show error details in development */}
              {isDev && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                    エラー詳細 (開発モード)
                  </summary>
                  <div className="mt-2 p-4 bg-red-50 dark:bg-red-950 rounded-lg overflow-auto max-h-48">
                    <p className="text-sm font-mono text-red-800 mb-2">
                      {this.state.error.message}
                    </p>
                    <pre className="text-xs font-mono text-red-700 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
