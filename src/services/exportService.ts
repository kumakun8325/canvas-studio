import { PDFDocument } from 'pdf-lib'
import type { Canvas } from 'fabric'
import type { ExportOptions } from '../types'

export interface ExportResult {
  blob: Blob
  filename: string
  mimeType: string
}

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
  _options: ExportOptions,
): Promise<ExportResult> {
  const pdfDoc = await PDFDocument.create()

  for (const canvas of canvases) {
    const width = canvas.width || 800
    const height = canvas.height || 600

    const page = pdfDoc.addPage([width, height])

    const dataURL = await canvas.toDataURL({
      format: 'png',
      multiplier: 1,
    })

    const base64Data = dataURL.split(',')[1]
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

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
