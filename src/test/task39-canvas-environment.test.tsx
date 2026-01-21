/**
 * Issue #39: Test Environment (node-canvas missing)
 *
 * JSDOM環境でFabric.jsを動かす場合、canvas (node-canvas) パッケージが必要
 * このテストはFabric.jsがテスト環境で正しく動作することを検証する
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { Canvas, Rect } from 'fabric'

describe('Issue #39: Test Environment (node-canvas missing)', () => {
  describe('Fabric.js in JSDOM environment', () => {
    it('should create a canvas element without errors', () => {
      // Arrange & Act
      const canvasElement = document.createElement('canvas')
      canvasElement.id = 'test-canvas'
      canvasElement.width = 500
      canvasElement.height = 500
      document.body.appendChild(canvasElement)

      // ここでcanvasパッケージがインストールされていない場合:
      // TypeError: Cannot read properties of null (reading 'scale') が発生する
      const canvas = new Canvas(canvasElement, {
        width: 500,
        height: 500,
      })

      // Assert
      expect(canvas).toBeDefined()
      expect(canvas.width).toBe(500)
      expect(canvas.height).toBe(500)

      // Cleanup
      canvas.dispose()
      document.body.removeChild(canvasElement)
    })

    it('should add and render objects to canvas', () => {
      // Arrange
      const canvasElement = document.createElement('canvas')
      canvasElement.id = 'test-canvas-2'
      canvasElement.width = 500
      canvasElement.height = 500
      document.body.appendChild(canvasElement)

      const canvas = new Canvas(canvasElement, {
        width: 500,
        height: 500,
      })

      // Act
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: 'red',
        width: 50,
        height: 50,
      })

      canvas.add(rect)

      // Assert
      expect(canvas.getObjects()).toHaveLength(1)
      expect(canvas.getObjects()[0]).toBe(rect)

      // Cleanup
      canvas.dispose()
      document.body.removeChild(canvasElement)
    })

    it('should render canvas with toDataURL', async () => {
      // Arrange
      const canvasElement = document.createElement('canvas')
      canvasElement.id = 'test-canvas-render'
      canvasElement.width = 500
      canvasElement.height = 500
      document.body.appendChild(canvasElement)

      const canvas = new Canvas(canvasElement, {
        width: 500,
        height: 500,
      })

      const rect = new Rect({
        left: 100,
        top: 100,
        fill: 'red',
        width: 50,
        height: 50,
      })

      canvas.add(rect)

      // Act - toDataURLは実際のCanvas描画を必要とする
      // node-canvasがインストールされていない場合、ここでエラーが発生する
      const dataURL = await canvas.toDataURL({
        format: 'png',
        quality: 1,
      })

      // Assert
      expect(dataURL).toBeTruthy()
      expect(dataURL).toMatch(/^data:image\/png;base64/)

      // Cleanup
      canvas.dispose()
      document.body.removeChild(canvasElement)
    })
  })
})
