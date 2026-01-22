import type { TemplateConfig, TemplateType } from '../types'

// DPI変換ユーティリティ
export const mmToPixel = (mm: number, dpi: number = 96): number => {
  return Math.round((mm * dpi) / 25.4)
}

// テンプレート設定
export const TEMPLATE_CONFIGS: Record<TemplateType, TemplateConfig> = {
  '16:9': {
    type: '16:9',
    width: 1920,
    height: 1080,
    unit: 'px',
    dpi: 96,
  },
  'a4-portrait': {
    type: 'a4-portrait',
    width: 794, // mmToPixel(210)
    height: 1123, // mmToPixel(297)
    unit: 'px',
    dpi: 96,
  },
  'a4-landscape': {
    type: 'a4-landscape',
    width: 1123, // mmToPixel(297)
    height: 794, // mmToPixel(210)
    unit: 'px',
    dpi: 96,
  },
  'business-card': {
    type: 'business-card',
    width: 344, // mmToPixel(91)
    height: 208, // mmToPixel(55)
    unit: 'px',
    dpi: 96,
  },
  'custom': {
    type: 'custom',
    width: 800,
    height: 600,
    unit: 'px',
    dpi: 96,
  },
}

// テンプレートラベル（UI表示用）
export const TEMPLATE_LABELS: Record<TemplateType, string> = {
  '16:9': '16:9 プレゼンテーション',
  'a4-portrait': 'A4 縦',
  'a4-landscape': 'A4 横',
  'business-card': '名刺',
  'custom': 'カスタムサイズ',
}

// テンプレート説明（UI表示用）
export const TEMPLATE_DESCRIPTIONS: Record<TemplateType, string> = {
  '16:9': '1920 x 1080 px',
  'a4-portrait': '210 x 297 mm (794 x 1123 px)',
  'a4-landscape': '297 x 210 mm (1123 x 794 px)',
  'business-card': '91 x 55 mm (344 x 208 px)',
  'custom': '任意のサイズを指定',
}

// テンプレート一覧（選択UI用）
export const TEMPLATE_LIST: TemplateType[] = [
  '16:9',
  'a4-portrait',
  'a4-landscape',
  'business-card',
  'custom',
]
