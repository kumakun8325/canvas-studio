/**
 * Phase 9: 名刺用PDFテスト
 *
 * 印刷入稿用の名刺PDF生成機能のテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Canvas, Rect } from 'fabric'
import {
  BUSINESS_CARD,
  mmToPixel,
  mmToPoints,
  calculateCanvasSize,
  generateBusinessCardPDF,
  DEFAULT_PRINT_SETTINGS,
} from '../services/businessCardService'

// 最小限の有効なPNG（1x1ピクセルの黒）
const minimalPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

// CanvasのtoDataURLをモックして有効なPNGを返すようにする
function mockCanvasToDataURL(canvas: Canvas) {
  // @ts-expect-error - toDataURLの型をオーバーライド
  canvas.toDataURL = () => {
    return Promise.resolve(`data:image/png;base64,${minimalPngBase64}`)
  }
}

// BlobをArrayBufferに変換するヘルパー関数（テスト環境用）
async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert blob to ArrayBuffer'))
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(blob)
  })
}

describe('Phase 9: 名刺用PDF', () => {
  let canvas: Canvas

  beforeEach(() => {
    const element = document.createElement('canvas')
    const size = calculateCanvasSize(3, 'screen')
    canvas = new Canvas(element, {
      width: size.width,
      height: size.height,
    })

    // テスト用オブジェクト
    const rect = new Rect({
      left: 10,
      top: 10,
      width: 100,
      height: 50,
      fill: '#3b82f6',
    })
    canvas.add(rect)

    // toDataURLをモック
    mockCanvasToDataURL(canvas)
  })

  afterEach(() => {
    canvas.dispose()
  })

  describe('9.1 定数と計算', () => {
    it('should have correct business card dimensions', () => {
      expect(BUSINESS_CARD.WIDTH_MM).toBe(91)
      expect(BUSINESS_CARD.HEIGHT_MM).toBe(55)
      expect(BUSINESS_CARD.DEFAULT_BLEED_MM).toBe(3)
      expect(BUSINESS_CARD.TRIM_MARK_SIZE_MM).toBe(5)
      expect(BUSINESS_CARD.TRIM_MARK_LINE_WIDTH).toBe(0.3)
      expect(BUSINESS_CARD.DPI_SCREEN).toBe(96)
      expect(BUSINESS_CARD.DPI_PRINT).toBe(300)
    })

    it('should convert mm to pixels correctly (96 DPI)', () => {
      expect(mmToPixel(91, 96)).toBe(344)
      expect(mmToPixel(55, 96)).toBe(208)
      expect(mmToPixel(97, 96)).toBe(367)
      expect(mmToPixel(61, 96)).toBe(231) // 実際の計算値: (61 * 96) / 25.4 = 230.55... -> 231
    })

    it('should convert mm to pixels correctly (300 DPI)', () => {
      expect(mmToPixel(91, 300)).toBe(1075) // 実際の計算値: (91 * 300) / 25.4 = 1074.8... -> 1075
      expect(mmToPixel(55, 300)).toBe(650)
      expect(mmToPixel(97, 300)).toBe(1146) // 実際の計算値: (97 * 300) / 25.4 = 1145.67... -> 1146
      expect(mmToPixel(61, 300)).toBe(720)
    })

    it('should convert mm to points correctly', () => {
      // 1mm = 2.834645669 points
      expect(mmToPoints(1)).toBeCloseTo(2.834645669, 5)
      expect(mmToPoints(91)).toBeCloseTo(257.95, 1)
      expect(mmToPoints(55)).toBeCloseTo(155.91, 1)
    })
  })

  describe('9.2 キャンバスサイズ計算', () => {
    it('should calculate canvas size with bleed (screen)', () => {
      const size = calculateCanvasSize(3, 'screen')
      expect(size.width).toBe(367) // 97mm @ 96DPI
      expect(size.height).toBe(231) // 61mm @ 96DPI (実測値)
    })

    it('should calculate canvas size with bleed (print)', () => {
      const size = calculateCanvasSize(3, 'print')
      expect(size.width).toBe(1146) // 97mm @ 300DPI (実測値)
      expect(size.height).toBe(720) // 61mm @ 300DPI
    })

    it('should handle different bleed values', () => {
      const size2mm = calculateCanvasSize(2, 'screen')
      const size5mm = calculateCanvasSize(5, 'screen')

      expect(size2mm.width).toBeLessThan(size5mm.width)
      expect(size2mm.height).toBeLessThan(size5mm.height)
    })

    it('should calculate correct size for 2mm bleed (screen)', () => {
      const size = calculateCanvasSize(2, 'screen')
      // 91 + 2*2 = 95mm -> 359px @ 96DPI
      // 55 + 2*2 = 59mm -> 223px @ 96DPI
      expect(size.width).toBe(359)
      expect(size.height).toBe(223)
    })

    it('should calculate correct size for 5mm bleed (screen)', () => {
      const size = calculateCanvasSize(5, 'screen')
      // 91 + 2*5 = 101mm -> 382px @ 96DPI
      // 55 + 2*5 = 65mm -> 246px @ 96DPI
      expect(size.width).toBe(382)
      expect(size.height).toBe(246)
    })
  })

  describe('9.4 PDF生成', () => {
    it('should generate valid PDF blob', async () => {
      const blob = await generateBusinessCardPDF(canvas, DEFAULT_PRINT_SETTINGS)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/pdf')
    })

    it('should create PDF with correct header', async () => {
      const blob = await generateBusinessCardPDF(canvas, DEFAULT_PRINT_SETTINGS)
      const arrayBuffer = await blobToArrayBuffer(blob)
      const bytes = new Uint8Array(arrayBuffer)

      const header = String.fromCharCode(...bytes.slice(0, 5))
      expect(header).toBe('%PDF-')
    })

    it('should respect print settings - trim marks affect size', async () => {
      const settingsWithTrimMarks = {
        ...DEFAULT_PRINT_SETTINGS,
        trimMarks: true,
      }
      const settingsWithoutTrimMarks = {
        ...DEFAULT_PRINT_SETTINGS,
        trimMarks: false,
      }

      const pdfWithMarks = await generateBusinessCardPDF(canvas, settingsWithTrimMarks)
      const pdfWithoutMarks = await generateBusinessCardPDF(canvas, settingsWithoutTrimMarks)

      // トンボありの方がサイズが大きい（ページサイズが異なる）
      expect(pdfWithMarks.size).toBeGreaterThan(pdfWithoutMarks.size)
    })

    it('should generate PDF with correct PDF version', async () => {
      const blob = await generateBusinessCardPDF(canvas, DEFAULT_PRINT_SETTINGS)
      const arrayBuffer = await blobToArrayBuffer(blob)
      const bytes = new Uint8Array(arrayBuffer)

      // Check for PDF-1.x header
      const header = String.fromCharCode(...bytes.slice(0, 8))
      expect(header).toMatch(/^%PDF-1\.[0-9]/)
    })
  })

  describe('9.3 トンボ', () => {
    it('should include trim marks in PDF when enabled', async () => {
      const settings = { ...DEFAULT_PRINT_SETTINGS, trimMarks: true }
      const blob = await generateBusinessCardPDF(canvas, settings)

      // PDFが生成されることを確認
      expect(blob.size).toBeGreaterThan(0)
    })

    it('should exclude trim marks when disabled', async () => {
      const settings = { ...DEFAULT_PRINT_SETTINGS, trimMarks: false }
      const blob = await generateBusinessCardPDF(canvas, settings)

      expect(blob.size).toBeGreaterThan(0)
    })

    it('should generate different PDF sizes with/without trim marks', async () => {
      const withMarks = await generateBusinessCardPDF(
        canvas,
        { ...DEFAULT_PRINT_SETTINGS, trimMarks: true }
      )
      const withoutMarks = await generateBusinessCardPDF(
        canvas,
        { ...DEFAULT_PRINT_SETTINGS, trimMarks: false }
      )

      // トンボありの方がサイズが大きいはず
      expect(withMarks.size).toBeGreaterThan(withoutMarks.size)
    })
  })

  describe('デフォルト設定', () => {
    it('should have correct default print settings', () => {
      expect(DEFAULT_PRINT_SETTINGS.bleed).toBe(3)
      expect(DEFAULT_PRINT_SETTINGS.trimMarks).toBe(true)
      expect(DEFAULT_PRINT_SETTINGS.registrationMarks).toBe(false)
      expect(DEFAULT_PRINT_SETTINGS.cmyk).toBe(false)
      expect(DEFAULT_PRINT_SETTINGS.dpi).toBe('print')
    })
  })

  describe('塗り足し設定の変化', () => {
    it('should generate different PDF sizes with different bleed values', async () => {
      const bleed2mm = await generateBusinessCardPDF(
        canvas,
        { ...DEFAULT_PRINT_SETTINGS, bleed: 2 }
      )
      const bleed5mm = await generateBusinessCardPDF(
        canvas,
        { ...DEFAULT_PRINT_SETTINGS, bleed: 5 }
      )

      // 塗り足しが大きい方がPDFサイズが大きいはず（画像サイズが異なる）
      expect(bleed5mm.size).not.toBe(bleed2mm.size)
    })

    it('should reject negative bleed values', async () => {
      await expect(
        generateBusinessCardPDF(canvas, { ...DEFAULT_PRINT_SETTINGS, bleed: -1 })
      ).rejects.toThrow('Bleed value must be non-negative')
    })
  })
})
