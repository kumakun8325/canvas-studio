import { describe, it, expect } from 'vitest'
import {
  TEMPLATE_CONFIGS,
  TEMPLATE_LABELS,
  TEMPLATE_DESCRIPTIONS,
  TEMPLATE_LIST,
  mmToPixel,
} from '../constants/templates'

describe('Phase 7: テンプレート機能', () => {
  describe('7.1 templates.ts 定数', () => {
    it('should have all template types defined', () => {
      expect(TEMPLATE_CONFIGS['16:9']).toBeDefined()
      expect(TEMPLATE_CONFIGS['a4-portrait']).toBeDefined()
      expect(TEMPLATE_CONFIGS['a4-landscape']).toBeDefined()
      expect(TEMPLATE_CONFIGS['business-card']).toBeDefined()
      expect(TEMPLATE_CONFIGS['custom']).toBeDefined()
    })

    it('should calculate correct pixel sizes for A4', () => {
      // A4: 210 x 297 mm @ 96 DPI
      expect(mmToPixel(210)).toBe(794)
      expect(mmToPixel(297)).toBe(1123)
    })

    it('should calculate correct pixel sizes for business card', () => {
      // 名刺: 91 x 55 mm @ 96 DPI
      expect(mmToPixel(91)).toBe(344)
      expect(mmToPixel(55)).toBe(208)
    })

    it('should have all template labels', () => {
      expect(TEMPLATE_LABELS['16:9']).toBe('16:9 プレゼンテーション')
      expect(TEMPLATE_LABELS['a4-portrait']).toBe('A4 縦')
      expect(TEMPLATE_LABELS['a4-landscape']).toBe('A4 横')
      expect(TEMPLATE_LABELS['business-card']).toBe('名刺')
      expect(TEMPLATE_LABELS['custom']).toBe('カスタムサイズ')
    })

    it('should have all template descriptions', () => {
      expect(TEMPLATE_DESCRIPTIONS['16:9']).toBe('1920 x 1080 px')
      expect(TEMPLATE_DESCRIPTIONS['a4-portrait']).toBe('210 x 297 mm (794 x 1123 px)')
      expect(TEMPLATE_DESCRIPTIONS['a4-landscape']).toBe('297 x 210 mm (1123 x 794 px)')
      expect(TEMPLATE_DESCRIPTIONS['business-card']).toBe('91 x 55 mm (344 x 208 px)')
      expect(TEMPLATE_DESCRIPTIONS['custom']).toBe('任意のサイズを指定')
    })

    it('should have template list with all templates', () => {
      expect(TEMPLATE_LIST).toContain('16:9')
      expect(TEMPLATE_LIST).toContain('a4-portrait')
      expect(TEMPLATE_LIST).toContain('a4-landscape')
      expect(TEMPLATE_LIST).toContain('business-card')
      expect(TEMPLATE_LIST).toContain('custom')
    })
  })

  describe('7.3-7.6 テンプレートサイズ', () => {
    it('16:9 should be 1920x1080', () => {
      const config = TEMPLATE_CONFIGS['16:9']
      expect(config.width).toBe(1920)
      expect(config.height).toBe(1080)
      expect(config.type).toBe('16:9')
      expect(config.unit).toBe('px')
      expect(config.dpi).toBe(96)
    })

    it('A4 portrait should be 794x1123', () => {
      const config = TEMPLATE_CONFIGS['a4-portrait']
      expect(config.width).toBe(794)
      expect(config.height).toBe(1123)
      expect(config.type).toBe('a4-portrait')
      expect(config.unit).toBe('px')
      expect(config.dpi).toBe(96)
    })

    it('A4 landscape should be 1123x794', () => {
      const config = TEMPLATE_CONFIGS['a4-landscape']
      expect(config.width).toBe(1123)
      expect(config.height).toBe(794)
      expect(config.type).toBe('a4-landscape')
      expect(config.unit).toBe('px')
      expect(config.dpi).toBe(96)
    })

    it('business card should be 344x208', () => {
      const config = TEMPLATE_CONFIGS['business-card']
      expect(config.width).toBe(344)
      expect(config.height).toBe(208)
      expect(config.type).toBe('business-card')
      expect(config.unit).toBe('px')
      expect(config.dpi).toBe(96)
    })

    it('custom should have default 800x600', () => {
      const config = TEMPLATE_CONFIGS['custom']
      expect(config.width).toBe(800)
      expect(config.height).toBe(600)
      expect(config.type).toBe('custom')
      expect(config.unit).toBe('px')
      expect(config.dpi).toBe(96)
    })
  })
})
