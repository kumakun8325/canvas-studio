import { create } from 'zustand'
import type { EditorState, ToolType } from '../types'

export interface EditorStore extends EditorState {
  setCurrentSlide: (slideId: string | null) => void
  setSelectedObjects: (objectIds: string[]) => void
  setActiveTool: (tool: ToolType) => void
  setZoom: (zoom: number) => void
  toggleSlideList: () => void
  togglePropertyPanel: () => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  currentSlideId: null,
  selectedObjectIds: [],
  activeTool: 'select',
  zoom: 1,
  isSlideListOpen: true,
  isPropertyPanelOpen: true,

  setCurrentSlide: (slideId) => set({ currentSlideId: slideId }),
  setSelectedObjects: (objectIds) => set({ selectedObjectIds: objectIds }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoom) => set({ zoom }),
  toggleSlideList: () => set((state) => ({ isSlideListOpen: !state.isSlideListOpen })),
  togglePropertyPanel: () => set((state) => ({ isPropertyPanelOpen: !state.isPropertyPanelOpen })),
}))
