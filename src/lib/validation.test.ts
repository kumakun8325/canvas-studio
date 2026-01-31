import { describe, it, expect } from 'vitest'
import {
  isValidUrl,
  isValidImageUrl,
  isValidImageFile,
  isValidImageSize,
  validateImageFile,
} from './validation'

describe('validation', () => {
  describe('isValidUrl', () => {
    it('should accept valid http URLs', () => {
      expect(isValidUrl('http://example.com/image.jpg')).toBe(true)
      expect(isValidUrl('http://localhost:3000/image.png')).toBe(true)
    })

    it('should accept valid https URLs', () => {
      expect(isValidUrl('https://example.com/image.jpg')).toBe(true)
      expect(isValidUrl('https://cdn.example.com/path/to/image.png')).toBe(true)
    })

    it('should accept data URLs', () => {
      expect(isValidUrl('data:image/png;base64,iVBORw0KG...')).toBe(true)
      expect(isValidUrl('data:image/jpeg;base64,/9j/4AAQ...')).toBe(true)
    })

    it('should accept blob URLs', () => {
      expect(isValidUrl('blob:http://localhost:3000/uuid-xxx')).toBe(true)
    })

    it('should reject javascript URLs (XSS prevention)', () => {
      expect(isValidUrl('javascript:alert(1)')).toBe(false)
      expect(isValidUrl('JAVASCRIPT:alert(1)')).toBe(false)
      expect(isValidUrl('Javascript:alert(1)')).toBe(false)
    })

    it('should reject other dangerous protocols', () => {
      expect(isValidUrl('file:///etc/passwd')).toBe(false)
      expect(isValidUrl('ftp://example.com/file')).toBe(false)
      expect(isValidUrl('vbscript:msgbox(1)')).toBe(false)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl('not a url')).toBe(false)
      expect(isValidUrl('://')).toBe(false)
    })
  })

  describe('isValidImageUrl', () => {
    it('should accept valid http image URLs', () => {
      expect(isValidImageUrl('http://example.com/image.jpg')).toBe(true)
      expect(isValidImageUrl('http://example.com/image.png')).toBe(true)
    })

    it('should accept valid https image URLs', () => {
      expect(isValidImageUrl('https://cdn.example.com/path/to/image.png')).toBe(
        true
      )
      expect(isValidImageUrl('https://example.com/photo.webp')).toBe(true)
    })

    it('should reject data URLs for thumbnails', () => {
      expect(isValidImageUrl('data:image/png;base64,iVBORw0KG...')).toBe(false)
    })

    it('should reject blob URLs for thumbnails', () => {
      expect(isValidImageUrl('blob:http://localhost:3000/uuid-xxx')).toBe(false)
    })

    it('should reject javascript URLs (XSS prevention)', () => {
      expect(isValidImageUrl('javascript:alert(1)')).toBe(false)
      expect(isValidImageUrl('javascript:alert(document.cookie)')).toBe(false)
    })

    it('should reject empty strings', () => {
      expect(isValidImageUrl('')).toBe(false)
    })

    it('should reject non-string values', () => {
      expect(isValidImageUrl(null as unknown as string)).toBe(false)
      expect(isValidImageUrl(undefined as unknown as string)).toBe(false)
    })

    it('should reject invalid URLs', () => {
      expect(isValidImageUrl('not a url')).toBe(false)
      expect(isValidImageUrl('://')).toBe(false)
    })
  })

  describe('isValidImageFile', () => {
    it('should accept JPEG files', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      expect(isValidImageFile(file)).toBe(true)

      const file2 = new File([''], 'test.jpeg', { type: 'image/jpg' })
      expect(isValidImageFile(file2)).toBe(true)
    })

    it('should accept PNG files', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      expect(isValidImageFile(file)).toBe(true)
    })

    it('should accept GIF files', () => {
      const file = new File([''], 'test.gif', { type: 'image/gif' })
      expect(isValidImageFile(file)).toBe(true)
    })

    it('should accept WebP files', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' })
      expect(isValidImageFile(file)).toBe(true)
    })

    it('should accept SVG files', () => {
      const file = new File([''], 'test.svg', { type: 'image/svg+xml' })
      expect(isValidImageFile(file)).toBe(true)
    })

    it('should accept BMP files', () => {
      const file = new File([''], 'test.bmp', { type: 'image/bmp' })
      expect(isValidImageFile(file)).toBe(true)
    })

    it('should reject non-image files', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' })
      expect(isValidImageFile(file)).toBe(false)

      const file2 = new File([''], 'test.txt', { type: 'text/plain' })
      expect(isValidImageFile(file2)).toBe(false)
    })

    it('should reject files without MIME type', () => {
      const file = new File([''], 'test.bin', { type: '' })
      expect(isValidImageFile(file)).toBe(false)
    })
  })

  describe('isValidImageSize', () => {
    it('should accept files within default 5MB limit', () => {
      const file = new File([new ArrayBuffer(4 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      })
      expect(isValidImageSize(file)).toBe(true)
    })

    it('should reject files exceeding default 5MB limit', () => {
      const file = new File([new ArrayBuffer(6 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      })
      expect(isValidImageSize(file)).toBe(false)
    })

    it('should accept files within custom size limit', () => {
      const file = new File([new ArrayBuffer(1 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      })
      expect(isValidImageSize(file, 2 * 1024 * 1024)).toBe(true)
    })

    it('should reject files exceeding custom size limit', () => {
      const file = new File([new ArrayBuffer(3 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      })
      expect(isValidImageSize(file, 2 * 1024 * 1024)).toBe(false)
    })

    it('should accept empty files', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      expect(isValidImageSize(file)).toBe(true)
    })
  })

  describe('validateImageFile', () => {
    it('should validate a valid image file', () => {
      const file = new File([new ArrayBuffer(1 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      })
      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid file type', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('許可された画像形式ではありません')
    })

    it('should reject file exceeding size limit', () => {
      const file = new File([new ArrayBuffer(6 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('画像サイズが大きすぎます')
    })

    it('should use custom size limit', () => {
      const file = new File([new ArrayBuffer(3 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      })
      const result = validateImageFile(file, 2 * 1024 * 1024)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('画像サイズが大きすぎます')
    })

    it('should include file type in error message', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' })
      const result = validateImageFile(file)
      expect(result.error).toContain('application/pdf')
    })

    it('should handle unknown file types', () => {
      const file = new File([''], 'test.bin', { type: '' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('許可された画像形式ではありません')
      expect(result.error).toContain('unknown')
    })
  })
})
