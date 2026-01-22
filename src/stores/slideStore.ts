import { create } from 'zustand'
import type { Slide, Project, TemplateType, TemplateConfig } from '../types'
import { TEMPLATE_CONFIGS } from '../constants/templates'

interface SlideStore {
  project: Project | null
  slides: Slide[]
  templateConfig: TemplateConfig | null

  setProject: (project: Project) => void
  addSlide: () => void
  updateSlide: (slideId: string, canvasJson: string) => void
  deleteSlide: (slideId: string) => void
  reorderSlides: (fromIndex: number, toIndex: number) => void
  createProject: (
    title: string,
    template: TemplateType,
    config?: TemplateConfig
  ) => void
  getTemplateConfig: () => TemplateConfig
}

const createEmptySlide = (): Slide => ({
  id: crypto.randomUUID(),
  canvasJson: '{}',
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

export const useSlideStore = create<SlideStore>((set, get) => ({
  project: null,
  slides: [createEmptySlide()],
  templateConfig: null,

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

  createProject: (title, template, config) => {
    const templateConfig = config || TEMPLATE_CONFIGS[template]
    const newProject: Project = {
      id: crypto.randomUUID(),
      title,
      slides: [],
      template,
      ownerId: '', // 後でuseAuthから設定
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    set({
      project: newProject,
      slides: [],
      templateConfig,
    })
  },

  getTemplateConfig: () => {
    const { project, templateConfig } = get()
    if (templateConfig) return templateConfig
    if (project) return TEMPLATE_CONFIGS[project.template]
    return TEMPLATE_CONFIGS['16:9'] // デフォルト
  },
}))
