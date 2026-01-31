/**
 * SlideThumb.test.tsx
 * SlideThumbコンポーネントのテスト
 * Issue #87: セキュリティとパフォーマンスの修正
 *
 * テスト内容:
 * - データURIのバリデーション（XSS保護）
 * - 安全な画像のみが表示されること
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SlideThumb } from './SlideThumb'

describe('SlideThumb - Issue #87: セキュリティ修正', () => {
  const defaultProps = {
    slideId: 'test-slide-1',
    index: 0,
    isActive: false,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
  }

  describe('データURIバリデーション（XSS保護）', () => {
    it('should render image with valid data URI (PNG)', () => {
      const validPngUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={validPngUri}
        />
      )

      const img = screen.getByAltText('Slide 1')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', validPngUri)
    })

    it('should render image with valid data URI (JPEG)', () => {
      const validJpegUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD'

      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={validJpegUri}
        />
      )

      const img = screen.getByAltText('Slide 1')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', validJpegUri)
    })

    it('should render image with valid data URI (GIF)', () => {
      const validGifUri = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={validGifUri}
        />
      )

      const img = screen.getByAltText('Slide 1')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', validGifUri)
    })

    it('should render image with valid data URI (WebP)', () => {
      const validWebpUri = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA='

      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={validWebpUri}
        />
      )

      const img = screen.getByAltText('Slide 1')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', validWebpUri)
    })

    it('should render image with valid http URL', () => {
      const validHttpUrl = 'http://example.com/image.png'

      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={validHttpUrl}
        />
      )

      const img = screen.getByAltText('Slide 1')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', validHttpUrl)
    })

    it('should render image with valid https URL', () => {
      const validHttpsUrl = 'https://example.com/image.png'

      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={validHttpsUrl}
        />
      )

      const img = screen.getByAltText('Slide 1')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', validHttpsUrl)
    })

    it('should not render image with javascript: protocol', () => {
      const maliciousUri = 'javascript:alert(1)'

      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={maliciousUri}
        />
      )

      const img = screen.queryByAltText('Slide 1')
      expect(img).not.toBeInTheDocument()

      // プレースホルダーテキストが表示されることを確認
      expect(screen.getByText('Slide 1')).toBeInTheDocument()
    })

    it('should not render image with data:text/html', () => {
      const maliciousUri = 'data:text/html,<script>alert(1)</script>'

      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={maliciousUri}
        />
      )

      const img = screen.queryByAltText('Slide 1')
      expect(img).not.toBeInTheDocument()

      // プレースホルダーテキストが表示されることを確認
      expect(screen.getByText('Slide 1')).toBeInTheDocument()
    })

    it('should not render image with data:image/svg+xml with script', () => {
      const maliciousSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'

      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={maliciousSvg}
        />
      )

      const img = screen.queryByAltText('Slide 1')
      expect(img).not.toBeInTheDocument()

      // プレースホルダーテキストが表示されることを確認
      expect(screen.getByText('Slide 1')).toBeInTheDocument()
    })

    it('should not render image with vbscript: protocol', () => {
      const maliciousUri = 'vbscript:msgbox(1)'

      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={maliciousUri}
        />
      )

      const img = screen.queryByAltText('Slide 1')
      expect(img).not.toBeInTheDocument()

      // プレースホルダーテキストが表示されることを確認
      expect(screen.getByText('Slide 1')).toBeInTheDocument()
    })

    it('should not render image with file: protocol', () => {
      const localFileUri = 'file:///etc/passwd'

      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={localFileUri}
        />
      )

      const img = screen.queryByAltText('Slide 1')
      expect(img).not.toBeInTheDocument()

      // プレースホルダーテキストが表示されることを確認
      expect(screen.getByText('Slide 1')).toBeInTheDocument()
    })

    it('should not render image with invalid base64 data URI', () => {
      const invalidBase64Uri = 'data:image/png;base64,not-valid-base64!!!'

      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={invalidBase64Uri}
        />
      )

      const img = screen.queryByAltText('Slide 1')
      expect(img).not.toBeInTheDocument()

      // プレースホルダーテキストが表示されることを確認
      expect(screen.getByText('Slide 1')).toBeInTheDocument()
    })

    it('should not render image with data URI missing MIME type', () => {
      const invalidUri = 'data:base64,iVBORw0KGgo='

      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={invalidUri}
        />
      )

      const img = screen.queryByAltText('Slide 1')
      expect(img).not.toBeInTheDocument()

      // プレースホルダーテキストが表示されることを確認
      expect(screen.getByText('Slide 1')).toBeInTheDocument()
    })
  })

  describe('基本機能', () => {
    it('should display slide number', () => {
      render(
        <SlideThumb
          {...defaultProps}
          index={5}
        />
      )

      expect(screen.getByText('6')).toBeInTheDocument()
    })

    it('should display placeholder when no thumbnail', () => {
      render(
        <SlideThumb
          {...defaultProps}
          thumbnail={undefined}
        />
      )

      expect(screen.getByText('Slide 1')).toBeInTheDocument()
    })

    it('should call onSelect when clicked', () => {
      const onSelect = vi.fn()

      render(
        <SlideThumb
          {...defaultProps}
          index={5}
          onSelect={onSelect}
        />
      )

      const container = screen.getByText('6').closest('.relative.cursor-pointer')
      if (container) {
        fireEvent.click(container)
      }

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

    it('should stop propagation on delete button click', () => {
      const onSelect = vi.fn()
      const onDelete = vi.fn()

      render(
        <SlideThumb
          {...defaultProps}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      )

      const deleteButton = screen.getByLabelText('スライドを削除')
      deleteButton.click()

      expect(onDelete).toHaveBeenCalledTimes(1)
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('should apply active styling when isActive is true', () => {
      const { container } = render(
        <SlideThumb
          {...defaultProps}
          isActive={true}
        />
      )

      const activeDiv = container.querySelector('.ring-2.ring-blue-500')
      expect(activeDiv).toBeInTheDocument()
    })

    it('should not apply active styling when isActive is false', () => {
      const { container } = render(
        <SlideThumb
          {...defaultProps}
          isActive={false}
        />
      )

      const activeDiv = container.querySelector('.ring-2.ring-blue-500')
      expect(activeDiv).not.toBeInTheDocument()
    })
  })
})
