import { create } from 'zustand'
import type { HistoryAction } from '../types'

interface HistoryStore {
  undoStack: HistoryAction[]
  redoStack: HistoryAction[]
  maxHistory: number

  push: (action: HistoryAction) => void
  undo: () => void
  redo: () => void
  clear: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  undoStack: [],
  redoStack: [],
  maxHistory: 50,

  push: (action) =>
    set((state) => {
      const newUndoStack = [...state.undoStack, action]
      // スタックサイズを制限
      if (newUndoStack.length > state.maxHistory) {
        newUndoStack.shift()
      }
      return {
        undoStack: newUndoStack,
        redoStack: [], // 新しいアクション時にredoスタックをクリア
      }
    }),

  undo: () => {
    const state = get()
    if (state.undoStack.length === 0) return

    const action = state.undoStack[state.undoStack.length - 1]
    action.undo()

    set({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, action],
    })
  },

  redo: () => {
    const state = get()
    if (state.redoStack.length === 0) return

    const action = state.redoStack[state.redoStack.length - 1]
    action.redo()

    set({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, action],
    })
  },

  clear: () => set({ undoStack: [], redoStack: [] }),

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
}))
