import { useCallback } from 'react'
import { SlideThumb } from './SlideThumb'
import { useSlideStore } from '../../stores/slideStore'
import { useEditorStore } from '../../stores/editorStore'
import { useSlideHistory } from '../../hooks/useSlideHistory'

/**
 * スライド一覧サイドバーコンポーネント
 * スライドの追加、削除、選択、並べ替え機能を提供
 */
export function SlideList() {
  const { slides } = useSlideStore()
  const { addSlide, deleteSlide, reorderSlides } = useSlideHistory()
  const { currentSlideId, setCurrentSlide } = useEditorStore()

  const handleDelete = useCallback(
    (slideId: string) => {
      if (slides.length <= 1) return

      if (slideId === currentSlideId) {
        const index = slides.findIndex((s) => s.id === slideId)
        const newIndex = index > 0 ? index - 1 : 1
        setCurrentSlide(slides[newIndex].id)
      }

      deleteSlide(slideId)
    },
    [slides, currentSlideId, setCurrentSlide, deleteSlide]
  )

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('slideIndex', String(index))
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      const fromIndex = Number(e.dataTransfer.getData('slideIndex'))
      if (fromIndex !== toIndex) {
        reorderSlides(fromIndex, toIndex)
      }
    },
    [reorderSlides]
  )

  return (
    <div className="shrink-0 w-52 min-w-52 bg-gray-50 border-r p-2 overflow-y-auto">
      <div className="flex flex-col gap-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
          >
            <SlideThumb
              slideId={slide.id}
              index={index}
              isActive={slide.id === currentSlideId}
              thumbnail={slide.thumbnail}
              onSelect={() => setCurrentSlide(slide.id)}
              onDelete={() => handleDelete(slide.id)}
            />
          </div>
        ))}
      </div>

      {/* スライド追加ボタン */}
      <button
        onClick={addSlide}
        className="w-full mt-2 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + スライド追加
      </button>
    </div>
  )
}
