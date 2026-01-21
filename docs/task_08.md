# Phase 8: エクスポート - 実装タスク

## 概要

Phase 8では、キャンバスの内容を各種形式でエクスポートする機能を実装する。
- 画像エクスポート（PNG/JPEG）
- PDF エクスポート（単一/複数スライド）
- CMYK 変換（印刷用）

## 前提条件

- Phase 1-7 完了済み
- Fabric.js 6.5.4（toDataURL対応）
- pdf-lib 1.17.1（インストール済み）
- 既存の型定義（ExportOptions）を使用

---

## 既存の型定義（types/index.ts）

```typescript
// 既に定義済み
export interface ExportOptions {
  format: 'png' | 'jpeg' | 'pdf'
  quality?: number       // 0-1（JPEG用）
  cmyk?: boolean         // CMYK変換有効化
  bleed?: number         // 塗り足し（mm）
  trimMarks?: boolean    // トンボ
}
```

---

## タスク一覧

### 8.1 exportService 実装（PNG/JPEG）

**目的:** エクスポート機能の中核サービス

**実装場所:** `src/services/exportService.ts`（新規作成）

**インターフェース:**

```typescript
import type { ExportOptions, Slide } from '../types'
import type { Canvas } from 'fabric'

export interface ExportResult {
  blob: Blob
  filename: string
  mimeType: string
}

// 単一スライドエクスポート
export async function exportSlide(
  canvas: Canvas,
  options: ExportOptions
): Promise<ExportResult>

// 複数スライドエクスポート（PDF用）
export async function exportAllSlides(
  slides: Slide[],
  options: ExportOptions,
  templateConfig: TemplateConfig
): Promise<ExportResult>

// ダウンロード実行
export function downloadBlob(blob: Blob, filename: string): void
```

**実装:**

```typescript
import { PDFDocument } from 'pdf-lib'
import { Canvas } from 'fabric'
import type { ExportOptions, Slide, TemplateConfig } from '../types'

export interface ExportResult {
  blob: Blob
  filename: string
  mimeType: string
}

// メインエクスポート関数
export async function exportSlide(
  canvas: Canvas,
  options: ExportOptions
): Promise<ExportResult> {
  switch (options.format) {
    case 'png':
      return exportAsPNG(canvas)
    case 'jpeg':
      return exportAsJPEG(canvas, options.quality ?? 0.92)
    case 'pdf':
      return exportAsPDF([canvas], options)
    default:
      throw new Error(`Unsupported format: ${options.format}`)
  }
}

// PNG エクスポート
async function exportAsPNG(canvas: Canvas): Promise<ExportResult> {
  const dataURL = await canvas.toDataURL({
    format: 'png',
    multiplier: 1,
  })

  const blob = dataURLToBlob(dataURL)

  return {
    blob,
    filename: `export_${Date.now()}.png`,
    mimeType: 'image/png',
  }
}

// JPEG エクスポート
async function exportAsJPEG(
  canvas: Canvas,
  quality: number
): Promise<ExportResult> {
  const dataURL = await canvas.toDataURL({
    format: 'jpeg',
    quality,
    multiplier: 1,
  })

  const blob = dataURLToBlob(dataURL)

  return {
    blob,
    filename: `export_${Date.now()}.jpg`,
    mimeType: 'image/jpeg',
  }
}

// PDF エクスポート
async function exportAsPDF(
  canvases: Canvas[],
  options: ExportOptions
): Promise<ExportResult> {
  const pdfDoc = await PDFDocument.create()

  for (const canvas of canvases) {
    const width = canvas.width || 800
    const height = canvas.height || 600

    // ページ追加
    const page = pdfDoc.addPage([width, height])

    // キャンバスをPNG画像として取得
    const dataURL = await canvas.toDataURL({
      format: 'png',
      multiplier: 1,
    })

    // Base64部分を抽出
    const base64Data = dataURL.split(',')[1]
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

    // 画像埋め込み
    const pngImage = await pdfDoc.embedPng(imageBytes)
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width,
      height,
    })
  }

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })

  return {
    blob,
    filename: `export_${Date.now()}.pdf`,
    mimeType: 'application/pdf',
  }
}

// DataURL → Blob 変換
function dataURLToBlob(dataURL: string): Blob {
  const [header, data] = dataURL.split(',')
  const mimeMatch = header.match(/:(.*?);/)
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'

  const binaryString = atob(data)
  const bytes = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return new Blob([bytes], { type: mimeType })
}

// ダウンロード実行
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

---

### 8.2 ExportDialog コンポーネント

**目的:** エクスポート設定UI

**実装場所:** `src/components/export/ExportDialog.tsx`（新規作成）

**実装:**

```typescript
import { useState } from 'react'
import type { ExportOptions } from '../../types'

