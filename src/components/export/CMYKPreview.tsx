import { useMemo } from 'react'
import {
  rgbToCmyk,
  cmykToRgb,
  hexToRgb,
  rgbToHex,
} from '../../services/cmykService'

interface CMYKPreviewProps {
  color: string
}

export function CMYKPreview({ color }: CMYKPreviewProps) {
  const { cmyk, simulatedHex } = useMemo(() => {
    const rgb = hexToRgb(color)
    const cmyk = rgbToCmyk(rgb)
    const simulatedRgb = cmykToRgb(cmyk)
    const simulatedHex = rgbToHex(simulatedRgb)

    return { cmyk, simulatedHex }
  }, [color])

  return (
    <div className="p-4 border dark:border-gray-700 rounded-lg">
      <h4 className="font-medium dark:text-gray-100 mb-3">CMYK プレビュー</h4>

      <div className="flex gap-4 mb-3">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded border"
            style={{ backgroundColor: color }}
          />
          <div className="text-xs mt-1">RGB</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{color}</div>
        </div>

        <div className="flex items-center text-gray-400 dark:text-gray-500">→</div>

        <div className="text-center">
          <div
            className="w-16 h-16 rounded border"
            style={{ backgroundColor: simulatedHex }}
          />
          <div className="text-xs mt-1">CMYK</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{simulatedHex}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        <div>
          <div className="font-medium text-cyan-600 dark:text-cyan-400">C</div>
          <div>{cmyk.cyan}%</div>
        </div>
        <div>
          <div className="font-medium text-pink-600 dark:text-pink-400">M</div>
          <div>{cmyk.magenta}%</div>
        </div>
        <div>
          <div className="font-medium text-yellow-600 dark:text-yellow-400">Y</div>
          <div>{cmyk.yellow}%</div>
        </div>
        <div>
          <div className="font-medium text-gray-800 dark:text-gray-200">K</div>
          <div>{cmyk.key}%</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        ※ 画面表示はRGBシミュレーションです。実際の印刷色とは異なる場合があります。
      </p>
    </div>
  )
}
