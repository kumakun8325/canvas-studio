import { useEffect } from 'react'
import { CanvasView } from '../components/canvas/CanvasView'
import { Toolbar } from '../components/canvas/Toolbar'
import { useCanvas } from '../hooks/useCanvas'
import { useSlideStore } from '../stores/slideStore'
import { useEditorStore } from '../stores/editorStore'

export function Editor() {
  const { slides } = useSlideStore()
  const { currentSlideId, setCurrentSlide } = useEditorStore()
  const { addRect, addCircle, addText } = useCanvas('main-canvas')

  // Set initial slide
  useEffect(() => {
    if (slides.length > 0 && !currentSlideId) {
      setCurrentSlide(slides[0].id)
    }
  }, [slides, currentSlideId, setCurrentSlide])

  return (
    <div className="h-screen flex flex-col">
      <Toolbar onAddRect={addRect} onAddCircle={addCircle} onAddText={addText} />
      <CanvasView slideId={currentSlideId ?? undefined} />
    </div>
  )
}