interface ExportDialogProps {
  isOpen: boolean
  onExport: (options: ExportOptions) => Promise<void>
  onClose: () => void
  slideCount: number
}

type ExportFormat = 'png' | 'jpeg' | 'pdf'
type ExportRange = 'current' | 'all'

export function ExportDialog({
  isOpen,
  onExport,
  onClose,
  slideCount,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('png')
  const [quality, setQuality] = useState(92)
  const [range, setRange] = useState<ExportRange>('current')
  const [cmykEnabled, setCmykEnabled] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExport({
        format,
        quality: quality / 100,
        cmyk: cmykEnabled,
      })
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
      alert('エクスポートに失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">エクスポート</h2>

        {/* フォーマット選択 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">出力形式</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="format"
                value="png"
                checked={format === 'png'}
                onChange={() => setFormat('png')}
              />
              <span>PNG（ロスレス・透明対応）</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="format"
                value="jpeg"
                checked={format === 'jpeg'}
                onChange={() => setFormat('jpeg')}
              />
              <span>JPEG（圧縮・小サイズ）</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={format === 'pdf'}
                onChange={() => setFormat('pdf')}
              />
              <span>PDF（複数ページ対応）</span>
            </label>
          </div>
        </div>

        {/* JPEG品質設定 */}
        {format === 'jpeg' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              品質: {quality}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* PDF設定 */}
        {format === 'pdf' && (
          <>
            {/* 出力範囲 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">出力範囲</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="range"
                    value="current"
                    checked={range === 'current'}
                    onChange={() => setRange('current')}
                  />
                  <span>現在のスライドのみ</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="range"
                    value="all"
                    checked={range === 'all'}
                    onChange={() => setRange('all')}
                  />
                  <span>全スライド（{slideCount}ページ）</span>
                </label>
              </div>
            </div>

            {/* CMYK変換 */}
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={cmykEnabled}
                  onChange={(e) => setCmykEnabled(e.target.checked)}
                />
                <span>CMYK変換（印刷用）</span>
              </label>
            </div>
          </>
        )}

        {/* ボタン */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isExporting ? 'エクスポート中...' : 'エクスポート'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

### 8.3 PNG エクスポート

**目的:** ロスレス形式での画像出力

**Fabric.js API:**

```typescript
const dataURL = await canvas.toDataURL({
  format: 'png',
  multiplier: 1,  // スケール倍率（2で2倍解像度）
})
```

**特徴:**
- ロスレス圧縮
- 透明度（アルファチャンネル）対応
- ファイルサイズは大きめ

---

### 8.4 JPEG エクスポート

**目的:** 圧縮形式での画像出力

**Fabric.js API:**

```typescript
const dataURL = await canvas.toDataURL({
  format: 'jpeg',
  quality: 0.92,  // 0-1（品質）
  multiplier: 1,
})
```

**特徴:**
- 非可逆圧縮
- ファイルサイズが小さい
- 透明度非対応（白背景に変換）

---

### 8.5 PDF エクスポート（pdf-lib）

**目的:** PDF形式での出力（単一/複数ページ）

**実装:**

```typescript
import { PDFDocument } from 'pdf-lib'

async function exportMultipleSlidesPDF(
  slides: Slide[],
  templateConfig: TemplateConfig,
  canvasLoader: (json: string) => Promise<Canvas>
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()

  for (const slide of slides) {
    // スライドのJSONからキャンバスを復元
    const canvas = await canvasLoader(slide.canvasJson)

    const width = templateConfig.width
    const height = templateConfig.height

    // ページ追加
    const page = pdfDoc.addPage([width, height])

    // キャンバスを画像として取得
    const dataURL = await canvas.toDataURL({ format: 'png' })
    const base64Data = dataURL.split(',')[1]
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

    // 画像埋め込み
    const pngImage = await pdfDoc.embedPng(imageBytes)
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width,
      height,
    })

    // メモリ解放
    canvas.dispose()
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}
```

**pdf-lib 主要API:**

| メソッド | 説明 |
|---------|------|
| `PDFDocument.create()` | 新規PDF作成 |
| `pdfDoc.addPage([w, h])` | ページ追加（サイズ指定） |
| `pdfDoc.embedPng(bytes)` | PNG画像埋め込み |
| `pdfDoc.embedJpg(bytes)` | JPEG画像埋め込み |
| `page.drawImage(img, opts)` | 画像描画 |
| `pdfDoc.save()` | PDF出力（Uint8Array） |

---

### 8.6 cmykService 実装

**目的:** RGB → CMYK 色変換（印刷用）

**実装場所:** `src/services/cmykService.ts`（新規作成）

**実装:**

```typescript
export interface CMYKColor {
  cyan: number     // 0-100
  magenta: number  // 0-100
  yellow: number   // 0-100
  key: number      // 0-100（黒）
}

export interface RGBColor {
  r: number  // 0-255
  g: number  // 0-255
  b: number  // 0-255
}

// RGB → CMYK 変換
export function rgbToCmyk(rgb: RGBColor): CMYKColor {
  const { r, g, b } = rgb

  // 正規化（0-1）
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  // K（黒）を計算
  const k = 1 - Math.max(rNorm, gNorm, bNorm)

  // 完全な黒の場合
  if (k === 1) {
    return { cyan: 0, magenta: 0, yellow: 0, key: 100 }
  }

  // C, M, Y を計算
  const c = (1 - rNorm - k) / (1 - k)
  const m = (1 - gNorm - k) / (1 - k)
  const y = (1 - bNorm - k) / (1 - k)

  return {
    cyan: Math.round(c * 100),
    magenta: Math.round(m * 100),
    yellow: Math.round(y * 100),
    key: Math.round(k * 100),
  }
}

// CMYK → RGB 変換（プレビュー用）
export function cmykToRgb(cmyk: CMYKColor): RGBColor {
  const { cyan, magenta, yellow, key } = cmyk

  const c = cyan / 100
  const m = magenta / 100
  const y = yellow / 100
  const k = key / 100

  const r = Math.round(255 * (1 - c) * (1 - k))
  const g = Math.round(255 * (1 - m) * (1 - k))
  const b = Math.round(255 * (1 - y) * (1 - k))

  return { r, g, b }
}

// Hex文字列 → RGB
export function hexToRgb(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return { r: 0, g: 0, b: 0 }
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

// RGB → Hex文字列
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

// CMYK文字列フォーマット
export function formatCmyk(cmyk: CMYKColor): string {
  return `C${cmyk.cyan} M${cmyk.magenta} Y${cmyk.yellow} K${cmyk.key}`
}
```

---

### 8.7 CMYKPreview コンポーネント

**目的:** 色のCMYK値とプレビュー表示

**実装場所:** `src/components/export/CMYKPreview.tsx`（新規作成）

**実装:**

```typescript
import { useMemo } from 'react'
import { rgbToCmyk, cmykToRgb, hexToRgb, rgbToHex, formatCmyk } from '../../services/cmykService'
import type { CMYKColor, RGBColor } from '../../services/cmykService'

interface CMYKPreviewProps {
  color: string  // Hex形式（#RRGGBB）
}

export function CMYKPreview({ color }: CMYKPreviewProps) {
  const { rgb, cmyk, simulatedHex } = useMemo(() => {
    const rgb = hexToRgb(color)
    const cmyk = rgbToCmyk(rgb)
    const simulatedRgb = cmykToRgb(cmyk)
    const simulatedHex = rgbToHex(simulatedRgb)

    return { rgb, cmyk, simulatedHex }
  }, [color])

  return (
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium mb-3">CMYK プレビュー</h4>

      <div className="flex gap-4 mb-3">
        {/* 元の色 */}
        <div className="text-center">
          <div
            className="w-16 h-16 rounded border"
            style={{ backgroundColor: color }}
          />
          <div className="text-xs mt-1">RGB</div>
          <div className="text-xs text-gray-500">{color}</div>
        </div>

        {/* 矢印 */}
        <div className="flex items-center text-gray-400">→</div>

        {/* CMYK変換後 */}
        <div className="text-center">
          <div
            className="w-16 h-16 rounded border"
            style={{ backgroundColor: simulatedHex }}
          />
          <div className="text-xs mt-1">CMYK</div>
          <div className="text-xs text-gray-500">{simulatedHex}</div>
        </div>
      </div>

      {/* CMYK値 */}
      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        <div>
          <div className="font-medium text-cyan-600">C</div>
          <div>{cmyk.cyan}%</div>
        </div>
        <div>
          <div className="font-medium text-pink-600">M</div>
          <div>{cmyk.magenta}%</div>
        </div>
        <div>
          <div className="font-medium text-yellow-600">Y</div>
          <div>{cmyk.yellow}%</div>
        </div>
        <div>
          <div className="font-medium text-gray-800">K</div>
          <div>{cmyk.key}%</div>
        </div>
      </div>

      {/* 注意書き */}
      <p className="text-xs text-gray-500 mt-3">
        ※ 画面表示はRGBシミュレーションです。実際の印刷色とは異なる場合があります。
      </p>
    </div>
  )
}
```

---

### 8.8 CMYK PDF エクスポート

**目的:** 印刷用CMYK対応PDFの生成

**注意:** pdf-libはCMYKネイティブサポートが限定的。以下のアプローチを使用。

**実装方針:**

1. **画像レベル変換:** Canvas画像のピクセルをCMYK変換してから埋め込む
2. **メタデータ:** PDFにCMYK情報をメタデータとして付加

```typescript
import { PDFDocument, rgb } from 'pdf-lib'
import { rgbToCmyk, hexToRgb } from './cmykService'

// CMYK PDF用の画像データ処理
async function processImageForCMYK(
  canvas: Canvas
): Promise<{ imageData: Uint8Array; width: number; height: number }> {
  // Canvas要素を取得
  const canvasElement = canvas.getElement() as HTMLCanvasElement
  const ctx = canvasElement.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  const width = canvasElement.width
  const height = canvasElement.height
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // ピクセルごとにCMYK変換（プレビュー用にRGBに戻す）
  for (let i = 0; i < data.length; i += 4) {
    const rgb = { r: data[i], g: data[i + 1], b: data[i + 2] }
    const cmyk = rgbToCmyk(rgb)

    // CMYKからRGBに戻す（シミュレーション）
    const simulated = cmykToRgb(cmyk)
    data[i] = simulated.r
    data[i + 1] = simulated.g
    data[i + 2] = simulated.b
    // アルファは維持
  }

  ctx.putImageData(imageData, 0, 0)

  // DataURLとして取得
  const dataURL = canvasElement.toDataURL('image/png')
  const base64Data = dataURL.split(',')[1]
  const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

  return { imageData: imageBytes, width, height }
}

// CMYK PDF エクスポート
export async function exportAsCMYKPDF(
  canvas: Canvas,
  options: ExportOptions
): Promise<ExportResult> {
  const pdfDoc = await PDFDocument.create()

  // CMYK処理済み画像を取得
  const { imageData, width, height } = await processImageForCMYK(canvas)

  const page = pdfDoc.addPage([width, height])
  const pngImage = await pdfDoc.embedPng(imageData)

  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width,
    height,
  })

  // メタデータ追加
  pdfDoc.setTitle('CMYK Export')
  pdfDoc.setProducer('Canvas Studio')
  pdfDoc.setCreator('Canvas Studio CMYK Export')

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })

  return {
    blob,
    filename: `export_cmyk_${Date.now()}.pdf`,
    mimeType: 'application/pdf',
  }
}
```

---

### 8.9 テスト: エクスポート形式確認

**テストファイル:** `src/test/export.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Canvas, Rect } from 'fabric'
import {
  exportSlide,
  downloadBlob,
} from '../services/exportService'
import {
  rgbToCmyk,
  cmykToRgb,
  hexToRgb,
  rgbToHex,
} from '../services/cmykService'

describe('Phase 8: エクスポート機能', () => {
  let canvas: Canvas

  beforeEach(() => {
    const element = document.createElement('canvas')
    canvas = new Canvas(element, { width: 800, height: 600 })

    // テスト用オブジェクト追加
    const rect = new Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: '#3b82f6',
    })
    canvas.add(rect)
  })

  afterEach(() => {
    canvas.dispose()
  })

  describe('8.1-8.3 PNG エクスポート', () => {
    it('should export canvas as PNG blob', async () => {
      const result = await exportSlide(canvas, { format: 'png' })

      expect(result.blob).toBeInstanceOf(Blob)
      expect(result.mimeType).toBe('image/png')
      expect(result.filename).toMatch(/\.png$/)
    })

    it('should create valid PNG data URL', async () => {
      const dataURL = await canvas.toDataURL({ format: 'png' })

      expect(dataURL).toMatch(/^data:image\/png;base64,/)
    })
  })

  describe('8.4 JPEG エクスポート', () => {
    it('should export canvas as JPEG blob', async () => {
      const result = await exportSlide(canvas, {
        format: 'jpeg',
        quality: 0.8,
      })

      expect(result.blob).toBeInstanceOf(Blob)
      expect(result.mimeType).toBe('image/jpeg')
      expect(result.filename).toMatch(/\.jpg$/)
    })

    it('should respect quality setting', async () => {
      const highQuality = await exportSlide(canvas, {
        format: 'jpeg',
        quality: 1.0,
      })
      const lowQuality = await exportSlide(canvas, {
        format: 'jpeg',
        quality: 0.1,
      })

      // 高品質の方がファイルサイズが大きい
      expect(highQuality.blob.size).toBeGreaterThan(lowQuality.blob.size)
    })
  })

  describe('8.5 PDF エクスポート', () => {
    it('should export canvas as PDF blob', async () => {
      const result = await exportSlide(canvas, { format: 'pdf' })

      expect(result.blob).toBeInstanceOf(Blob)
      expect(result.mimeType).toBe('application/pdf')
      expect(result.filename).toMatch(/\.pdf$/)
    })

    it('should create valid PDF structure', async () => {
      const result = await exportSlide(canvas, { format: 'pdf' })
      const arrayBuffer = await result.blob.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)

      // PDFヘッダー確認
      const header = String.fromCharCode(...bytes.slice(0, 5))
      expect(header).toBe('%PDF-')
    })
  })

  describe('8.6 CMYK変換', () => {
    it('should convert RGB to CMYK correctly', () => {
      // 赤
      const red = rgbToCmyk({ r: 255, g: 0, b: 0 })
      expect(red.cyan).toBe(0)
      expect(red.magenta).toBe(100)
      expect(red.yellow).toBe(100)
      expect(red.key).toBe(0)

      // 緑
      const green = rgbToCmyk({ r: 0, g: 255, b: 0 })
      expect(green.cyan).toBe(100)
      expect(green.magenta).toBe(0)
      expect(green.yellow).toBe(100)
      expect(green.key).toBe(0)

      // 青
      const blue = rgbToCmyk({ r: 0, g: 0, b: 255 })
      expect(blue.cyan).toBe(100)
      expect(blue.magenta).toBe(100)
      expect(blue.yellow).toBe(0)
      expect(blue.key).toBe(0)
    })

    it('should convert white correctly', () => {
      const white = rgbToCmyk({ r: 255, g: 255, b: 255 })
      expect(white).toEqual({ cyan: 0, magenta: 0, yellow: 0, key: 0 })
    })

    it('should convert black correctly', () => {
      const black = rgbToCmyk({ r: 0, g: 0, b: 0 })
      expect(black).toEqual({ cyan: 0, magenta: 0, yellow: 0, key: 100 })
    })

    it('should round-trip RGB → CMYK → RGB', () => {
      const original = { r: 128, g: 64, b: 192 }
      const cmyk = rgbToCmyk(original)
      const restored = cmykToRgb(cmyk)

      // 丸め誤差を許容（±2）
      expect(Math.abs(restored.r - original.r)).toBeLessThanOrEqual(2)
      expect(Math.abs(restored.g - original.g)).toBeLessThanOrEqual(2)
      expect(Math.abs(restored.b - original.b)).toBeLessThanOrEqual(2)
    })
  })

  describe('8.7 Hex変換', () => {
    it('should convert hex to RGB', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('should convert RGB to hex', () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000')
      expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00')
      expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff')
    })
  })

  describe('downloadBlob', () => {
    it('should create and click download link', () => {
      const createObjectURLMock = vi.fn(() => 'blob:test')
      const revokeObjectURLMock = vi.fn()
      global.URL.createObjectURL = createObjectURLMock
      global.URL.revokeObjectURL = revokeObjectURLMock

      const clickMock = vi.fn()
      const appendChildMock = vi.fn()
      const removeChildMock = vi.fn()

      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: clickMock,
      } as unknown as HTMLAnchorElement)

      vi.spyOn(document.body, 'appendChild').mockImplementation(appendChildMock)
      vi.spyOn(document.body, 'removeChild').mockImplementation(removeChildMock)

      const blob = new Blob(['test'], { type: 'text/plain' })
      downloadBlob(blob, 'test.txt')

      expect(createObjectURLMock).toHaveBeenCalledWith(blob)
      expect(clickMock).toHaveBeenCalled()
      expect(revokeObjectURLMock).toHaveBeenCalled()
    })
  })
})
```

---

## 実装順序（推奨）

1. **8.1 exportService** - 基本サービス作成
2. **8.3 PNG** - PNGエクスポート実装
3. **8.4 JPEG** - JPEGエクスポート実装
4. **8.5 PDF** - PDFエクスポート実装
5. **8.2 ExportDialog** - UI実装
6. **8.6 cmykService** - CMYK変換実装
7. **8.7 CMYKPreview** - プレビューコンポーネント
8. **8.8 CMYK PDF** - CMYK対応PDF
9. **8.9 テスト** - 全機能テスト

---

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/services/exportService.ts` | 新規作成: エクスポートサービス |
| `src/services/cmykService.ts` | 新規作成: CMYK変換 |
| `src/components/export/ExportDialog.tsx` | 新規作成: エクスポートUI |
| `src/components/export/CMYKPreview.tsx` | 新規作成: CMYKプレビュー |
| `src/types/index.ts` | 既存: ExportOptions定義済み |
| `src/hooks/useCanvas.ts` | 既存: toDataURL使用 |
| `src/components/canvas/Toolbar.tsx` | 修正: エクスポートボタン追加 |

---

## 依存関係

```
8.1 exportService
    ├── 8.3 PNG
    ├── 8.4 JPEG
    └── 8.5 PDF
          ↓
    8.2 ExportDialog
          ↓
    8.6 cmykService
          ├── 8.7 CMYKPreview
          └── 8.8 CMYK PDF
          ↓
    8.9 テスト
```

---

## 注意事項

1. **非同期処理:** toDataURL()はPromiseを返すため await 必須
2. **メモリ管理:** 複数スライドPDF生成時は各キャンバスを dispose()
3. **ファイルサイズ:** 大きなキャンバスではメモリ使用量に注意
4. **CMYK制限:** pdf-libのCMYKサポートは限定的、RGBシミュレーションで代替
5. **ブラウザ互換:** toBlob()はすべてのモダンブラウザで対応

---

## 検証方法

1. **PNG出力:** エクスポート → ファイルが正しくダウンロード → 画像ビューアで確認
2. **JPEG出力:** 品質設定を変更 → ファイルサイズの変化を確認
3. **PDF出力:** 複数スライドをPDFエクスポート → PDFビューアで全ページ確認
4. **CMYK変換:** CMYKPreviewで色変換を視覚的に確認
5. **テスト実行:** `npm test` で全テストパス確認
