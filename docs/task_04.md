# Task 04: Undo/Redo System

## Overview
Implement undo/redo functionality with history stack management.

## Prerequisites
- Task 01 completed
- **Can run in parallel with Task 02 and 03**
- Will integrate with canvas operations in Task 02

---

## Step 1: Create History Store

### src/stores/historyStore.ts

```typescript
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
  
  push: (action) => set((state) => {
    const newUndoStack = [...state.undoStack, action]
    // Limit stack size
    if (newUndoStack.length > state.maxHistory) {
      newUndoStack.shift()
    }
    return {
      undoStack: newUndoStack,
      redoStack: [], // Clear redo stack on new action
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
```

---

## Step 2: Create useHistory Hook

### src/hooks/useHistory.ts

```typescript
import { useCallback, useEffect } from 'react'
import { useHistoryStore } from '../stores/historyStore'
import type { HistoryAction } from '../types'

export function useHistory() {
  const { push, undo, redo, canUndo, canRedo, clear } = useHistoryStore()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      // Ctrl+Z = Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      
      // Ctrl+Y or Ctrl+Shift+Z = Redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        redo()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  // Record action helper
  const recordAction = useCallback((action: HistoryAction) => {
    push(action)
  }, [push])

  return {
    recordAction,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  }
}
```

---

## Step 3: Create Undo/Redo Buttons Component

### src/components/ui/UndoRedoButtons.tsx

```typescript
import { useHistoryStore } from '../../stores/historyStore'

export function UndoRedoButtons() {
  const { undo, redo, canUndo, canRedo } = useHistoryStore()

  return (
    <div className="flex gap-1">
      <button
        onClick={undo}
        disabled={!canUndo()}
        className={`px-3 py-2 rounded transition-colors ${
          canUndo()
            ? 'bg-gray-100 hover:bg-gray-200'
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
        title="Undo (Ctrl+Z)"
      >
        ↶
      </button>
      <button
        onClick={redo}
        disabled={!canRedo()}
        className={`px-3 py-2 rounded transition-colors ${
          canRedo()
            ? 'bg-gray-100 hover:bg-gray-200'
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }`}
        title="Redo (Ctrl+Y)"
      >
        ↷
      </button>
    </div>
  )
}
```

---

## Step 4: Update Toolbar with Undo/Redo

### src/components/canvas/Toolbar.tsx (modify)

Add UndoRedoButtons to Toolbar:

```typescript
import { useCanvas } from '../../hooks/useCanvas'
import { useEditorStore } from '../../stores/editorStore'
import { UndoRedoButtons } from '../ui/UndoRedoButtons'
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
    <div className="bg-white border-b px-4 py-2 flex gap-2 items-center">
      {/* Undo/Redo */}
      <UndoRedoButtons />
      
      <div className="w-px h-6 bg-gray-300 mx-2" />
      
      {/* Tools */}
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

## Step 5: Integration Example (for useCanvas.ts)

After Task 02, update useCanvas.ts to record actions:

```typescript
// In useCanvas.ts, import useHistory
import { useHistory } from './useHistory'

// In the hook
const { recordAction } = useHistory()

// When adding object, record action
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
  
  // Record for undo
  recordAction({
    type: 'add_object',
    description: 'Add rectangle',
    undo: () => {
      canvas.remove(rect)
      canvas.renderAll()
    },
    redo: () => {
      canvas.add(rect)
      canvas.renderAll()
    },
  })
}, [recordAction])
```

---

## Step 6: Verify

```bash
npm run dev
# 1. Add rectangle
# 2. Press Ctrl+Z - rectangle disappears
# 3. Press Ctrl+Y - rectangle reappears
# 4. Click Undo button - works
# 5. Click Redo button - works
# 6. Button disabled states work correctly

npm run build
npm run lint
```

---

## Completion Checklist

- [ ] historyStore created
- [ ] useHistory hook created
- [ ] UndoRedoButtons component created
- [ ] Toolbar updated with undo/redo
- [ ] Ctrl+Z works
- [ ] Ctrl+Y works
- [ ] Button states update correctly
- [ ] Build passes
- [ ] Lint passes

---

## Files Created/Modified

| File | Action |
|------|--------|
| src/stores/historyStore.ts | NEW |
| src/hooks/useHistory.ts | NEW |
| src/components/ui/UndoRedoButtons.tsx | NEW |
| src/components/canvas/Toolbar.tsx | MODIFY |
| src/hooks/useCanvas.ts | MODIFY (integration) |

---

## Note: Parallel Execution

This task creates the undo/redo infrastructure. The actual integration with canvas operations (recordAction calls) should be done after Task 02 merges, or in a coordinated commit.
