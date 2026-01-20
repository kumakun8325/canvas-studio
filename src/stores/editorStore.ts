import { create } from 'zustand'
import type { EditorState, ToolType } from '../types'

interface EditorStore extends EditorState {
  setCurrentSlide: (slideId: string | null) => void
  setSelectedObjects: (objectIds: string[]) => void
  setActiveTool: (tool: ToolType) => void
  setZoom: (zoom: number) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  currentSlideId: null,
  selectedObjectIds: [],
  activeTool: 'select',
  zoom: 1,

  setCurrentSlide: (slideId) => set({ currentSlideId: slideId }),
  setSelectedObjects: (objectIds) => set({ selectedObjectIds: objectIds }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoom) => set({ zoom }),
}))
