import { useState } from 'react'
import type { TemplateType, TemplateConfig } from '../../types'
import {
  TEMPLATE_CONFIGS,
  TEMPLATE_LABELS,
  TEMPLATE_DESCRIPTIONS,
  TEMPLATE_LIST,
} from '../../constants/templates'

interface TemplateSelectorProps {
  onSelect: (template: TemplateType, config: TemplateConfig) => void
  onCancel?: () => void
  showCustomOption?: boolean
}

export function TemplateSelector({
  onSelect,
  onCancel,
  showCustomOption = true,
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('16:9')
  const [customWidth, setCustomWidth] = useState(800)
  const [customHeight, setCustomHeight] = useState(600)

  const templates = showCustomOption
    ? TEMPLATE_LIST
    : TEMPLATE_LIST.filter((t) => t !== 'custom')

  const handleConfirm = () => {
    if (selectedTemplate === 'custom') {
      const customConfig: TemplateConfig = {
        type: 'custom',
        width: customWidth,
        height: customHeight,
        unit: 'px',
        dpi: 96,
      }
      onSelect('custom', customConfig)
    } else {
      onSelect(selectedTemplate, TEMPLATE_CONFIGS[selectedTemplate])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold dark:text-gray-100 mb-4">テンプレートを選択</h2>

        {/* テンプレート一覧 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {templates.map((template) => (
            <button
              key={template}
              onClick={() => setSelectedTemplate(template)}
              className={`
                p-4 border rounded-lg text-left transition-all
                ${
                  selectedTemplate === template
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-500'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }
              `}
            >
              <div className="font-medium dark:text-gray-100">{TEMPLATE_LABELS[template]}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {TEMPLATE_DESCRIPTIONS[template]}
              </div>
            </button>
          ))}
        </div>

        {/* カスタムサイズ入力 */}
        {selectedTemplate === 'custom' && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm font-medium dark:text-gray-100 mb-2">カスタムサイズ (px)</div>
            <div className="flex gap-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">幅</label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  min={100}
                  max={4096}
                  className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">高さ</label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  min={100}
                  max={4096}
                  className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* プレビュー */}
        <div className="mb-4 flex justify-center">
          <TemplatePreview
            width={
              selectedTemplate === 'custom'
                ? customWidth
                : TEMPLATE_CONFIGS[selectedTemplate].width
            }
            height={
              selectedTemplate === 'custom'
                ? customHeight
                : TEMPLATE_CONFIGS[selectedTemplate].height
            }
          />
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              キャンセル
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            作成
          </button>
        </div>
      </div>
    </div>
  )
}

// プレビューコンポーネント
function TemplatePreview({ width, height }: { width: number; height: number }) {
  const maxSize = 150
  const aspectRatio = width / height
  const previewWidth = aspectRatio > 1 ? maxSize : maxSize * aspectRatio
  const previewHeight = aspectRatio > 1 ? maxSize / aspectRatio : maxSize

  return (
    <div
      className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm"
      style={{
        width: previewWidth,
        height: previewHeight,
      }}
    >
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">
        {width} x {height}
      </div>
    </div>
  )
}
