import '@testing-library/jest-dom'

// Vitest globals are declared in vitest.config.ts with globals: true

// Suppress fabric.js canvas element creation errors in jsdom environment
// These occur during cleanup when fabric tries to create cache canvases
const originalError = console.error
console.error = (...args: unknown[]) => {
  const message = args[0]
  if (typeof message === 'string' && message.includes('fabric: Failed to create `canvas` element')) {
    return
  }
  originalError.apply(console, args)
}

// Suppress unhandled errors from fabric/jsdom canvas creation
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message?.includes('fabric: Failed to create `canvas` element')) {
      event.preventDefault()
      return true
    }
  })
}

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
