/**
 * Phase 9: 名刺印刷設定パネル
 *
 * 名刺PDFエクスポート時の印刷設定を行うUIコンポーネント。
 * - 塗り足し（bleed）設定
 * - トンボ（trim marks）設定
 * - レジストレーションマーク
 * - CMYK変換
 * - 解像度設定
 */

import type { PrintSettings } from '../../services/businessCardService'
import { BUSINESS_CARD } from '../../services/businessCardService'

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
          width={BUSINESS_CARD.WIDTH_MM}
          height={BUSINESS_CARD.HEIGHT_MM}
          bleed={settings.bleed}
          showTrimMarks={settings.trimMarks}
        />
      </div>
    </div>
  )
}

/**
 * 塗り足しプレビュー
 * 名刺の仕上がり領域と塗り足し領域を視覚的に表示する
 */
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
  const scale = 1.5 // 表示スケール
  const totalWidth = (width + bleed * 2) * scale
  const totalHeight = (height + bleed * 2) * scale
  const bleedPx = bleed * scale

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-gray-500 mb-2">
        仕上がり: {width}×{height}mm / 塗り足し込み: {width + bleed * 2}×{height + bleed * 2}mm
      </div>
      <div
        className="relative border border-gray-300 bg-white"
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
              style={{ left: 0, top: bleedPx, width: Math.max(0, bleedPx - 2), height: 1 }}
            />
            <div
              className="absolute bg-black"
              style={{ left: bleedPx, top: 0, width: 1, height: Math.max(0, bleedPx - 2) }}
            />
            {/* 右上 */}
            <div
              className="absolute bg-black"
              style={{ right: 0, top: bleedPx, width: Math.max(0, bleedPx - 2), height: 1 }}
            />
            <div
              className="absolute bg-black"
              style={{ right: bleedPx, top: 0, width: 1, height: Math.max(0, bleedPx - 2) }}
            />
            {/* 左下 */}
            <div
              className="absolute bg-black"
              style={{ left: 0, bottom: bleedPx, width: Math.max(0, bleedPx - 2), height: 1 }}
            />
            <div
              className="absolute bg-black"
              style={{ left: bleedPx, bottom: 0, width: 1, height: Math.max(0, bleedPx - 2) }}
            />
            {/* 右下 */}
            <div
              className="absolute bg-black"
              style={{ right: 0, bottom: bleedPx, width: Math.max(0, bleedPx - 2), height: 1 }}
            />
            <div
              className="absolute bg-black"
              style={{ right: bleedPx, bottom: 0, width: 1, height: Math.max(0, bleedPx - 2) }}
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
