/**
 * ExportDialog.test.tsx
 * ExportDialogコンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExportDialog } from './ExportDialog'

describe('ExportDialog', () => {
  const mockOnExport = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CMYKオプション', () => {
    it('should show CMYK option when PDF format is selected', () => {
      render(
        <ExportDialog
          isOpen={true}
          onExport={mockOnExport}
          onClose={mockOnClose}
        />,
      )

      // PDFラジオボタンをクリック
      const pdfRadio = screen.getByLabelText(/PDF/)
      fireEvent.click(pdfRadio)

      // CMYKオプションが表示されることを確認
      const cmykCheckbox = screen.getByLabelText(/CMYK/)
      expect(cmykCheckbox).toBeDefined()
    })

    it('should pass cmyk option to onExport callback when enabled', async () => {
      let exportOptions: any = null
      const captureExport = vi.fn((options) => {
        exportOptions = options
        return Promise.resolve()
      })

      render(
        <ExportDialog
          isOpen={true}
          onExport={captureExport}
          onClose={mockOnClose}
        />,
      )

      // PDFを選択
      const pdfRadio = screen.getByLabelText(/PDF/)
      fireEvent.click(pdfRadio)

      // CMYKチェックボックスをオンにする
      const cmykCheckbox = screen.getByLabelText(/CMYK/)
      fireEvent.click(cmykCheckbox)

      // エクスポートボタンをクリック
      const exportButton = screen.getByRole('button', { name: 'エクスポート' })
      fireEvent.click(exportButton)

      await waitFor(() => {
        expect(captureExport).toHaveBeenCalled()
      })

      expect(exportOptions).toBeDefined()
      expect(exportOptions.cmyk).toBe(true)
    })
  })

  describe('bleedオプション', () => {
    it('should show bleed input when PDF format is selected', () => {
      render(
        <ExportDialog
          isOpen={true}
          onExport={mockOnExport}
          onClose={mockOnClose}
        />,
      )

      // PDFを選択
      const pdfRadio = screen.getByLabelText(/PDF/)
      fireEvent.click(pdfRadio)

      // bleedオプションが表示されることを確認
      const bleedLabel = screen.getByText(/塗り足し/)
      expect(bleedLabel).toBeDefined()
    })

    it('should pass bleed option to onExport callback', async () => {
      let exportOptions: any = null
      const captureExport = vi.fn((options) => {
        exportOptions = options
        return Promise.resolve()
      })

      render(
        <ExportDialog
          isOpen={true}
          onExport={captureExport}
          onClose={mockOnClose}
        />,
      )

      // PDFを選択
      const pdfRadio = screen.getByLabelText(/PDF/)
      fireEvent.click(pdfRadio)

      // bleedスライダーの値を変更（type="range"のinputを探す）
      const bleedSlider = screen.getByRole('slider')
      fireEvent.input(bleedSlider, { target: { value: '5' } })

      // エクスポートボタンをクリック
      const exportButton = screen.getByRole('button', { name: 'エクスポート' })
      fireEvent.click(exportButton)

      await waitFor(() => {
        expect(captureExport).toHaveBeenCalled()
      })

      expect(exportOptions).toBeDefined()
      expect(exportOptions.bleed).toBe(5)
    })
  })

  describe('trimMarksオプション', () => {
    it('should show trim marks checkbox when PDF format is selected', () => {
      render(
        <ExportDialog
          isOpen={true}
          onExport={mockOnExport}
          onClose={mockOnClose}
        />,
      )

      // PDFを選択
      const pdfRadio = screen.getByLabelText(/PDF/)
      fireEvent.click(pdfRadio)

      // trimMarksオプションが表示されることを確認
      const trimMarksCheckbox = screen.getByLabelText(/トンボ/)
      expect(trimMarksCheckbox).toBeDefined()
    })

    it('should pass trimMarks option to onExport callback when enabled', async () => {
      let exportOptions: any = null
      const captureExport = vi.fn((options) => {
        exportOptions = options
        return Promise.resolve()
      })

      render(
        <ExportDialog
          isOpen={true}
          onExport={captureExport}
          onClose={mockOnClose}
        />,
      )

      // PDFを選択
      const pdfRadio = screen.getByLabelText(/PDF/)
      fireEvent.click(pdfRadio)

      // trimMarksチェックボックスをオンにする
      const trimMarksCheckbox = screen.getByLabelText(/トンボ/)
      fireEvent.click(trimMarksCheckbox)

      // エクスポートボタンをクリック
      const exportButton = screen.getByRole('button', { name: 'エクスポート' })
      fireEvent.click(exportButton)

      await waitFor(() => {
        expect(captureExport).toHaveBeenCalled()
      })

      expect(exportOptions).toBeDefined()
      expect(exportOptions.trimMarks).toBe(true)
    })
  })

  describe('基本機能', () => {
    it('should close dialog when cancel button is clicked', () => {
      render(
        <ExportDialog
          isOpen={true}
          onExport={mockOnExport}
          onClose={mockOnClose}
        />,
      )

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not render dialog when isOpen is false', () => {
      const { container } = render(
        <ExportDialog
          isOpen={false}
          onExport={mockOnExport}
          onClose={mockOnClose}
        />,
      )

      expect(container.firstChild).toBeNull()
    })

    it('should show quality slider for JPEG format', () => {
      render(
        <ExportDialog
          isOpen={true}
          onExport={mockOnExport}
          onClose={mockOnClose}
        />,
      )

      // JPEGを選択
      const jpegRadio = screen.getByLabelText(/JPEG/)
      fireEvent.click(jpegRadio)

      // 品質スライダーが表示される
      const qualityLabel = screen.getByText(/品質:/)
      expect(qualityLabel).toBeDefined()
    })
  })
})
