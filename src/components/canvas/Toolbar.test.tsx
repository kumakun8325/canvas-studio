/**
 * Toolbar.test.tsx
 * Toolbarコンポーネントのテスト
 * Issue #75: ツールバーの↑↑↓↓ボタンの機能が不明瞭・UIの改善が必要
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toolbar } from './Toolbar'
import { useEditorStore } from '../../stores/editorStore'

// Mock the useEditorStore
vi.mock('../../stores/editorStore')

describe('Toolbar - Issue #75: レイヤー操作ボタンのUI改善', () => {
  const mockCanvasActions = {
    addRect: vi.fn(),
    addCircle: vi.fn(),
    addText: vi.fn(),
    addImage: vi.fn(),
    bringToFront: vi.fn(),
    sendToBack: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock useEditorStore
    vi.mocked(useEditorStore).mockReturnValue({
      activeTool: 'select',
      setActiveTool: vi.fn(),
    })
  })

  describe('レイヤー操作ボタン', () => {
    it('should render bringToFront button with descriptive tooltip', () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const bringToFrontButton = screen.getByTitle('最前面に移動')
      expect(bringToFrontButton).toBeDefined()
      expect(bringToFrontButton).toHaveTextContent('⬆️')
    })

    it('should render sendToBack button with descriptive tooltip', () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const sendToBackButton = screen.getByTitle('最背面に移動')
      expect(sendToBackButton).toBeDefined()
      expect(sendToBackButton).toHaveTextContent('⬇️')
    })

    it('should call bringToFront when ⬆️ button is clicked', () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const bringToFrontButton = screen.getByTitle('最前面に移動')
      fireEvent.click(bringToFrontButton)

      expect(mockCanvasActions.bringToFront).toHaveBeenCalledTimes(1)
    })

    it('should call sendToBack when ⬇️ button is clicked', () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const sendToBackButton = screen.getByTitle('最背面に移動')
      fireEvent.click(sendToBackButton)

      expect(mockCanvasActions.sendToBack).toHaveBeenCalledTimes(1)
    })

    it('should have accessible tooltips for layer operations', () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      // ツールチップが設定されていることを確認
      const bringToFrontButton = screen.getByTitle('最前面に移動')
      const sendToBackButton = screen.getByTitle('最背面に移動')

      expect(bringToFrontButton).toHaveAttribute('title', '最前面に移動')
      expect(sendToBackButton).toHaveAttribute('title', '最背面に移動')

      // アクセシビリティのための aria-label も確認
      expect(bringToFrontButton).toHaveAttribute('aria-label', '選択したオブジェクトを最前面に移動')
      expect(sendToBackButton).toHaveAttribute('aria-label', '選択したオブジェクトを最背面に移動')
    })
  })
})
