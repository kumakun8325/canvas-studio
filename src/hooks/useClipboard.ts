import { useRef, useCallback } from 'react'
import * as fabric from 'fabric'
import { createHistoryAction, useHistory } from './useHistory'
import { useHistoryStore } from '../stores/historyStore'
import type { ClipboardData, ClipboardObjectData } from '../types'

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

    // ペースト時にクリップボードデータをスナップショット（後のコピー操作で上書きされないように）
    const snapshotObjects = clipboardRef.current.objects.map((obj: ClipboardObjectData) => ({ ...obj }))

    // バッチ開始: paste 中の canvas auto-save 履歴記録を抑制
    useHistoryStore.getState().startBatch()

    // オフセットを加えてペースト
    const pastedFabricObjects: fabric.FabricObject[] = []
    const promises = snapshotObjects.map((objData: ClipboardObjectData) => {
      return new Promise<void>((resolve) => {
        fabric.util.enlivenObjects([objData]).then((results) => {
          const obj = results[0]
          if (obj instanceof fabric.FabricObject) {
            obj.set({
              id: crypto.randomUUID(),
              left: (objData.left ?? 0) + 20,
              top: (objData.top ?? 0) + 20,
            })
            canvas.add(obj)
            pastedFabricObjects.push(obj)
          }
          resolve()
        })
      })
    })

    Promise.all(promises).then(() => {
      // バッチ終了: auto-save 抑制を解除
      useHistoryStore.getState().endBatch()

      canvas.renderAll()
      // 最後に追加したオブジェクトを選択
      const allObjects = canvas.getObjects()
      if (allObjects.length > 0) {
        const lastObject = allObjects[allObjects.length - 1]
        canvas.setActiveObject(lastObject)
      }

      // fabric オブジェクト参照を保持（同期的な undo/redo を実現）
      const capturedObjects = [...pastedFabricObjects]

      // Undo/Redo履歴を記録（paste のみが1つの履歴エントリとなる）
      recordAction(
        createHistoryAction(
          'paste',
          'オブジェクトを貼り付け',
          () => {
            const canvas = canvasRef.current
            if (!canvas) return
            capturedObjects.forEach((obj) => canvas.remove(obj))
            canvas.renderAll()
          },
          () => {
            const canvas = canvasRef.current
            if (!canvas) return
            capturedObjects.forEach((obj) => canvas.add(obj))
            canvas.renderAll()
            if (capturedObjects.length > 0) {
              canvas.setActiveObject(capturedObjects[capturedObjects.length - 1])
            }
          },
        ),
      )
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
