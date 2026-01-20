# Task 03: Slide Management

## Overview
Implement slide list sidebar with thumbnails, add/delete/reorder functionality.

## Prerequisites
- Task 01 completed
- **Can run in parallel with Task 02** (uses same slideStore)

---

## Step 1: Create SlideThumb Component

### src/components/slides/SlideThumb.tsx

```typescript
interface SlideThumbProps {
  slideId: string
  index: number
  isActive: boolean
  thumbnail?: string
  onSelect: () => void
  onDelete: () => void
}

export function SlideThumb({
  slideId,
  index,
  isActive,
  thumbnail,
  onSelect,
  onDelete,
}: SlideThumbProps) {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer group ${
        isActive ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {/* Slide number */}
      <div className="absolute top-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
        {index + 1}
      </div>
      
      {/* Thumbnail or placeholder */}
      <div className="w-32 h-20 bg-white border rounded shadow-sm flex items-center justify-center">
        {thumbnail ? (
          <img src={thumbnail} alt={`Slide ${index + 1}`} className="w-full h-full object-cover rounded" />
        ) : (
          <span className="text-gray-400 text-xs">Slide {index + 1}</span>
        )}
      </div>
      
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  )
}
```

---

## Step 2: Create SlideList Component

### src/components/slides/SlideList.tsx

```typescript
import { SlideThumb } from './SlideThumb'
import { useSlideStore } from '../../stores/slideStore'
import { useEditorStore } from '../../stores/editorStore'

export function SlideList() {
  const { slides, addSlide, deleteSlide, reorderSlides } = useSlideStore()
  const { currentSlideId, setCurrentSlide } = useEditorStore()

  const handleDelete = (slideId: string) => {
    // Don't delete if only one slide
    if (slides.length <= 1) return
    
    // If deleting current slide, select another
    if (slideId === currentSlideId) {
      const index = slides.findIndex((s) => s.id === slideId)
      const newIndex = index > 0 ? index - 1 : 1
      setCurrentSlide(slides[newIndex].id)
    }
    
    deleteSlide(slideId)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('slideIndex', String(index))
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    const fromIndex = Number(e.dataTransfer.getData('slideIndex'))
    if (fromIndex !== toIndex) {
      reorderSlides(fromIndex, toIndex)
    }
  }

  return (
    <div className="w-40 bg-gray-50 border-r p-2 overflow-y-auto">
      <div className="flex flex-col gap-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
          >
            <SlideThumb
              slideId={slide.id}
              index={index}
              isActive={slide.id === currentSlideId}
              thumbnail={slide.thumbnail}
              onSelect={() => setCurrentSlide(slide.id)}
              onDelete={() => handleDelete(slide.id)}
            />
          </div>
        ))}
      </div>
      
      {/* Add slide button */}
      <button
        onClick={addSlide}
        className="w-full mt-2 py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + Add Slide
      </button>
    </div>
  )
}
```

---

## Step 3: Update Editor Page

### src/pages/Editor.tsx (modify)

Add SlideList to the Editor layout:

```typescript
import { useEffect } from 'react'
import { CanvasView } from '../components/canvas/CanvasView'
import { Toolbar } from '../components/canvas/Toolbar'
import { SlideList } from '../components/slides/SlideList'
import { useSlideStore } from '../stores/slideStore'
import { useEditorStore } from '../stores/editorStore'

export function Editor() {
  const { slides } = useSlideStore()
  const { currentSlideId, setCurrentSlide } = useEditorStore()

  useEffect(() => {
    if (slides.length > 0 && !currentSlideId) {
      setCurrentSlide(slides[0].id)
    }
  }, [slides, currentSlideId, setCurrentSlide])

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <div className="flex-1 flex">
        <SlideList />
        <CanvasView slideId={currentSlideId ?? undefined} />
      </div>
    </div>
  )
}
```

---

## Step 4: Verify

```bash
npm run dev
# 1. See slide list on left
# 2. Click "Add Slide" - new slide appears
# 3. Click slide thumbnail - switches active slide
# 4. Hover slide, click X - deletes slide (if more than 1)
# 5. Drag slide to reorder

npm run build
npm run lint
```

---

## Completion Checklist

- [ ] SlideThumb component created
- [ ] SlideList component created
- [ ] Editor page updated with SlideList
- [ ] Add slide works
- [ ] Delete slide works
- [ ] Switch slide works
- [ ] Drag reorder works
- [ ] Build passes
- [ ] Lint passes

---

## Files Created/Modified

| File | Action |
|------|--------|
| src/components/slides/SlideThumb.tsx | NEW |
| src/components/slides/SlideList.tsx | NEW |
| src/pages/Editor.tsx | MODIFY |
