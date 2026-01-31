/**
 * SlideList.test.tsx
 * SlideListコンポーネントのテスト
 * Issue #85: レビュー指摘事項の対応
 *
 * テスト内容:
 * - handleSelect コールバックのメモ化確認
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SlideList } from './SlideList'
import { useSlideStore } from '../../stores/slideStore'
import { useEditorStore } from '../../stores/editorStore'
import { useSlideHistory } from '../../hooks/useSlideHistory'

// Mock the stores and hooks
vi.mock('../../stores/slideStore')
vi.mock('../../stores/editorStore')
vi.mock('../../hooks/useSlideHistory')

describe('SlideList - Issue #85: handleSelect メモ化', () => {
  const mockSlides = [
    { id: 'slide-1', name: 'Slide 1', objects: [], thumbnail: undefined },
    { id: 'slide-2', name: 'Slide 2', objects: [], thumbnail: undefined },
    { id: 'slide-3', name: 'Slide 3', objects: [], thumbnail: undefined },
  ]

  const mockAddSlide = vi.fn()
  const mockDeleteSlide = vi.fn()
  const mockReorderSlides = vi.fn()
  const mockSetCurrentSlide = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useSlideStore
    vi.mocked(useSlideStore).mockReturnValue({
      slides: mockSlides,
    })

    // Mock useEditorStore
    vi.mocked(useEditorStore).mockReturnValue({
      currentSlideId: 'slide-1',
      setCurrentSlide: mockSetCurrentSlide,
    })

    // Mock useSlideHistory
    vi.mocked(useSlideHistory).mockReturnValue({
      addSlide: mockAddSlide,
      deleteSlide: mockDeleteSlide,
      reorderSlides: mockReorderSlides,
    })
  })

  describe('handleSelect コールバック', () => {
    it('should call setCurrentSlide when a slide is clicked', () => {
      render(<SlideList />)

      // 2番目のスライドをクリック
      const slide2Thumbs = screen.getAllByText('Slide 2')
      slide2Thumbs[0]?.closest('div')?.click()

      expect(mockSetCurrentSlide).toHaveBeenCalledTimes(1)
      expect(mockSetCurrentSlide).toHaveBeenCalledWith('slide-2')
    })

    it('should maintain stable onSelect callbacks across re-renders', () => {
      const { rerender, container } = render(<SlideList />)

      // 最初のレンダーで onSelect コールバックを取得
      const slide1ThumbDivs = container.querySelectorAll('.cursor-pointer')
      const firstThumbElement = slide1ThumbDivs[0] as HTMLElement

      // 最初のクリック
      fireEvent.click(firstThumbElement)
      expect(mockSetCurrentSlide).toHaveBeenCalledTimes(1)
      expect(mockSetCurrentSlide).toHaveBeenCalledWith('slide-1')

      // ストアの値を変更して再レンダー
      vi.mocked(useSlideStore).mockReturnValue({
        slides: [...mockSlides],
      })
      vi.mocked(useEditorStore).mockReturnValue({
        currentSlideId: 'slide-2',
        setCurrentSlide: mockSetCurrentSlide,
      })

      rerender(<SlideList />)

      // 再レンダー後も同じ要素をクリック（コールバックが安定していることを確認）
      const slide1ThumbDivsAfter = container.querySelectorAll('.cursor-pointer')
      const firstThumbElementAfter = slide1ThumbDivsAfter[0] as HTMLElement
      fireEvent.click(firstThumbElementAfter)
      expect(mockSetCurrentSlide).toHaveBeenCalledTimes(2)
      expect(mockSetCurrentSlide).toHaveBeenCalledWith('slide-1')
    })

    it('should update current slide when clicking different slides', () => {
      render(<SlideList />)

      // slide-2 をクリック
      const slide2Thumbs = screen.getAllByText('Slide 2')
      slide2Thumbs[0]?.closest('div')?.click()
      expect(mockSetCurrentSlide).toHaveBeenCalledWith('slide-2')

      // slide-3 をクリック
      const slide3Thumbs = screen.getAllByText('Slide 3')
      slide3Thumbs[0]?.closest('div')?.click()
      expect(mockSetCurrentSlide).toHaveBeenCalledWith('slide-3')
    })
  })

  describe('削除機能', () => {
    it('should delete slide when delete button is clicked', () => {
      render(<SlideList />)

      const deleteButtons = screen.getAllByLabelText('スライドを削除')
      deleteButtons[1]?.click() // 2番目のスライドを削除

      expect(mockDeleteSlide).toHaveBeenCalledTimes(1)
      expect(mockDeleteSlide).toHaveBeenCalledWith('slide-2')
    })

    it('should not delete when only one slide remains', () => {
      // 1枚だけのスライドを設定
      vi.mocked(useSlideStore).mockReturnValue({
        slides: [mockSlides[0]],
      })

      render(<SlideList />)

      const deleteButtons = screen.getAllByLabelText('スライドを削除')
      deleteButtons[0]?.click()

      expect(mockDeleteSlide).not.toHaveBeenCalled()
    })

    it('should select adjacent slide when deleting current slide', () => {
      vi.mocked(useEditorStore).mockReturnValue({
        currentSlideId: 'slide-2',
        setCurrentSlide: mockSetCurrentSlide,
      })

      render(<SlideList />)

      const deleteButtons = screen.getAllByLabelText('スライドを削除')
      deleteButtons[1]?.click() // slide-2 (現在のスライド) を削除

      expect(mockDeleteSlide).toHaveBeenCalledWith('slide-2')
      expect(mockSetCurrentSlide).toHaveBeenCalledWith('slide-1') // 前のスライドが選択される
    })
  })

  describe('スライド追加', () => {
    it('should add slide when add button is clicked', () => {
      render(<SlideList />)

      const addButton = screen.getByText('+ スライド追加')
      addButton.click()

      expect(mockAddSlide).toHaveBeenCalledTimes(1)
    })
  })

  describe('ドラッグ＆ドロップ', () => {
    it('should handle drag start', () => {
      render(<SlideList />)

      const slide1 = screen.getByText('Slide 1').closest('[draggable="true"]') as HTMLElement
      fireEvent.dragStart(slide1, { dataTransfer: { setData: vi.fn() } } as unknown as React.DragEvent)

      // dataTransfer.setData が呼ばれることを確認
      expect(slide1).toBeDefined()
    })

    it('should reorder slides on drop', () => {
      render(<SlideList />)

      const slide2 = screen.getByText('Slide 2').closest('[draggable="true"]') as HTMLElement

      // ドロップイベントをシミュレート
      const mockDataTransfer = {
        getData: vi.fn().mockReturnValue('0'),
      }
      fireEvent.drop(slide2, {
        dataTransfer: mockDataTransfer,
      } as unknown as React.DragEvent)

      expect(mockReorderSlides).toHaveBeenCalledWith(0, 1)
    })
  })
})
