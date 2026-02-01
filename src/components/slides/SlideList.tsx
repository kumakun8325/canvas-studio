import { useCallback } from 'react'
import { SlideThumb } from './SlideThumb'
import { useSlideStore } from '../../stores/slideStore'
import { useEditorStore } from '../../stores/editorStore'
import { useSlideHistory } from '../../hooks/useSlideHistory'

/**
 * スライド一覧サイドバーコンポーネント
 * スライドの追加、削除、選択、並べ替え機能を提供
 * レスポンシブ対応: タブレットでは幅が縮小、パネル開閉状態に対応
 */
export function SlideList() {
  // Issue #87: Zustand selector optimization for performance
  // セレクタパターンを使用して、必要なデータのみを購読し、不要な再レンダリングを防ぐ
  const slides = useSlideStore((state) => state.slides)
  const currentSlideId = useEditorStore((state) => state.currentSlideId)
  const setCurrentSlide = useEditorStore((state) => state.setCurrentSlide)
  const isSlideListOpen = useEditorStore((state) => state.isSlideListOpen)

  const { addSlide, deleteSlide, reorderSlides } = useSlideHistory()

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

  // パネルが閉じている場合は非表示
  if (!isSlideListOpen) {
    return null
  }

  return (
    <div className="shrink-0 w-40 lg:w-52 min-w-40 lg:min-w-52 bg-gray-50 border-r p-2 overflow-y-auto">
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
        className="w-full mt-2 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors text-sm"
      >
        + 追加
      </button>
    </div>
  )
}
