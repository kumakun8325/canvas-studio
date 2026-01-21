# Phase 9: 名刺用PDF - 実装タスク

## 概要

Phase 9では、印刷入稿用の名刺PDFエクスポート機能を実装する。
- 塗り足し（bleed）対応
- トンボ（trim marks）描画
- 印刷用DPI（300DPI）対応

## 前提条件

- Phase 7（テンプレート）完了済み
- Phase 8（エクスポート）完了済み
- pdf-lib 1.17.1 使用

---

## 名刺仕様

### 標準サイズ（日本規格）

| 項目 | サイズ |
|------|--------|
| 仕上がりサイズ | 91 × 55 mm |
| 塗り足し | 3 mm（各辺） |
| 塗り足し込みサイズ | 97 × 61 mm |

### ピクセル換算

| DPI | 仕上がり | 塗り足し込み |
|-----|---------|-------------|
| 96 DPI（スクリーン） | 344 × 208 px | 367 × 230 px |
| 300 DPI（印刷） | 1074 × 650 px | 1145 × 720 px |

### 単位変換

```typescript
// mm → px
const mmToPixel = (mm: number, dpi: number = 96): number => {
  return Math.round((mm * dpi) / 25.4)
}

// mm → points（PDF用）
const mmToPoints = (mm: number): number => {
  return mm * 2.834645669
}
```

---

## タスク一覧

### 9.1 businessCardService 実装

**目的:** 名刺PDF生成の中核サービス

**実装場所:** `src/services/businessCardService.ts`（新規作成）

**実装:**

```typescript
import { PDFDocument, PDFPage, rgb } from 'pdf-lib'
import type { Canvas } from 'fabric'

// 定数
export const BUSINESS_CARD = {
  WIDTH_MM: 91,
  HEIGHT_MM: 55,
  DEFAULT_BLEED_MM: 3,
  TRIM_MARK_SIZE_MM: 5,
  TRIM_MARK_LINE_WIDTH: 0.3,
  DPI_SCREEN: 96,
  DPI_PRINT: 300,
} as const

// 単位変換
export const mmToPixel = (mm: number, dpi: number = 96): number => {
  return Math.round((mm * dpi) / 25.4)
}

export const mmToPoints = (mm: number): number => {
  return mm * 2.834645669
}

// 印刷設定
export interface PrintSettings {
  bleed: number           // 塗り足し（mm）
  trimMarks: boolean      // トンボ表示
  registrationMarks: boolean  // レジストレーションマーク
  cmyk: boolean           // CMYK変換
  dpi: 'screen' | 'print' // 解像度
}

// デフォルト設定
export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  bleed: 3,
  trimMarks: true,
  registrationMarks: false,
  cmyk: false,
  dpi: 'print',
}

// キャンバスサイズ計算
export function calculateCanvasSize(
  bleed: number,
  dpi: 'screen' | 'print' = 'screen'
): { width: number; height: number } {
  const dpiValue = dpi === 'print' ? BUSINESS_CARD.DPI_PRINT : BUSINESS_CARD.DPI_SCREEN
  const totalWidth = BUSINESS_CARD.WIDTH_MM + bleed * 2
  const totalHeight = BUSINESS_CARD.HEIGHT_MM + bleed * 2

  return {
    width: mmToPixel(totalWidth, dpiValue),
    height: mmToPixel(totalHeight, dpiValue),
  }
}

// PDF生成
export async function generateBusinessCardPDF(
  canvas: Canvas,
  settings: PrintSettings
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()

  // ページサイズ（塗り足し込み + トンボ領域）
  const bleed = settings.bleed
  const trimMarkSize = settings.trimMarks ? BUSINESS_CARD.TRIM_MARK_SIZE_MM : 0

  const pageWidth = mmToPoints(BUSINESS_CARD.WIDTH_MM + bleed * 2 + trimMarkSize * 2)
  const pageHeight = mmToPoints(BUSINESS_CARD.HEIGHT_MM + bleed * 2 + trimMarkSize * 2)

  const page = pdfDoc.addPage([pageWidth, pageHeight])

  // キャンバス画像を埋め込み
  const dataURL = await canvas.toDataURL({ format: 'png', multiplier: 1 })
  const base64Data = dataURL.split(',')[1]
  const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))
  const pngImage = await pdfDoc.embedPng(imageBytes)

  // 画像描画位置（トンボ領域分オフセット）
  const imageX = mmToPoints(trimMarkSize)
  const imageY = mmToPoints(trimMarkSize)
  const imageWidth = mmToPoints(BUSINESS_CARD.WIDTH_MM + bleed * 2)
  const imageHeight = mmToPoints(BUSINESS_CARD.HEIGHT_MM + bleed * 2)

  page.drawImage(pngImage, {
    x: imageX,
    y: imageY,
    width: imageWidth,
    height: imageHeight,
  })

  // トンボ描画
  if (settings.trimMarks) {
    drawTrimMarks(page, bleed, trimMarkSize)
  }

  // メタデータ
  pdfDoc.setTitle('名刺 - Business Card')
  pdfDoc.setProducer('Canvas Studio')
  pdfDoc.setCreator('Canvas Studio Business Card Export')
  pdfDoc.setCreationDate(new Date())

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}
```

