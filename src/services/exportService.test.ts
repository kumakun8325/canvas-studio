/**
 * exportService.test.ts
 * エクスポートサービスのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportSlide, downloadBlob } from './exportService'
import type { Canvas } from 'fabric'

// Fabric Canvasのモック
const createMockCanvas = () => ({
  width: 800,
  height: 600,
  toDataURL: vi.fn().mockResolvedValue(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  ),
}) as unknown as Canvas

describe('exportService', () => {
  let mockCanvas: Canvas

  beforeEach(() => {
    vi.clearAllMocks()
    mockCanvas = createMockCanvas()
  })

  describe('exportAsPDF with CMYK', () => {
    it('should export as PDF with CMYK color option', async () => {
      const result = await exportSlide(mockCanvas, {
        format: 'pdf',
        cmyk: true,
      })

      expect(result.mimeType).toBe('application/pdf')
      expect(result.filename).toMatch(/\.pdf$/)
      expect(result.blob).toBeInstanceOf(Blob)
    })

    it('should export as PDF without CMYK option', async () => {
      const result = await exportSlide(mockCanvas, {
        format: 'pdf',
        cmyk: false,
      })

      expect(result.mimeType).toBe('application/pdf')
      expect(result.filename).toMatch(/\.pdf$/)
      expect(result.blob).toBeInstanceOf(Blob)
    })
  })

  describe('exportAsPDF with bleed option', () => {
    it('should export as PDF with bleed option', async () => {
      const result = await exportSlide(mockCanvas, {
        format: 'pdf',
        bleed: 3, // 3mm bleed
      })

      expect(result.mimeType).toBe('application/pdf')
      expect(result.blob).toBeInstanceOf(Blob)
    })
  })

  describe('exportAsPDF with trim marks', () => {
    it('should export as PDF with trim marks option', async () => {
      const result = await exportSlide(mockCanvas, {
        format: 'pdf',
        trimMarks: true,
      })

      expect(result.mimeType).toBe('application/pdf')
      expect(result.blob).toBeInstanceOf(Blob)
    })
  })

  describe('downloadBlob', () => {
    it('should create download link and trigger download', () => {
      const blob = new Blob(['test content'], { type: 'text/plain' })
      const filename = 'test.txt'

      const clickSpy = vi.fn()

      // createElementのモック - 実際のHTMLAnchorElementを返す
      const originalCreateElement = document.createElement
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        const anchor = originalCreateElement.call(document, tagName)
        anchor.click = clickSpy
        return anchor
      })

      // appendChild/removeChildのモック
      const appendChildSpy = vi.spyOn(document.body, 'appendChild')
      const removeChildSpy = vi.spyOn(document.body, 'removeChild')

      // URL.createObjectURLとrevokeObjectURLをモック
      const createObjectURLMock = vi.fn(() => 'blob:test-url')
      global.URL.createObjectURL = createObjectURLMock

      if (!global.URL.revokeObjectURL) {
        global.URL.revokeObjectURL = vi.fn()
      }
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL')

      downloadBlob(blob, filename)

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(appendChildSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
    })
  })
})
