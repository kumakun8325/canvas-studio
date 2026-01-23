import { useRef, useCallback } from 'react'
import * as fabric from 'fabric'
import { useHistory } from './useHistory'
import type { ClipboardData } from '../types'

interface UseClipboardReturn {
  copy: () => void
  paste: () => void
  cut: () => void
  hasClipboardData: boolean
}

export function useClipboard(canvasRef: React.RefObject<fabric.Canvas | null>): UseClipboardReturn {
  const clipboardRef = useRef<ClipboardData | null>(null)
  const { recordAction } = useHistory()

  const copy = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length === 0) return

    // オブジェクトをシリアライズして保存
    const serialized = activeObjects.map((obj) => obj.toObject(['id']))
    clipboardRef.current = {
      objects: serialized,
      timestamp: Date.now(),
    }
  }, [canvasRef])

  const paste = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !clipboardRef.current) return

    const { objects } = clipboardRef.current
    const pastedObjectIds: string[] = []

    // オフセットを加えてペースト
    const promises = objects.map((objData) => {
      return new Promise<void>((resolve) => {
        fabric.util.enlivenObjects([objData]).then((results) => {
          const obj = results[0]
          if (obj instanceof fabric.FabricObject) {
            const newId = crypto.randomUUID()
            pastedObjectIds.push(newId)
            obj.set({
              id: newId,
              left: ((objData as any).left || 0) + 20,
              top: ((objData as any).top || 0) + 20,
            })
            canvas.add(obj)
          }
          resolve()
        })
      })
    })

    Promise.all(promises).then(() => {
      canvas.renderAll()
      // 最後に追加したオブジェクトを選択
      const allObjects = canvas.getObjects()
      if (allObjects.length > 0) {
        const lastObject = allObjects[allObjects.length - 1]
        canvas.setActiveObject(lastObject)
      }

      // Undo/Redo履歴を記録
      recordAction({
        type: 'paste',
        description: 'オブジェクトを貼り付け',
        undo: () => {
          const canvas = canvasRef.current
          if (!canvas) return
          // ペーストしたオブジェクトを削除
          const objects = canvas.getObjects()
          pastedObjectIds.forEach((id) => {
            const obj = objects.find((o) => (o as any).id === id)
            if (obj) {
              canvas.remove(obj)
            }
          })
          canvas.renderAll()
        },
        redo: () => {
          const canvas = canvasRef.current
          if (!canvas || !clipboardRef.current) return
          const { objects } = clipboardRef.current

          const redoPromises = objects.map((objData) => {
            return new Promise<void>((resolve) => {
              fabric.util.enlivenObjects([objData]).then((results) => {
                const obj = results[0]
                if (obj instanceof fabric.FabricObject) {
                  obj.set({
                    id: crypto.randomUUID(),
                    left: ((objData as any).left || 0) + 20,
                    top: ((objData as any).top || 0) + 20,
                  })
                  canvas.add(obj)
                }
                resolve()
              })
            })
          })

          Promise.all(redoPromises).then(() => {
            canvas.renderAll()
            const allObjects = canvas.getObjects()
            if (allObjects.length > 0) {
              const lastObject = allObjects[allObjects.length - 1]
              canvas.setActiveObject(lastObject)
            }
          })
        },
      })
    })
  }, [canvasRef, recordAction])

  const cut = useCallback(() => {
    copy()
    const canvas = canvasRef.current
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    activeObjects.forEach((obj) => canvas.remove(obj))
    canvas.discardActiveObject()
    canvas.renderAll()
  }, [copy, canvasRef])

  return {
    copy,
    paste,
    cut,
    hasClipboardData: clipboardRef.current !== null,
  }
}