---

### 9.2 塗り足し（3mm）設定

**目的:** 印刷時の裁断誤差に対応するための余白設定

**塗り足しの仕組み:**

```
┌─────────────────────────────────┐
│         塗り足し 3mm            │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │    仕上がり領域           │  │
│  │    91 × 55 mm            │  │
│  │                           │  │
│  └───────────────────────────┘  │
│         塗り足し 3mm            │
└─────────────────────────────────┘
          97 × 61 mm
```

**UI実装:**

```typescript
// PrintSettingsPanel内
<div className="mb-4">
  <label className="block text-sm font-medium mb-2">
    塗り足し (mm)
  </label>
  <select
    value={settings.bleed}
    onChange={(e) => onChange({ ...settings, bleed: Number(e.target.value) })}
    className="w-full border rounded px-3 py-2"
  >
    <option value={2}>2mm（最小）</option>
    <option value={3}>3mm（標準）</option>
    <option value={5}>5mm（推奨）</option>
  </select>
  <p className="text-xs text-gray-500 mt-1">
    印刷会社の指定に合わせてください
  </p>
</div>
```

---

### 9.3 トンボ描画機能

**目的:** 裁断位置を示すマークの描画

**トンボの構造:**

```
    ┃         ┃
────┛         ┗────  ← 上辺トンボ

    ┌─────────┐
    │         │
────┤ 仕上がり ├────  ← 左右トンボ
    │  領域   │
    └─────────┘

────┓         ┏────  ← 下辺トンボ
    ┃         ┃
```

**実装:**

