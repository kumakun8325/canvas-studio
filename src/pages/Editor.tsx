import { useEffect } from 'react'
import { CanvasView } from '../components/canvas/CanvasView'
import { Toolbar } from '../components/canvas/Toolbar'
import { useSlideStore } from '../stores/slideStore'
import { useEditorStore } from '../stores/editorStore'

export function Editor() {
  const { slides } = useSlideStore()
  const { currentSlideId, setCurrentSlide } = useEditorStore()

  // Set initial slide
  useEffect(() => {
    if (slides.length > 0 && !currentSlideId) {
      setCurrentSlide(slides[0].id)
    }
  }, [slides, currentSlideId, setCurrentSlide])

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <CanvasView slideId={currentSlideId ?? undefined} />
    </div>
  )
}
