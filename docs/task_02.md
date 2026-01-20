# Task 02: Basic Canvas (Fabric.js)

## Overview
Implement the core canvas functionality using Fabric.js. This includes stores, hooks, and base components.

## Prerequisites
- Task 01 completed (Vite project initialized)
- **No dependencies on Task 03 or 04** - Can run in parallel

---

## Step 1: Create Zustand Stores

### 1.1 src/stores/editorStore.ts

```typescript
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
```

### 1.2 src/stores/slideStore.ts

```typescript
import { create } from 'zustand'
import type { Slide, Project, TemplateType } from '../types'

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

export const useSlideStore = create<SlideStore>((set, get) => ({
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
```

---

## Step 2: Create useCanvas Hook

### src/hooks/useCanvas.ts

```typescript
import { useEffect, useRef, useCallback } from 'react'
import { Canvas, Rect, Circle, IText, FabricObject } from 'fabric'
import { useEditorStore } from '../stores/editorStore'
import { useSlideStore } from '../stores/slideStore'
import type { ToolType } from '../types'

export function useCanvas(canvasId: string) {
  const canvasRef = useRef<Canvas | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { activeTool, setSelectedObjects } = useEditorStore()
  const { updateSlide } = useSlideStore()
  const currentSlideId = useEditorStore((s) => s.currentSlideId)

  // Initialize canvas
  useEffect(() => {
    const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement
    if (!canvasElement) return

    const canvas = new Canvas(canvasElement, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      selection: true,
    })
    
    canvasRef.current = canvas

    // Selection event
    canvas.on('selection:created', (e) => {
      const ids = e.selected?.map((obj) => (obj as FabricObject & { id?: string }).id).filter(Boolean) as string[]
      setSelectedObjects(ids)
    })

    canvas.on('selection:cleared', () => {
      setSelectedObjects([])
    })

    // Save on modification
    canvas.on('object:modified', () => {
      if (currentSlideId) {
        updateSlide(currentSlideId, JSON.stringify(canvas.toJSON()))
      }
    })

    return () => {
      canvas.dispose()
    }
  }, [canvasId])

  // Add rectangle
  const addRect = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = new Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: '#3b82f6',
      id: crypto.randomUUID(),
    } as any)
    
    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.renderAll()
  }, [])

  // Add circle
  const addCircle = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const circle = new Circle({
      left: 150,
      top: 150,
      radius: 50,
      fill: '#10b981',
      id: crypto.randomUUID(),
    } as any)
    
    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.renderAll()
  }, [])

  // Add text
  const addText = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const text = new IText('Click to edit', {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: '#1f2937',
      id: crypto.randomUUID(),
    } as any)
    
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }, [])

  // Delete selected
  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const activeObjects = canvas.getActiveObjects()
    activeObjects.forEach((obj) => canvas.remove(obj))
    canvas.discardActiveObject()
    canvas.renderAll()
  }, [])

  return {
    canvasRef,
    containerRef,
    addRect,
    addCircle,
    addText,
    deleteSelected,
  }
}
```

---

## Step 3: Create CanvasView Component

### src/components/canvas/CanvasView.tsx

```typescript
import { useEffect } from 'react'
import { useCanvas } from '../../hooks/useCanvas'

interface CanvasViewProps {
  slideId?: string
}

export function CanvasView({ slideId }: CanvasViewProps) {
  const { containerRef, deleteSelected } = useCanvas('main-canvas')

  // Delete key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't delete if editing text
        if (document.activeElement?.tagName === 'TEXTAREA') return
        deleteSelected()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelected])

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-gray-100 flex items-center justify-center p-4"
    >
      <div className="shadow-lg">
        <canvas id="main-canvas" />
      </div>
    </div>
  )
}
```

---

## Step 4: Create Toolbar Component

### src/components/canvas/Toolbar.tsx

```typescript
import { useCanvas } from '../../hooks/useCanvas'
import { useEditorStore } from '../../stores/editorStore'
import type { ToolType } from '../../types'

export function Toolbar() {
  const { addRect, addCircle, addText } = useCanvas('main-canvas')
  const { activeTool, setActiveTool } = useEditorStore()

  const tools: { id: ToolType; label: string; icon: string }[] = [
    { id: 'select', label: 'Select', icon: '↖' },
    { id: 'rect', label: 'Rectangle', icon: '▢' },
    { id: 'circle', label: 'Circle', icon: '○' },
    { id: 'text', label: 'Text', icon: 'T' },
  ]

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(tool)
    if (tool === 'rect') addRect()
    if (tool === 'circle') addCircle()
    if (tool === 'text') addText()
  }

  return (
    <div className="bg-white border-b px-4 py-2 flex gap-2">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => handleToolClick(tool.id)}
          className={`px-3 py-2 rounded transition-colors ${
            activeTool === tool.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  )
}
```

---

## Step 5: Create Editor Page

### src/pages/Editor.tsx

```typescript
import { useEffect } from 'react'
import { CanvasView } from '../components/canvas/CanvasView'
import { Toolbar } from '../components/canvas/Toolbar'
import { useSlideStore } from '../stores/slideStore'
import { useEditorStore } from '../stores/editorStore'

export function Editor() {
  const { slides } = useSlideStore()
  const { currentSlideId, setCurrentSlide } = useEditorStore()

  // Set initial slide
  useEffect(() => {
    if (slides.length > 0 && !currentSlideId) {
      setCurrentSlide(slides[0].id)
    }
  }, [slides, currentSlideId, setCurrentSlide])

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <CanvasView slideId={currentSlideId ?? undefined} />
    </div>
  )
}
```

---

## Step 6: Update App.tsx

```typescript
import { Editor } from './pages/Editor'

function App() {
  return <Editor />
}

export default App
```

---

## Step 7: Verify

```bash
npm run dev
# Open http://localhost:5173
# 1. Click Rectangle button - should add blue rectangle
# 2. Click Circle button - should add green circle
# 3. Click Text button - should add editable text
# 4. Select object and press Delete - should remove it

npm run build
npm run lint
```

---

## Completion Checklist

- [ ] editorStore created
- [ ] slideStore created
- [ ] useCanvas hook created
- [ ] CanvasView component created
- [ ] Toolbar component created
- [ ] Editor page created
- [ ] App.tsx updated
- [ ] Manual testing passed
- [ ] Build passes
- [ ] Lint passes

---

## Files Created/Modified

| File | Action |
|------|--------|
| src/stores/editorStore.ts | NEW |
| src/stores/slideStore.ts | NEW |
| src/hooks/useCanvas.ts | NEW |
| src/components/canvas/CanvasView.tsx | NEW |
| src/components/canvas/Toolbar.tsx | NEW |
| src/pages/Editor.tsx | NEW |
| src/App.tsx | MODIFY |