```typescript
function drawTrimMarks(
  page: PDFPage,
  bleed: number,
  trimMarkSize: number
): void {
  const lineWidth = BUSINESS_CARD.TRIM_MARK_LINE_WIDTH
  const color = rgb(0, 0, 0)  // 黒

  // 仕上がり位置（トンボ領域 + 塗り足しからの距離）
  const finishLeft = mmToPoints(trimMarkSize + bleed)
  const finishRight = mmToPoints(trimMarkSize + bleed + BUSINESS_CARD.WIDTH_MM)
  const finishBottom = mmToPoints(trimMarkSize + bleed)
  const finishTop = mmToPoints(trimMarkSize + bleed + BUSINESS_CARD.HEIGHT_MM)

  const markLength = mmToPoints(trimMarkSize)

  // 左上コーナー
  // 水平線（左から内側へ）
  page.drawLine({
    start: { x: finishLeft - markLength, y: finishTop },
    end: { x: finishLeft - mmToPoints(1), y: finishTop },
    thickness: lineWidth,
    color,
  })
  // 垂直線（上から内側へ）
  page.drawLine({
    start: { x: finishLeft, y: finishTop + markLength },
    end: { x: finishLeft, y: finishTop + mmToPoints(1) },
    thickness: lineWidth,
    color,
  })

  // 右上コーナー
  page.drawLine({
    start: { x: finishRight + mmToPoints(1), y: finishTop },
    end: { x: finishRight + markLength, y: finishTop },
    thickness: lineWidth,
    color,
  })
  page.drawLine({
    start: { x: finishRight, y: finishTop + markLength },
    end: { x: finishRight, y: finishTop + mmToPoints(1) },
    thickness: lineWidth,
    color,
  })

  // 左下コーナー
  page.drawLine({
    start: { x: finishLeft - markLength, y: finishBottom },
    end: { x: finishLeft - mmToPoints(1), y: finishBottom },
    thickness: lineWidth,
    color,
  })
  page.drawLine({
    start: { x: finishLeft, y: finishBottom - markLength },
    end: { x: finishLeft, y: finishBottom - mmToPoints(1) },
    thickness: lineWidth,
    color,
  })

  // 右下コーナー
  page.drawLine({
    start: { x: finishRight + mmToPoints(1), y: finishBottom },
    end: { x: finishRight + markLength, y: finishBottom },
    thickness: lineWidth,
    color,
  })
  page.drawLine({
    start: { x: finishRight, y: finishBottom - markLength },
    end: { x: finishRight, y: finishBottom - mmToPoints(1) },
    thickness: lineWidth,
    color,
  })
}
```

---

### 9.4 名刺用PDFエクスポート

**目的:** 印刷入稿用PDFの生成とダウンロード

**exportServiceとの統合:**

```typescript
// src/services/exportService.ts に追加

import { generateBusinessCardPDF, PrintSettings } from './businessCardService'

export async function exportSlide(
  canvas: Canvas,
  options: ExportOptions
): Promise<ExportResult> {
  // 名刺PDF判定
  if (options.format === 'pdf' && options.businessCard) {
    const blob = await generateBusinessCardPDF(canvas, options.printSettings!)
    return {
      blob,
      filename: `business_card_${Date.now()}.pdf`,
      mimeType: 'application/pdf',
    }
  }

  // 通常のエクスポート処理...
}
```

**型定義の拡張:**

```typescript
// src/types/index.ts に追加

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'pdf'
  quality?: number
  cmyk?: boolean
  bleed?: number
  trimMarks?: boolean
  // Phase 9追加
  businessCard?: boolean
  printSettings?: PrintSettings
}
```

---

### 9.5 印刷用PDF設定UI

**目的:** 印刷設定を行うUIパネル

**実装場所:** `src/components/export/PrintSettingsPanel.tsx`（新規作成）

**実装:**

