import { create } from 'zustand'
import type { Slide, Project } from '../types'

interface SlideStore {
  project: Project | null
  slides: Slide[]

  setProject: (project: Project) => void
  addSlide: () => void
  updateSlide: (slideId: string, canvasJson: string) => void
  deleteSlide: (slideId: string) => void
  reorderSlides: (fromIndex: number, toIndex: number) => void
}

const createEmptySlide = (): Slide => ({
  id: crypto.randomUUID(),
  canvasJson: '{}',
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

export const useSlideStore = create<SlideStore>((set) => ({
  project: null,
  slides: [createEmptySlide()],

  setProject: (project) => set({ project, slides: project.slides }),

  addSlide: () => set((state) => ({
    slides: [...state.slides, createEmptySlide()]
  })),

  updateSlide: (slideId, canvasJson) => set((state) => ({
    slides: state.slides.map((slide) =>
      slide.id === slideId
        ? { ...slide, canvasJson, updatedAt: Date.now() }
        : slide
    )
  })),

  deleteSlide: (slideId) => set((state) => ({
    slides: state.slides.filter((s) => s.id !== slideId)
  })),

  reorderSlides: (fromIndex, toIndex) => set((state) => {
    const newSlides = [...state.slides]
    const [removed] = newSlides.splice(fromIndex, 1)
    newSlides.splice(toIndex, 0, removed)
    return { slides: newSlides }
  }),
}))
