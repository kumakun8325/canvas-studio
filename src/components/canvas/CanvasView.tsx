import { useEffect } from 'react'
import { useCanvas } from '../../hooks/useCanvas'

interface CanvasViewProps {
  slideId?: string
}

export function CanvasView(_: CanvasViewProps) {
  const { containerRef, deleteSelected } = useCanvas('main-canvas')

  // Delete key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't delete if editing text
        if (document.activeElement?.tagName === 'TEXTAREA') return
        deleteSelected()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelected])

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-100 flex items-center justify-center p-4"
    >
      <div className="shadow-lg">
        <canvas id="main-canvas" />
      </div>
    </div>
  )
}
