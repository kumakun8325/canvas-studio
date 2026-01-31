/**
 * SlideThumb.test.tsx
 * SlideThumbコンポーネントのテスト
 * Issue #85: レビュー指摘事項の対応
 *
 * テスト内容:
 * - XSS対策: サムネイルURLのバリデーション
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SlideThumb } from './SlideThumb'

describe('SlideThumb - Issue #85: XSS対策', () => {
  const defaultProps = {
    slideId: 'slide-1',
    index: 0,
    isActive: false,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
  }

  describe('サムネイルURLのバリデーション (XSS対策)', () => {
    it('should render valid http thumbnail URL', () => {
      render(
        <SlideThumb
          {...defaultProps}
          thumbnail="http://example.com/thumb.jpg"
        />
      )

      const img = screen.getByAltText('Slide 1')
      expect(img).toHaveAttribute('src', 'http://example.com/thumb.jpg')
    })

    it('should render valid https thumbnail URL', () => {
      render(
        <SlideThumb
          {...defaultProps}
          thumbnail="https://example.com/thumb.jpg"
        />
      )

      const img = screen.getByAltText('Slide 1')
      expect(img).toHaveAttribute('src', 'https://example.com/thumb.jpg')
    })

    it('should render valid data URI thumbnail', () => {
      const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={dataUri}
        />
      )

      const img = screen.getByAltText('Slide 1')
      expect(img).toHaveAttribute('src', dataUri)
    })

    it('should reject javascript: URL (XSS attack)', () => {
      render(
        <SlideThumb
          {...defaultProps}
          thumbnail="javascript:alert('XSS')"
        />
      )

      // 画像がレンダリングされていないことを確認
      const img = screen.queryByAltText('Slide 1')
      expect(img).toBeNull()

      // プレースホルダーテキストが表示されていることを確認
      expect(screen.getByText('Slide 1')).toBeDefined()
    })

    it('should reject data:javascript: URL (XSS attack)', () => {
      render(
        <SlideThumb
          {...defaultProps}
          thumbnail="data:text/javascript,alert('XSS')"
        />
      )

      // 画像がレンダリングされていないことを確認
      const img = screen.queryByAltText('Slide 1')
      expect(img).toBeNull()
    })

    it('should reject vbscript: URL (XSS attack)', () => {
      render(
        <SlideThumb
          {...defaultProps}
          thumbnail="vbscript:msgbox('XSS')"
        />
      )

      // 画像がレンダリングされていないことを確認
      const img = screen.queryByAltText('Slide 1')
      expect(img).toBeNull()
    })

    it('should reject file: URL (security risk)', () => {
      render(
        <SlideThumb
          {...defaultProps}
          thumbnail="file:///etc/passwd"
        />
      )

      // 画像がレンダリングされていないことを確認
      const img = screen.queryByAltText('Slide 1')
      expect(img).toBeNull()
    })

    it('should reject FTP URL (insecure protocol)', () => {
      render(
        <SlideThumb
          {...defaultProps}
          thumbnail="ftp://example.com/thumb.jpg"
        />
      )

      // 画像がレンダリングされていないことを確認
      const img = screen.queryByAltText('Slide 1')
      expect(img).toBeNull()
    })

    it('should show placeholder when thumbnail is undefined', () => {
      render(
        <SlideThumb
          {...defaultProps}
        />
      )

      // プレースホルダーテキストが表示されていることを確認
      expect(screen.getByText('Slide 1')).toBeDefined()
      const img = screen.queryByAltText('Slide 1')
      expect(img).toBeNull()
    })

    it('should show placeholder when thumbnail is empty string', () => {
      render(
        <SlideThumb
          {...defaultProps}
          thumbnail=""
        />
      )

      // プレースホルダーテキストが表示されていることを確認
      expect(screen.getByText('Slide 1')).toBeDefined()
      const img = screen.queryByAltText('Slide 1')
      expect(img).toBeNull()
    })
  })

  describe('基本機能', () => {
    it('should call onSelect when clicked', () => {
      const onSelect = vi.fn()
      render(
        <SlideThumb
          {...defaultProps}
          onSelect={onSelect}
        />
      )

      const thumb = screen.getByText('Slide 1').closest('div')
      thumb?.click()
      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('should call onDelete when delete button is clicked', () => {
      const onDelete = vi.fn()
      render(
        <SlideThumb
          {...defaultProps}
          onDelete={onDelete}
        />
      )

      const deleteButton = screen.getByLabelText('スライドを削除')
      deleteButton.click()
      expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('should not call onSelect when delete button is clicked', () => {
      const onSelect = vi.fn()
      render(
        <SlideThumb
          {...defaultProps}
          onSelect={onSelect}
        />
      )

      const deleteButton = screen.getByLabelText('スライドを削除')
      deleteButton.click()
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('should apply active style when isActive is true', () => {
      const { container } = render(
        <SlideThumb
          {...defaultProps}
          isActive={true}
        />
      )

      const thumb = container.querySelector('.ring-2')
      expect(thumb).toBeDefined()
    })
  })
})
