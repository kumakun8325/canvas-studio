import { create } from 'zustand'
import type { EditorState, ToolType } from '../types'

interface EditorStore extends EditorState {
  isDarkMode: boolean
  setDarkMode: (isDark: boolean) => void
  setCurrentSlide: (slideId: string | null) => void
  setSelectedObjects: (objectIds: string[]) => void
  setActiveTool: (tool: ToolType) => void
  setZoom: (zoom: number) => void
  // パネルの開閉状態（レスポンシブ対応）
  isSlideListOpen: boolean
  isPropertyPanelOpen: boolean
  toggleSlideList: () => void
  togglePropertyPanel: () => void
  // ダークモード
  isDarkMode: boolean
  setDarkMode: (isDark: boolean) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  currentSlideId: null,
  selectedObjectIds: [],
  activeTool: 'select',
  zoom: 1,
  isDarkMode: false,
  // デフォルトは両方のパネルを開く
  isSlideListOpen: true,
  isPropertyPanelOpen: true,
  // ダークモード（デフォルトはライト）
  isDarkMode: false,

  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
  setCurrentSlide: (slideId) => set({ currentSlideId: slideId }),
  setSelectedObjects: (objectIds) => set({ selectedObjectIds: objectIds }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoom) => set({ zoom }),
  toggleSlideList: () => set((state) => ({ isSlideListOpen: !state.isSlideListOpen })),
  togglePropertyPanel: () => set((state) => ({ isPropertyPanelOpen: !state.isPropertyPanelOpen })),
  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
}))
