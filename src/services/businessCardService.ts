/**
 * Phase 9: 名刺用PDFエクスポートサービス
 *
 * 印刷入稿用の名刺PDF生成機能を提供する。
 * - 塗り足し（bleed）対応
 * - トンボ（trim marks）描画
 * - 印刷用DPI（300DPI）対応
 */

import { PDFDocument, PDFPage, rgb } from 'pdf-lib'
import type { Canvas } from 'fabric'

/**
 * 名刺サイズ定数（日本規格）
 */
export const BUSINESS_CARD = {
  WIDTH_MM: 91,
  HEIGHT_MM: 55,
  DEFAULT_BLEED_MM: 3,
  TRIM_MARK_SIZE_MM: 5,
  TRIM_MARK_LINE_WIDTH: 0.3,
  DPI_SCREEN: 96,
  DPI_PRINT: 300,
} as const

/**
 * mm → pixel 変換
 * @param mm - ミリメートル
 * @param dpi - 解像度（デフォルト: 96）
 * @returns ピクセル値
 */
export const mmToPixel = (mm: number, dpi: number = 96): number => {
  return Math.round((mm * dpi) / 25.4)
}

/**
 * mm → points 変換（PDF用）
 * @param mm - ミリメートル
 * @returns points値
 */
export const mmToPoints = (mm: number): number => {
  return mm * 2.834645669
}

/**
 * 印刷設定
 */
export interface PrintSettings {
  /** 塗り足し（mm） */
  bleed: number
  /** トンボ表示 */
  trimMarks: boolean
  /** レジストレーションマーク */
  registrationMarks: boolean
  /** CMYK変換 */
  cmyk: boolean
  /** 解像度 */
  dpi: 'screen' | 'print'
}

/**
 * デフォルト印刷設定
 */
export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  bleed: 3,
  trimMarks: true,
  registrationMarks: false,
  cmyk: false,
  dpi: 'print',
}

/**
 * キャンバスサイズ計算
 * 塗り足し込みのキャンバスサイズを計算する
 * @param bleed - 塗り足し（mm）
 * @param dpi - 解像度
 * @returns キャンバスサイズ（px）
 */
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

/**
 * トンボ描画
 * PDFページにトンボ（裁断マーク）を描画する
 * @param page - PDFページ
 * @param bleed - 塗り足し（mm）
 * @param trimMarkSize - トンボサイズ（mm）
 */
function drawTrimMarks(
  page: PDFPage,
  bleed: number,
  trimMarkSize: number
): void {
  const lineWidth = BUSINESS_CARD.TRIM_MARK_LINE_WIDTH
  const color = rgb(0, 0, 0) // 黒

  // 仕上がり位置（トンボ領域 + 塗り足しからの距離）
  const finishLeft = mmToPoints(trimMarkSize + bleed)
  const finishRight = mmToPoints(trimMarkSize + bleed + BUSINESS_CARD.WIDTH_MM)
  const finishBottom = mmToPoints(trimMarkSize + bleed)
  const finishTop = mmToPoints(trimMarkSize + bleed + BUSINESS_CARD.HEIGHT_MM)

  const markLength = mmToPoints(trimMarkSize)

  // 左上コーナー
  page.drawLine({
    start: { x: finishLeft - markLength, y: finishTop },
    end: { x: finishLeft - mmToPoints(1), y: finishTop },
    thickness: lineWidth,
    color,
  })
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

/**
 * 名刺用PDF生成
 * 印刷入稿用のPDFを生成する
 * @param canvas - Fabric.jsキャンバス
 * @param settings - 印刷設定
 * @returns PDF Blob
 * @throws Error キャンバス画像の埋め込みに失敗した場合
 */
export async function generateBusinessCardPDF(
  canvas: Canvas,
  settings: PrintSettings
): Promise<Blob> {
  // 入力値の検証
  if (settings.bleed < 0) {
    throw new Error('Bleed value must be non-negative')
  }
  const pdfDoc = await PDFDocument.create()

  // ページサイズ（塗り足し込み + トンボ領域）
  const bleed = settings.bleed
  const trimMarkSize = settings.trimMarks ? BUSINESS_CARD.TRIM_MARK_SIZE_MM : 0

  const pageWidth = mmToPoints(BUSINESS_CARD.WIDTH_MM + bleed * 2 + trimMarkSize * 2)
  const pageHeight = mmToPoints(BUSINESS_CARD.HEIGHT_MM + bleed * 2 + trimMarkSize * 2)

  const page = pdfDoc.addPage([pageWidth, pageHeight])

  // キャンバス画像を埋め込み
  const dataURL = await canvas.toDataURL({ format: 'png', multiplier: 1 })

  // dataURLからbase64データを抽出
  const base64Data = dataURL.includes(',') ? dataURL.split(',')[1] : dataURL
  const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

  // PNGとして埋め込みを試み、失敗した場合はJPEGを試みる
  let pngImage
  try {
    pngImage = await pdfDoc.embedPng(imageBytes)
  } catch {
    // PNGとして埋め込めない場合、別の方法を試す
    // ここではエラーを投げて、呼び出し元でハンドリングさせる
    throw new Error('Failed to embed image as PNG')
  }

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
