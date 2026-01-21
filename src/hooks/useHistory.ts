import { useCallback, useEffect } from 'react'
import { useHistoryStore } from '../stores/historyStore'
import type { HistoryAction } from '../types'

export function useHistory() {
  const { push, undo, redo, canUndo, canRedo, clear } = useHistoryStore()

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力欄の場合は無視
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Ctrl+Z = 元に戻す
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      // Ctrl+Y または Ctrl+Shift+Z = やり直し
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  // アクション記録ヘルパー
  const recordAction = useCallback(
    (action: HistoryAction) => {
      push(action)
    },
    [push]
  )

  return {
    recordAction,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  }
}
