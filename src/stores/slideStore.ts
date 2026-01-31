import { create } from 'zustand'
import type { Slide, Project, TemplateType, TemplateConfig } from '../types'
import { TEMPLATE_CONFIGS } from '../constants/templates'

interface SlideStore {
  project: Project | null
  slides: Slide[]
  templateConfig: TemplateConfig | null

  setProject: (project: Project) => void
  clearProject: () => void
  addSlide: () => void
  updateSlide: (slideId: string, canvasJson: string) => void
  deleteSlide: (slideId: string) => void
  reorderSlides: (fromIndex: number, toIndex: number) => void
  createProject: (
    title: string,
    template: TemplateType,
    config?: TemplateConfig,
    ownerId?: string
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

  clearProject: () => set({ project: null, slides: [createEmptySlide()], templateConfig: null }),

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

  createProject: (title, template, config, ownerId) => {
    const templateConfig = config || TEMPLATE_CONFIGS[template]
    const now = Date.now()
    const initialSlide = createEmptySlide()

    const newProject: Project = {
      id: crypto.randomUUID(),
      title,
      slides: [initialSlide],
      template,
      ownerId: ownerId || '',
      createdAt: now,
      updatedAt: now,
    }

    set({
      project: newProject,
      slides: [initialSlide],
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
