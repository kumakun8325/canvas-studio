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

// Polyfill MediaQueryListEvent for jsdom environment
// jsdom does not provide this constructor by default
if (typeof window !== 'undefined' && !window.MediaQueryListEvent) {
  window.MediaQueryListEvent = class MediaQueryListEvent extends Event {
    matches: boolean
    media: string

    constructor(type: string, eventInitDict: { matches: boolean; media: string }) {
      super(type)
      this.matches = eventInitDict.matches
      this.media = eventInitDict.media
    }
  } as any
}
