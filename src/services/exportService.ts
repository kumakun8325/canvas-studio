import { PDFDocument, rgb } from 'pdf-lib'
import type { Canvas } from 'fabric'
import type { ExportOptions } from '../types'
import { rgbToCmyk, cmykToRgb } from './cmykService'

export interface ExportResult {
  blob: Blob
  filename: string
  mimeType: string
}

// mm to points conversion (1mm = 2.834645669 points)
const MM_TO_POINTS = 2.834645669
const mmToPoints = (mm: number): number => mm * MM_TO_POINTS

export async function exportSlide(
  canvas: Canvas,
  options: ExportOptions,
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

async function exportAsJPEG(
  canvas: Canvas,
  quality: number,
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

async function exportAsPDF(
  canvases: Canvas[],
  options: ExportOptions,
): Promise<ExportResult> {
  const pdfDoc = await PDFDocument.create()
  const bleed = options.bleed ?? 0
  const trimMarks = options.trimMarks ?? false
  const cmyk = options.cmyk ?? false

  // トンボ用のマージン (mm)
  const trimMarkSize = trimMarks ? 10 : 0

  for (const canvas of canvases) {
    const contentWidth = canvas.width || 800
    const contentHeight = canvas.height || 600

    // bleedとトンボを考慮したページサイズ (points)
    const bleedPt = mmToPoints(bleed)
    const trimMarkPt = mmToPoints(trimMarkSize)
    const pageWidth = contentWidth + (bleedPt * 2) + (trimMarkPt * 2)
    const pageHeight = contentHeight + (bleedPt * 2) + (trimMarkPt * 2)

    const page = pdfDoc.addPage([pageWidth, pageHeight])

    let dataURL = await canvas.toDataURL({
      format: 'png',
      multiplier: 1,
    })

    // CMYKモードの場合、画像をCMYK風に変換
    if (cmyk) {
      dataURL = await convertToCmykSimulation(dataURL)
    }

    const base64Data = dataURL.split(',')[1]
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

    const pngImage = await pdfDoc.embedPng(imageBytes)

    // コンテンツの配置位置（トンボ + bleed分オフセット）
    const contentX = trimMarkPt + bleedPt
    const contentY = trimMarkPt + bleedPt

    page.drawImage(pngImage, {
      x: contentX,
      y: contentY,
      width: contentWidth,
      height: contentHeight,
    })

    // トンボを描画
    if (trimMarks) {
      drawTrimMarksOnPage(page, contentWidth, contentHeight, bleed, trimMarkSize)
    }
  }

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })

  return {
    blob,
    filename: `export_${Date.now()}.pdf`,
    mimeType: 'application/pdf',
  }
}

/**
 * 画像をCMYK風に変換（RGB→CMYK→RGB近似変換）
 * 印刷時の色味をシミュレートする
 */
async function convertToCmykSimulation(dataURL: string): Promise<string> {
  // テスト環境やSSR環境ではスキップ
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    return dataURL
  }

  return new Promise((resolve) => {
    const img = new Image()

    // タイムアウト処理（テスト環境対策）
    const timeout = setTimeout(() => {
      resolve(dataURL)
    }, 2000)

    img.onload = () => {
      clearTimeout(timeout)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(dataURL)
          return
        }

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // ピクセルごとにRGB→CMYK→RGB変換
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          // RGB → CMYK
          const cmyk = rgbToCmyk({ r, g, b })
          // CMYK → RGB (印刷色の近似)
          const rgbConverted = cmykToRgb(cmyk)

          data[i] = rgbConverted.r
          data[i + 1] = rgbConverted.g
          data[i + 2] = rgbConverted.b
          // アルファは維持
        }

        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch {
        resolve(dataURL)
      }
    }

    img.onerror = () => {
      clearTimeout(timeout)
      resolve(dataURL)
    }

    img.src = dataURL
  })
}

/**
 * PDFページにトンボを描画
 */
function drawTrimMarksOnPage(
  page: ReturnType<typeof PDFDocument.prototype.addPage>,
  contentWidth: number,
  contentHeight: number,
  bleed: number,
  trimMarkSize: number,
): void {
  const bleedPt = mmToPoints(bleed)
  const trimMarkPt = mmToPoints(trimMarkSize)
  const markLength = mmToPoints(8) // トンボの長さ
  const gap = mmToPoints(1) // 仕上がり線からのギャップ
  const lineWidth = 0.5

  // 仕上がり位置
  const finishLeft = trimMarkPt + bleedPt
  const finishRight = trimMarkPt + bleedPt + contentWidth
  const finishBottom = trimMarkPt + bleedPt
  const finishTop = trimMarkPt + bleedPt + contentHeight

  const color = rgb(0, 0, 0) // 黒

  // 左上コーナー
  page.drawLine({
    start: { x: finishLeft - markLength - gap, y: finishTop },
    end: { x: finishLeft - gap, y: finishTop },
    thickness: lineWidth,
    color,
  })
  page.drawLine({
    start: { x: finishLeft, y: finishTop + gap },
    end: { x: finishLeft, y: finishTop + markLength + gap },
    thickness: lineWidth,
    color,
  })

  // 右上コーナー
  page.drawLine({
    start: { x: finishRight + gap, y: finishTop },
    end: { x: finishRight + markLength + gap, y: finishTop },
    thickness: lineWidth,
    color,
  })
  page.drawLine({
    start: { x: finishRight, y: finishTop + gap },
    end: { x: finishRight, y: finishTop + markLength + gap },
    thickness: lineWidth,
    color,
  })

  // 左下コーナー
  page.drawLine({
    start: { x: finishLeft - markLength - gap, y: finishBottom },
    end: { x: finishLeft - gap, y: finishBottom },
    thickness: lineWidth,
    color,
  })
  page.drawLine({
    start: { x: finishLeft, y: finishBottom - gap },
    end: { x: finishLeft, y: finishBottom - markLength - gap },
    thickness: lineWidth,
    color,
  })

  // 右下コーナー
  page.drawLine({
    start: { x: finishRight + gap, y: finishBottom },
    end: { x: finishRight + markLength + gap, y: finishBottom },
    thickness: lineWidth,
    color,
  })
  page.drawLine({
    start: { x: finishRight, y: finishBottom - gap },
    end: { x: finishRight, y: finishBottom - markLength - gap },
    thickness: lineWidth,
    color,
  })
}

export function dataURLToBlob(dataURL: string): Blob {
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
