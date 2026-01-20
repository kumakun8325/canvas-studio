# Task 01: Project Initialization

## Overview
Initialize canvas-studio with Vite + React + TypeScript and install all dependencies.

## Prerequisites
- Node.js 20.x
- WSL2 Ubuntu environment
- Working directory: `~/projects/canvas-studio`

---

## Step 1: Create Vite Project

```bash
# In canvas-studio directory (already has git repo)
npx create-vite@latest . --template react-ts --y
```

> **Note**: Use `.` to initialize in current directory. The `--y` flag auto-accepts defaults.

---

## Step 2: Install Dependencies

### Core Dependencies
```bash
npm install fabric@6.5.4 zustand@5 firebase@11 pdf-lib@1.17.1
```

| Package | Version | Purpose |
|---------|---------|---------|
| fabric | 6.5.4 | Canvas rendering |
| zustand | 5.x | State management |
| firebase | 11.x | Auth, Firestore, Storage |
| pdf-lib | 1.17.1 | PDF export |

### Dev Dependencies
```bash
npm install -D tailwindcss@4 @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom jsdom @types/node
```

| Package | Purpose |
|---------|---------|
| tailwindcss@4 | Styling |
| @tailwindcss/vite | Vite plugin |
| vitest | Unit testing |
| @testing-library/react | Component testing |
| @testing-library/jest-dom | Jest matchers |
| jsdom | DOM simulation |
| @types/node | Node.js types |

---

## Step 3: Configure Tailwind CSS v4

### 3.1 Update vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 3.2 Update src/index.css

```css
@import "tailwindcss";
```

---

## Step 4: Configure Vitest

### 4.1 Create vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

### 4.2 Create src/test/setup.ts

```typescript
import '@testing-library/jest-dom'
```

### 4.3 Update package.json scripts

Add to `"scripts"`:
```json
"test": "vitest",
"test:run": "vitest run"
```

---

## Step 5: Create Directory Structure

```bash
mkdir -p src/{components/{canvas,slides,export,templates,ui},hooks,stores,services,types,lib,pages,constants,test}
```

Expected structure:
```
src/
├── components/
│   ├── canvas/
│   ├── slides/
│   ├── export/
│   ├── templates/
│   └── ui/
├── hooks/
├── stores/
├── services/
├── types/
├── lib/
├── pages/
├── constants/
└── test/
```

---

## Step 6: Create Type Definitions

### 6.1 Create src/types/index.ts

```typescript
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
```

### 6.2 Create src/types/fabric.d.ts

```typescript
import 'fabric'

declare module 'fabric' {
  interface FabricObject {
    id?: string
  }
}
```

---

## Step 7: Verify Setup

```bash
# Build check
npm run build

# Dev server
npm run dev

# Test
npm run test:run
```

---

## Completion Checklist

- [ ] Vite project initialized
- [ ] All dependencies installed
- [ ] Tailwind CSS v4 configured
- [ ] Vitest configured
- [ ] Directory structure created
- [ ] Type definitions created
- [ ] Build passes
- [ ] Dev server runs
- [ ] Test command works

---

## Next Task
After completing this task, proceed to **Task 02: Basic Canvas** (Phase 2).
