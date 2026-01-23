import { useState } from 'react'
import type { ExportOptions } from '../../types'

interface ExportDialogProps {
  isOpen: boolean
  onExport: (options: ExportOptions) => Promise<void>
  onClose: () => void
}

type ExportFormat = 'png' | 'jpeg' | 'pdf'

export function ExportDialog({
  isOpen,
  onExport,
  onClose,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('png')
  const [quality, setQuality] = useState(92)
  const [cmyk, setCmyk] = useState(false)
  const [bleed, setBleed] = useState(3)
  const [trimMarks, setTrimMarks] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const options: ExportOptions = {
        format,
        quality: quality / 100,
      }

      // PDF形式の場合のみCMYK、bleed、trimMarksオプションを追加
      if (format === 'pdf') {
        options.cmyk = cmyk
        options.bleed = bleed
        options.trimMarks = trimMarks
      }

      await onExport(options)
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

        {format === 'pdf' && (
          <div className="mb-4 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cmyk"
                checked={cmyk}
                onChange={(e) => setCmyk(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="cmyk" className="text-sm">
                CMYK色空間で出力（印刷用）
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                塗り足し（bleed）: {bleed}mm
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={bleed}
                onChange={(e) => setBleed(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                印刷時の断ち落としを考慮した余白
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="trimMarks"
                checked={trimMarks}
                onChange={(e) => setTrimMarks(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="trimMarks" className="text-sm">
                トンボ（トリムマーク）を表示
              </label>
            </div>
          </div>
        )}

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
