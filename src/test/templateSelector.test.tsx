import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TemplateSelector } from '../components/templates/TemplateSelector'
import {
  TEMPLATE_CONFIGS,
  TEMPLATE_LABELS,
} from '../constants/templates'

describe('Phase 7: TemplateSelector コンポーネント', () => {
  describe('7.2 TemplateSelector 基本機能', () => {
    it('should render all template options', () => {
      const onSelect = vi.fn()
      render(<TemplateSelector onSelect={onSelect} />)

      expect(screen.getByText(TEMPLATE_LABELS['16:9'])).toBeInTheDocument()
      expect(screen.getByText(TEMPLATE_LABELS['a4-portrait'])).toBeInTheDocument()
      expect(screen.getByText(TEMPLATE_LABELS['a4-landscape'])).toBeInTheDocument()
      expect(screen.getByText(TEMPLATE_LABELS['business-card'])).toBeInTheDocument()
      expect(screen.getByText(TEMPLATE_LABELS['custom'])).toBeInTheDocument()
    })

    it('should call onSelect with correct template on confirm', () => {
      const onSelect = vi.fn()
      render(<TemplateSelector onSelect={onSelect} />)

      // A4縦を選択
      fireEvent.click(screen.getByText(TEMPLATE_LABELS['a4-portrait']))
      fireEvent.click(screen.getByText('作成'))

      expect(onSelect).toHaveBeenCalledWith(
        'a4-portrait',
        TEMPLATE_CONFIGS['a4-portrait']
      )
    })

    it('should show custom size inputs when custom is selected', () => {
      const onSelect = vi.fn()
      render(<TemplateSelector onSelect={onSelect} />)

      fireEvent.click(screen.getByText(TEMPLATE_LABELS['custom']))

      // カスタムサイズ入力フィールドが表示されることを確認
      const widthInputs = screen.getAllByDisplayValue('800')
      const heightInputs = screen.getAllByDisplayValue('600')

      expect(widthInputs.length).toBeGreaterThan(0)
      expect(heightInputs.length).toBeGreaterThan(0)
    })

    it('should call onSelect with custom config when custom is selected', () => {
      const onSelect = vi.fn()
      render(<TemplateSelector onSelect={onSelect} />)

      // カスタムを選択
      fireEvent.click(screen.getByText(TEMPLATE_LABELS['custom']))

      // サイズを変更
      const widthInput = screen.getAllByDisplayValue('800')[0]
      const heightInput = screen.getAllByDisplayValue('600')[0]

      fireEvent.change(widthInput, { target: { value: '1200' } })
      fireEvent.change(heightInput, { target: { value: '800' } })

      // 作成ボタンをクリック
      fireEvent.click(screen.getByText('作成'))

      expect(onSelect).toHaveBeenCalledWith('custom', {
        type: 'custom',
        width: 1200,
        height: 800,
        unit: 'px',
        dpi: 96,
      })
    })

    it('should call onCancel when cancel button is clicked', () => {
      const onSelect = vi.fn()
      const onCancel = vi.fn()
      render(<TemplateSelector onSelect={onSelect} onCancel={onCancel} />)

      fireEvent.click(screen.getByText('キャンセル'))

      expect(onCancel).toHaveBeenCalled()
    })

    it('should not show custom option when showCustomOption is false', () => {
      const onSelect = vi.fn()
      render(<TemplateSelector onSelect={onSelect} showCustomOption={false} />)

      expect(screen.queryByText(TEMPLATE_LABELS['custom'])).not.toBeInTheDocument()
    })

    it('should display preview with correct dimensions', () => {
      const onSelect = vi.fn()
      render(<TemplateSelector onSelect={onSelect} />)

      // 16:9を選択した状態でプレビューを確認
      fireEvent.click(screen.getByText(TEMPLATE_LABELS['16:9']))

      // プレビューにサイズが表示される
      expect(screen.getByText('1920 x 1080')).toBeInTheDocument()
    })
  })

  describe('カスタムサイズ入力', () => {
    it('should update custom width when input changes', () => {
      const onSelect = vi.fn()
      render(<TemplateSelector onSelect={onSelect} />)

      fireEvent.click(screen.getByText(TEMPLATE_LABELS['custom']))

      const widthInput = screen.getAllByDisplayValue('800')[0]
      fireEvent.change(widthInput, { target: { value: '1500' } })

      expect(widthInput).toHaveDisplayValue('1500')
    })

    it('should update custom height when input changes', () => {
      const onSelect = vi.fn()
      render(<TemplateSelector onSelect={onSelect} />)

      fireEvent.click(screen.getByText(TEMPLATE_LABELS['custom']))

      const heightInput = screen.getAllByDisplayValue('600')[0]
      fireEvent.change(heightInput, { target: { value: '900' } })

      expect(heightInput).toHaveDisplayValue('900')
    })

    it('should update preview when custom dimensions change', () => {
      const onSelect = vi.fn()
      render(<TemplateSelector onSelect={onSelect} />)

      fireEvent.click(screen.getByText(TEMPLATE_LABELS['custom']))

      const widthInput = screen.getAllByDisplayValue('800')[0]
      const heightInput = screen.getAllByDisplayValue('600')[0]

      fireEvent.change(widthInput, { target: { value: '1920' } })
      fireEvent.change(heightInput, { target: { value: '1080' } })

      expect(screen.getByText('1920 x 1080')).toBeInTheDocument()
    })
  })
})
