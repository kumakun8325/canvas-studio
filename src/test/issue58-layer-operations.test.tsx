/**
 * Issue #58: レイヤー操作のバグ修正と履歴記録追加
 *
 * TDDアプローチ:
 * 1. sendToBack/bringToFront/bringForward/sendBackwards のバグを再現
 * 2. 履歴記録（Undo/Redo）が動作しない問題を再現
 * 3. 正しい実装を作成
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useHistoryStore } from '../stores/historyStore'
import { useSlideStore } from '../stores/slideStore'
import { useEditorStore } from '../stores/editorStore'
import { useHistory } from '../hooks/useHistory'

describe('Issue #58: レイヤー操作のバグと履歴記録', () => {
  beforeEach(() => {
    // Reset all stores before each test
    useHistoryStore.getState().clear()
    useSlideStore.setState({
      project: null,
      slides: [],
    })
    useEditorStore.setState({
      currentSlideId: null,
      selectedObjectIds: [],
      activeTool: 'select',
      zoom: 1,
    })
  })

  describe('履歴記録のテスト（bringToFront/sendToBack）', () => {
    it('should record history when bringToFront is called', () => {
      const { result } = renderHook(() => useHistory())
      const slideId = 'slide-1'

      // 初期状態: 3つの矩形（rect1が最背面、rect3が最前面）
      const initialJson = JSON.stringify({
        version: '6.0.0',
        objects: [
          { id: 'rect1', type: 'rect', left: 0, top: 0, fill: '#ff0000' },
          { id: 'rect2', type: 'rect', left: 50, top: 50, fill: '#00ff00' },
          { id: 'rect3', type: 'rect', left: 100, top: 100, fill: '#0000ff' },
        ],
      })

      // rect1を最前面に移動した後の状態
      const afterBringToFrontJson = JSON.stringify({
        version: '6.0.0',
        objects: [
          { id: 'rect2', type: 'rect', left: 50, top: 50, fill: '#00ff00' },
          { id: 'rect3', type: 'rect', left: 100, top: 100, fill: '#0000ff' },
          { id: 'rect1', type: 'rect', left: 0, top: 0, fill: '#ff0000' },
        ],
      })

      useSlideStore.setState({
        slides: [
          {
            id: slideId,
            canvasJson: initialJson,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      })
      useEditorStore.setState({ currentSlideId: slideId })

      // Act: bringToFront操作の履歴を記録
      act(() => {
        result.current.recordAction({
          type: 'layer:bringToFront',
          description: '最前面に移動',
          undo: () => {
            useSlideStore.getState().updateSlide(slideId, initialJson)
          },
          redo: () => {
            useSlideStore.getState().updateSlide(slideId, afterBringToFrontJson)
          },
        })
      })

      // 操作後の状態に更新
      act(() => {
        useSlideStore.getState().updateSlide(slideId, afterBringToFrontJson)
      })

      // 履歴が記録されていることを確認
      const undoStack = useHistoryStore.getState().undoStack
      expect(undoStack).toHaveLength(1)
      expect(undoStack[0].description).toBe('最前面に移動')

      // Undoを実行
      act(() => {
        result.current.undo()
      })

      // Assert: Undo後は初期状態に戻っている
      const slide = useSlideStore.getState().slides.find((s) => s.id === slideId)
      expect(slide?.canvasJson).toBe(initialJson)

      // Redoを実行
      act(() => {
        result.current.redo()
      })

      // Assert: Redo後は操作後の状態に戻っている
      const slideAfterRedo = useSlideStore.getState().slides.find((s) => s.id === slideId)
      expect(slideAfterRedo?.canvasJson).toBe(afterBringToFrontJson)
    })

    it('should record history when sendToBack is called', () => {
      const { result } = renderHook(() => useHistory())
      const slideId = 'slide-1'

      // 初期状態: 3つの矩形（rect1が最背面、rect3が最前面）
      const initialJson = JSON.stringify({
        version: '6.0.0',
        objects: [
          { id: 'rect1', type: 'rect', left: 0, top: 0, fill: '#ff0000' },
          { id: 'rect2', type: 'rect', left: 50, top: 50, fill: '#00ff00' },
          { id: 'rect3', type: 'rect', left: 100, top: 100, fill: '#0000ff' },
        ],
      })

      // rect3を最背面に移動した後の状態
      const afterSendToBackJson = JSON.stringify({
        version: '6.0.0',
        objects: [
          { id: 'rect3', type: 'rect', left: 100, top: 100, fill: '#0000ff' },
          { id: 'rect1', type: 'rect', left: 0, top: 0, fill: '#ff0000' },
          { id: 'rect2', type: 'rect', left: 50, top: 50, fill: '#00ff00' },
        ],
      })

      useSlideStore.setState({
        slides: [
          {
            id: slideId,
            canvasJson: initialJson,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      })
      useEditorStore.setState({ currentSlideId: slideId })

      // Act: sendToBack操作の履歴を記録
      act(() => {
        result.current.recordAction({
          type: 'layer:sendToBack',
          description: '最背面に移動',
          undo: () => {
            useSlideStore.getState().updateSlide(slideId, initialJson)
          },
          redo: () => {
            useSlideStore.getState().updateSlide(slideId, afterSendToBackJson)
          },
        })
      })

      // 操作後の状態に更新
      act(() => {
        useSlideStore.getState().updateSlide(slideId, afterSendToBackJson)
      })

      // 履歴が記録されていることを確認
      const undoStack = useHistoryStore.getState().undoStack
      expect(undoStack).toHaveLength(1)
      expect(undoStack[0].description).toBe('最背面に移動')

      // Undoを実行
      act(() => {
        result.current.undo()
      })

      // Assert: Undo後は初期状態に戻っている
      const slide = useSlideStore.getState().slides.find((s) => s.id === slideId)
      expect(slide?.canvasJson).toBe(initialJson)
    })

    it('should record history when bringForward is called', () => {
      const { result } = renderHook(() => useHistory())
      const slideId = 'slide-1'

      // 初期状態
      const initialJson = JSON.stringify({
        version: '6.0.0',
        objects: [
          { id: 'rect1', type: 'rect', left: 0, top: 0, fill: '#ff0000' },
          { id: 'rect2', type: 'rect', left: 50, top: 50, fill: '#00ff00' },
          { id: 'rect3', type: 'rect', left: 100, top: 100, fill: '#0000ff' },
        ],
      })

      // rect1を1つ前面に移動した後の状態
      const afterBringForwardJson = JSON.stringify({
        version: '6.0.0',
        objects: [
          { id: 'rect2', type: 'rect', left: 50, top: 50, fill: '#00ff00' },
          { id: 'rect1', type: 'rect', left: 0, top: 0, fill: '#ff0000' },
          { id: 'rect3', type: 'rect', left: 100, top: 100, fill: '#0000ff' },
        ],
      })

      useSlideStore.setState({
        slides: [
          {
            id: slideId,
            canvasJson: initialJson,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      })
      useEditorStore.setState({ currentSlideId: slideId })

      // Act: bringForward操作の履歴を記録
      act(() => {
        result.current.recordAction({
          type: 'layer:bringForward',
          description: '1つ前面に移動',
          undo: () => {
            useSlideStore.getState().updateSlide(slideId, initialJson)
          },
          redo: () => {
            useSlideStore.getState().updateSlide(slideId, afterBringForwardJson)
          },
        })
      })

      // 操作後の状態に更新
      act(() => {
        useSlideStore.getState().updateSlide(slideId, afterBringForwardJson)
      })

      // 履歴が記録されていることを確認
      const undoStack = useHistoryStore.getState().undoStack
      expect(undoStack).toHaveLength(1)

      // Undoを実行
      act(() => {
        result.current.undo()
      })

      // Assert: Undo後は初期状態に戻っている
      const slide = useSlideStore.getState().slides.find((s) => s.id === slideId)
      expect(slide?.canvasJson).toBe(initialJson)
    })

    it('should record history when sendBackwards is called', () => {
      const { result } = renderHook(() => useHistory())
      const slideId = 'slide-1'

      // 初期状態
      const initialJson = JSON.stringify({
        version: '6.0.0',
        objects: [
          { id: 'rect1', type: 'rect', left: 0, top: 0, fill: '#ff0000' },
          { id: 'rect2', type: 'rect', left: 50, top: 50, fill: '#00ff00' },
          { id: 'rect3', type: 'rect', left: 100, top: 100, fill: '#0000ff' },
        ],
      })

      // rect3を1つ背面に移動した後の状態
      const afterSendBackwardsJson = JSON.stringify({
        version: '6.0.0',
        objects: [
          { id: 'rect1', type: 'rect', left: 0, top: 0, fill: '#ff0000' },
          { id: 'rect3', type: 'rect', left: 100, top: 100, fill: '#0000ff' },
          { id: 'rect2', type: 'rect', left: 50, top: 50, fill: '#00ff00' },
        ],
      })

      useSlideStore.setState({
        slides: [
          {
            id: slideId,
            canvasJson: initialJson,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      })
      useEditorStore.setState({ currentSlideId: slideId })

      // Act: sendBackwards操作の履歴を記録
      act(() => {
        result.current.recordAction({
          type: 'layer:sendBackwards',
          description: '1つ背面に移動',
          undo: () => {
            useSlideStore.getState().updateSlide(slideId, initialJson)
          },
          redo: () => {
            useSlideStore.getState().updateSlide(slideId, afterSendBackwardsJson)
          },
        })
      })

      // 操作後の状態に更新
      act(() => {
        useSlideStore.getState().updateSlide(slideId, afterSendBackwardsJson)
      })

      // 履歴が記録されていることを確認
      const undoStack = useHistoryStore.getState().undoStack
      expect(undoStack).toHaveLength(1)

      // Undoを実行
      act(() => {
        result.current.undo()
      })

      // Assert: Undo後は初期状態に戻っている
      const slide = useSlideStore.getState().slides.find((s) => s.id === slideId)
      expect(slide?.canvasJson).toBe(initialJson)
    })
  })
})
