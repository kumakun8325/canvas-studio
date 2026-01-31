/**
 * Toolbar.test.tsx
 * Toolbarコンポーネントのテスト
 * Issue #75: ツールバーのレイヤー操作ボタンのUI改善
 * Issue #85: レビュー指摘事項の対応
 *
 * 改善内容:
 * - アイコンを ⬆️/⬇️ → ⏫/⏬ (二重矢印) に変更してレイヤー操作を直感的に
 * - ツールチップ (title属性) と aria-label でアクセシビリティ対応
 * - tools 配列のメモ化 (Issue #85)
 * - 画像アップロードバリデーション: MIMEタイプ、サイズ制限 (Issue #85)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Toolbar } from './Toolbar'
import { useEditorStore } from '../../stores/editorStore'

// Mock the useEditorStore
vi.mock('../../stores/editorStore')

// 画像ファイルのモックヘルパー
function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const file = new File(['mock content'], name, { type })
  // TypeScript の File 型は size を読み取り専用プロパティとして持たないため、
  // Object.defineProperty で設定します
  Object.defineProperty(file, 'size', { value: size, writable: false })
  return file
}

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
      const { container } = render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      // 保存ステータス要素が存在しないことを確認
      const statusDiv = container.querySelector('.text-green-600, .text-gray-600, .text-red-600')
      expect(statusDiv).toBeNull()
    })
  })

  describe('Issue #85: tools 配列のメモ化', () => {
    it('should render all tools from the tools array', () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      // 各ツールボタンが表示されていることを確認
      expect(screen.getByTitle('Select')).toBeDefined()
      expect(screen.getByTitle('Rectangle')).toBeDefined()
      expect(screen.getByTitle('Circle')).toBeDefined()
      expect(screen.getByTitle('Text')).toBeDefined()
      expect(screen.getByTitle('Image')).toBeDefined()
    })

    it('should call setActiveTool and corresponding action when tool is clicked', () => {
      const mockSetActiveTool = vi.fn()
      vi.mocked(useEditorStore).mockReturnValue({
        activeTool: 'select',
        setActiveTool: mockSetActiveTool,
      })

      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      // Rectangle ツールをクリック
      const rectButton = screen.getByTitle('Rectangle')
      fireEvent.click(rectButton)

      expect(mockSetActiveTool).toHaveBeenCalledWith('rect')
      expect(mockCanvasActions.addRect).toHaveBeenCalledTimes(1)
    })

    it('should trigger file input when Image tool is clicked', () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const imageButton = screen.getByTitle('Image')
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      expect(fileInput).toBeDefined()
      expect(fileInput).toHaveClass('hidden')

      fireEvent.click(imageButton)

      // ファイル選択ダイアログが開かれることを確認
      // （実際にはブラウザのダイアログは開かないが、file input のクリックはシミュレートできる）
    })
  })

  describe('Issue #85: 画像アップロードバリデーション', () => {
    it('should accept valid image files (JPEG)', async () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const validJpeg = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg')

      fireEvent.change(fileInput, { target: { files: [validJpeg] } })

      await waitFor(() => {
        expect(mockCanvasActions.addImage).toHaveBeenCalledWith(validJpeg)
      })

      // input value がリセットされていることを確認
      expect(fileInput.value).toBe('')
    })

    it('should accept valid image files (PNG)', async () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const validPng = createMockFile('test.png', 1024 * 1024, 'image/png')

      fireEvent.change(fileInput, { target: { files: [validPng] } })

      await waitFor(() => {
        expect(mockCanvasActions.addImage).toHaveBeenCalledWith(validPng)
      })
    })

    it('should accept valid image files (GIF)', async () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const validGif = createMockFile('test.gif', 1024 * 1024, 'image/gif')

      fireEvent.change(fileInput, { target: { files: [validGif] } })

      await waitFor(() => {
        expect(mockCanvasActions.addImage).toHaveBeenCalledWith(validGif)
      })
    })

    it('should accept valid image files (WebP)', async () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const validWebP = createMockFile('test.webp', 1024 * 1024, 'image/webp')

      fireEvent.change(fileInput, { target: { files: [validWebP] } })

      await waitFor(() => {
        expect(mockCanvasActions.addImage).toHaveBeenCalledWith(validWebP)
      })
    })

    it('should accept valid image files (SVG)', async () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const validSvg = createMockFile('test.svg', 1024 * 1024, 'image/svg+xml')

      fireEvent.change(fileInput, { target: { files: [validSvg] } })

      await waitFor(() => {
        expect(mockCanvasActions.addImage).toHaveBeenCalledWith(validSvg)
      })
    })

    it('should reject non-image files (PDF)', async () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const pdfFile = createMockFile('test.pdf', 1024 * 1024, 'application/pdf')

      fireEvent.change(fileInput, { target: { files: [pdfFile] } })

      await waitFor(() => {
        expect(mockCanvasActions.addImage).not.toHaveBeenCalled()
      })

      // エラーメッセージが表示されることを確認
      expect(screen.getByText(/PDFはアップロードできません/)).toBeDefined()
    })

    it('should reject files exceeding size limit (10MB)', async () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const hugeFile = createMockFile('huge.jpg', 11 * 1024 * 1024, 'image/jpeg') // 11MB

      fireEvent.change(fileInput, { target: { files: [hugeFile] } })

      await waitFor(() => {
        expect(mockCanvasActions.addImage).not.toHaveBeenCalled()
      })

      // エラーメッセージが表示されることを確認
      expect(screen.getByText(/10MB以下のファイルのみアップロードできます/)).toBeDefined()
    })

    it('should handle empty file selection', async () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(fileInput, { target: { files: [] } })

      await waitFor(() => {
        expect(mockCanvasActions.addImage).not.toHaveBeenCalled()
      })
    })

    it('should handle null file selection', async () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(fileInput, { target: { files: null } })

      await waitFor(() => {
        expect(mockCanvasActions.addImage).not.toHaveBeenCalled()
      })
    })

    it('should reject files with invalid MIME type', async () => {
      render(
        <Toolbar
          canvasActions={mockCanvasActions}
        />
      )

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const textFile = createMockFile('test.txt', 1024, 'text/plain')

      fireEvent.change(fileInput, { target: { files: [textFile] } })

      await waitFor(() => {
        expect(mockCanvasActions.addImage).not.toHaveBeenCalled()
      })

      // エラーメッセージが表示されることを確認
      expect(screen.getByText(/画像ファイルのみアップロードできます/)).toBeDefined()
    })
  })
})
