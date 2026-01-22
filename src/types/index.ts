// Slide
export interface Slide {
  id: string
  canvasJson: string
  thumbnail?: string
  createdAt: number
  updatedAt: number
}

// Project
export interface Project {
  id: string
  title: string
  slides: Slide[]
  template: TemplateType
  ownerId: string
  createdAt: number
  updatedAt: number
}

// Template types
export type TemplateType =
  | '16:9'
  | 'a4-portrait'
  | 'a4-landscape'
  | 'business-card'
  | 'custom'

// Template config
export interface TemplateConfig {
  type: TemplateType
  width: number
  height: number
  unit: 'mm' | 'px'
  dpi: number
}

// Editor state
export interface EditorState {
  currentSlideId: string | null
  selectedObjectIds: string[]
  activeTool: ToolType
  zoom: number
}

// Tool types
export type ToolType =
  | 'select'
  | 'rect'
  | 'circle'
  | 'text'
  | 'image'

// Export options
export interface ExportOptions {
  format: 'png' | 'jpeg' | 'pdf'
  quality?: number
  cmyk?: boolean
  bleed?: number
  trimMarks?: boolean
}

// History action for undo/redo
export interface HistoryAction {
  type: string
  description: string
  undo: () => void
  redo: () => void
}

// Clipboard data
export interface ClipboardData {
  objects: object[]
  timestamp: number
}

// Property panel data
export interface ObjectProperties {
  left: number
  top: number
  width: number
  height: number
  angle: number
  fill: string
  stroke?: string
  strokeWidth?: number
  opacity: number
}
