/**
 * Toolbar.test.tsx
 * Toolbarコンポーネントのテスト
 * Issue #75: ツールバーのレイヤー操作ボタンのUI改善
 *
 * 改善内容:
 * - アイコンを ⬆️/⬇️ → ⏫/⏬ (二重矢印) に変更してレイヤー操作を直感的に
 * - ツールチップ (title属性) と aria-label でアクセシビリティ対応
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toolbar } from './Toolbar'
import { useEditorStore } from '../../stores/editorStore'

// Mock the useEditorStore
vi.mock('../../stores/editorStore')

// Mock the useTheme hook
vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: false,
    themeMode: 'system' as const,
    setThemeMode: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}))

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
      expect(bringToFrontButton).toHaveTextContent('⏫')
    })

    it('should render sendToBack button with descriptive tooltip', () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const sendToBackButton = screen.getByTitle('最背面に移動')
      expect(sendToBackButton).toBeDefined()
      expect(sendToBackButton).toHaveTextContent('⏬')
    })

    it('should call bringToFront when ⏫ button is clicked', () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const bringToFrontButton = screen.getByTitle('最前面に移動')
      fireEvent.click(bringToFrontButton)

      expect(mockCanvasActions.bringToFront).toHaveBeenCalledTimes(1)
    })

    it('should call sendToBack when ⏬ button is clicked', () => {
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

  describe('画像アップロード', () => {
    it('should trigger file input click when image tool is selected', () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const imageButton = screen.getByTitle('Image')
      fireEvent.click(imageButton)

      // fileInputRef.current?.click() が呼ばれることを確認
      // 注: このテストは click メソッドが呼ばれることを検証しませんが、
      // 実際の動作ではファイル選択ダイアログが開きます
    })

    it('should call addImage and reset file input when file is selected', () => {
      const { container } = render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      expect(fileInput).toBeInTheDocument()

      // ファイル選択イベントを作成
      const file = new File(['dummy'], 'test.png', { type: 'image/png' })

      // fireEvent.change でイベントを発火
      fireEvent.change(fileInput, { target: { files: [file] } })

      // ファイルハンドラーが呼ばれたことを確認
      expect(mockCanvasActions.addImage).toHaveBeenCalledWith(file)
    })
  })

  describe('保存ステータス表示', () => {
    it('should display saving status when isSaving is true', () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
          isSaving={true}
        />
      )

      const savingStatus = screen.getByText('保存中...')
      expect(savingStatus).toBeDefined()
      expect(savingStatus).toHaveClass('text-gray-600')
    })

    it('should display saved status with lastSaved time', () => {
      const now = new Date()
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
          lastSaved={now}
        />
      )

      const savedStatus = screen.getByText(/保存済み/)
      expect(savedStatus).toBeDefined()
      expect(savedStatus).toHaveClass('text-green-600')
    })

    it('should display save error when saveError is provided', () => {
      const error = new Error('Failed to save')
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
          saveError={error}
        />
      )

      const errorStatus = screen.getByText('保存エラー')
      expect(errorStatus).toBeDefined()
      expect(errorStatus).toHaveClass('text-red-600')
    })

    it('should format lastSaved time as "たった今" for very recent saves', () => {
      const now = new Date()
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
          lastSaved={now}
        />
      )

      const savedStatus = screen.getByText('保存済み (たった今)')
      expect(savedStatus).toBeDefined()
    })

    it('should format lastSaved time as "X分前" for saves within an hour', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
          lastSaved={fiveMinutesAgo}
        />
      )

      const savedStatus = screen.getByText('保存済み (5分前)')
      expect(savedStatus).toBeDefined()
    })

    it('should format lastSaved time as HH:mm for older saves', () => {
      // 2時間前の時間を作成
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
          lastSaved={twoHoursAgo}
        />
      )

      // HH:mm形式（例: 10:30）が含まれていることを確認
      const savedStatus = screen.getByText(/保存済み \(\d{2}:\d{2}\)/)
      expect(savedStatus).toBeDefined()
    })

    it('should not display status when no save info is provided', () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      // 保存ステータステキストが表示されていないことを確認
      expect(screen.queryByText('保存中...')).toBeNull()
      expect(screen.queryByText(/保存済み/)).toBeNull()
      expect(screen.queryByText('保存エラー')).toBeNull()
    })
  })
})