```typescript
import { useState } from 'react'
import type { PrintSettings } from '../../services/businessCardService'
import { DEFAULT_PRINT_SETTINGS } from '../../services/businessCardService'

interface PrintSettingsPanelProps {
  settings: PrintSettings
  onChange: (settings: PrintSettings) => void
}

export function PrintSettingsPanel({
  settings,
  onChange,
}: PrintSettingsPanelProps) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="font-medium mb-3">印刷設定（名刺）</h3>

      {/* 塗り足し */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">塗り足し</label>
        <select
          value={settings.bleed}
          onChange={(e) =>
            onChange({ ...settings, bleed: Number(e.target.value) })
          }
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value={2}>2mm</option>
          <option value={3}>3mm（標準）</option>
          <option value={5}>5mm</option>
        </select>
      </div>

      {/* トンボ */}
      <div className="mb-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.trimMarks}
            onChange={(e) =>
              onChange({ ...settings, trimMarks: e.target.checked })
            }
          />
          <span className="text-sm">トンボ（裁断マーク）</span>
        </label>
      </div>

      {/* レジストレーションマーク */}
      <div className="mb-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.registrationMarks}
            onChange={(e) =>
              onChange({ ...settings, registrationMarks: e.target.checked })
            }
          />
          <span className="text-sm">レジストレーションマーク</span>
        </label>
      </div>

      {/* CMYK */}
      <div className="mb-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.cmyk}
            onChange={(e) =>
              onChange({ ...settings, cmyk: e.target.checked })
            }
          />
          <span className="text-sm">CMYK変換（印刷向け）</span>
        </label>
      </div>

      {/* DPI */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">解像度</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="dpi"
              value="screen"
              checked={settings.dpi === 'screen'}
              onChange={() => onChange({ ...settings, dpi: 'screen' })}
            />
            <span className="text-sm">96 DPI（確認用）</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="dpi"
              value="print"
              checked={settings.dpi === 'print'}
              onChange={() => onChange({ ...settings, dpi: 'print' })}
            />
            <span className="text-sm">300 DPI（印刷用）</span>
          </label>
        </div>
      </div>

      {/* プレビュー */}
      <div className="mt-4 pt-4 border-t">
        <BleedPreview
          width={91}
          height={55}
          bleed={settings.bleed}
          showTrimMarks={settings.trimMarks}
        />
      </div>
    </div>
  )
}

// 塗り足しプレビュー
function BleedPreview({
  width,
  height,
  bleed,
  showTrimMarks,
}: {
  width: number
  height: number
  bleed: number
  showTrimMarks: boolean
}) {
  const scale = 1.5  // 表示スケール
  const totalWidth = (width + bleed * 2) * scale
  const totalHeight = (height + bleed * 2) * scale
  const bleedPx = bleed * scale

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-gray-500 mb-2">
        仕上がり: {width}×{height}mm / 塗り足し込み: {width + bleed * 2}×{height + bleed * 2}mm
      </div>
      <div
        className="relative border border-gray-300"
        style={{ width: totalWidth, height: totalHeight }}
      >
        {/* 塗り足し領域（赤） */}
        <div
          className="absolute bg-red-100 border border-red-300"
          style={{
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
          }}
        />
        {/* 仕上がり領域（白） */}
        <div
          className="absolute bg-white border-2 border-blue-500"
          style={{
            left: bleedPx,
            top: bleedPx,
            width: width * scale,
            height: height * scale,
          }}
        />
        {/* トンボ */}
        {showTrimMarks && (
          <>
            {/* 左上 */}
            <div
              className="absolute bg-black"
              style={{ left: 0, top: bleedPx, width: bleedPx - 2, height: 1 }}
            />
            <div
              className="absolute bg-black"
              style={{ left: bleedPx, top: 0, width: 1, height: bleedPx - 2 }}
            />
            {/* 右上 */}
            <div
              className="absolute bg-black"
              style={{ right: 0, top: bleedPx, width: bleedPx - 2, height: 1 }}
            />
            <div
              className="absolute bg-black"
              style={{ right: bleedPx, top: 0, width: 1, height: bleedPx - 2 }}
            />
            {/* 左下 */}
            <div
              className="absolute bg-black"
              style={{ left: 0, bottom: bleedPx, width: bleedPx - 2, height: 1 }}
            />
            <div
              className="absolute bg-black"
              style={{ left: bleedPx, bottom: 0, width: 1, height: bleedPx - 2 }}
            />
            {/* 右下 */}
            <div
              className="absolute bg-black"
              style={{ right: 0, bottom: bleedPx, width: bleedPx - 2, height: 1 }}
            />
            <div
              className="absolute bg-black"
              style={{ right: bleedPx, bottom: 0, width: 1, height: bleedPx - 2 }}
            />
          </>
        )}
      </div>
      <div className="text-xs text-gray-400 mt-1">
        赤: 塗り足し / 青枠: 仕上がり位置
      </div>
    </div>
  )
}
```

**ExportDialogとの統合:**

```typescript
// ExportDialog.tsx に追加

import { PrintSettingsPanel } from './PrintSettingsPanel'
import { DEFAULT_PRINT_SETTINGS } from '../../services/businessCardService'

// テンプレートが名刺の場合に表示
{templateType === 'business-card' && format === 'pdf' && (
  <PrintSettingsPanel
    settings={printSettings}
    onChange={setPrintSettings}
  />
)}
```

---

### 9.6 テスト: 名刺PDF出力確認

**テストファイル:** `src/test/businessCard.test.ts`

```typescript
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
  })

  afterEach(() => {
    canvas.dispose()
  })

  describe('9.1 定数と計算', () => {
    it('should have correct business card dimensions', () => {
      expect(BUSINESS_CARD.WIDTH_MM).toBe(91)
      expect(BUSINESS_CARD.HEIGHT_MM).toBe(55)
      expect(BUSINESS_CARD.DEFAULT_BLEED_MM).toBe(3)
    })

    it('should convert mm to pixels correctly (96 DPI)', () => {
      expect(mmToPixel(91, 96)).toBe(344)
      expect(mmToPixel(55, 96)).toBe(208)
      expect(mmToPixel(97, 96)).toBe(367)
      expect(mmToPixel(61, 96)).toBe(230)
    })

    it('should convert mm to pixels correctly (300 DPI)', () => {
      expect(mmToPixel(91, 300)).toBe(1074)
      expect(mmToPixel(55, 300)).toBe(650)
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
      expect(size.width).toBe(367)  // 97mm @ 96DPI
      expect(size.height).toBe(230) // 61mm @ 96DPI
    })

    it('should calculate canvas size with bleed (print)', () => {
      const size = calculateCanvasSize(3, 'print')
      expect(size.width).toBe(1145)  // 97mm @ 300DPI
      expect(size.height).toBe(720)  // 61mm @ 300DPI
    })

    it('should handle different bleed values', () => {
      const size2mm = calculateCanvasSize(2, 'screen')
      const size5mm = calculateCanvasSize(5, 'screen')

      expect(size2mm.width).toBeLessThan(size5mm.width)
      expect(size2mm.height).toBeLessThan(size5mm.height)
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
      const arrayBuffer = await blob.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)

      const header = String.fromCharCode(...bytes.slice(0, 5))
      expect(header).toBe('%PDF-')
    })

    it('should respect print settings', async () => {
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
})
```

---

## 実装順序（推奨）

1. **9.1 businessCardService** - 定数、計算関数、基本構造
2. **9.2 塗り足し設定** - UI追加
3. **9.3 トンボ描画** - drawTrimMarks関数実装
4. **9.4 PDF生成** - generateBusinessCardPDF完成
5. **9.5 印刷設定UI** - PrintSettingsPanel、ExportDialog統合
6. **9.6 テスト** - 全機能テスト

---

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/services/businessCardService.ts` | 新規作成: 名刺PDF生成 |
| `src/components/export/PrintSettingsPanel.tsx` | 新規作成: 印刷設定UI |
| `src/components/export/ExportDialog.tsx` | 修正: 名刺設定統合 |
| `src/services/exportService.ts` | 修正: 名刺PDF対応 |
| `src/types/index.ts` | 修正: PrintSettings型追加 |
| `src/constants/templates.ts` | 確認: business-card設定 |

---

## 依存関係

```
Phase 7 (テンプレート: business-card)
    ↓
Phase 8 (exportService)
    ↓
9.1 businessCardService
    ├── 9.2 塗り足し計算
    └── 9.3 トンボ描画
          ↓
    9.4 PDF生成
          ↓
    9.5 印刷設定UI
          ↓
    9.6 テスト
```

---

## 注意事項

1. **単位の一貫性:** mm → points（PDF）、mm → px（Canvas）の変換に注意
2. **DPI管理:** スクリーン用（96DPI）と印刷用（300DPI）を明確に区別
3. **トンボ位置:** 仕上がり位置から外側に描画、塗り足しの外側
4. **CMYK:** Phase 8のcmykServiceと連携
5. **印刷会社の仕様:** 塗り足し量は印刷会社により異なる場合あり

---

## 検証方法

1. **サイズ確認:** 生成PDFをAdobe Acrobat等で開き、ページサイズ確認
2. **トンボ確認:** 4隅のトンボが正しい位置に表示
3. **塗り足し確認:** 仕上がりサイズから3mm外側まで描画領域あり
4. **印刷テスト:** 実際に印刷して裁断位置を確認（推奨）
5. **テスト実行:** `npm test` で全テストパス確認
