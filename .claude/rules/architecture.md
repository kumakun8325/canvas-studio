# Architecture Rules

## Layer Structure

```
┌─────────────────────────────────────┐
│           Pages (routes)            │  ← Entry points
├─────────────────────────────────────┤
│           Components                │  ← UI logic
├─────────────────────────────────────┤
│    Hooks          │    Stores       │  ← State management
├───────────────────┴─────────────────┤
│           Services                  │  ← Business logic
├─────────────────────────────────────┤
│             Lib                     │  ← Utilities
└─────────────────────────────────────┘
```

## Dependency Rules

### Allowed Dependencies

| Layer | Can Import From |
|-------|-----------------|
| Pages | Components, Hooks, Stores |
| Components | Hooks, Stores, Lib, Types |
| Hooks | Stores, Services, Lib, Types |
| Stores | Services, Lib, Types |
| Services | Lib, Types |
| Lib | Types only |

### Forbidden Dependencies

- Components must NOT import Services directly
- Services must NOT import React or Zustand
- Lib must NOT import anything except Types

## Canvas Architecture

### Fabric.js Integration

```
┌─────────────────────────────────────┐
│         React Component             │
│  ┌───────────────────────────────┐  │
│  │     useCanvas hook            │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   canvasStore (Zustand) │  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │  fabric.Canvas    │  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Canvas State Flow

1. User interaction → Fabric.js event
2. Event handler → Zustand store update
3. Store change → React re-render (if needed)
4. Avoid: React state → Fabric.js sync (causes loops)

## State Management Strategy

### When to Use What

| State Type | Location | Example |
|------------|----------|---------|
| UI state | `useState` | Modal open/close |
| Form state | `useState` | Input values |
| Shared state | Zustand | Canvas objects, selection |
| Server state | (Future) React Query | User data, saved designs |
| URL state | URL params | Current page, filters |

### Store Design Principles

```typescript
// Good: Flat structure
interface CanvasStore {
  width: number
  height: number
  objects: CanvasObject[]
  selectedIds: string[]
}

// Avoid: Deep nesting
interface BadStore {
  canvas: {
    dimensions: {
      width: number
      height: number
    }
    state: {
      objects: { ... }
    }
  }
}
```

## Service Design

### Single Responsibility

Each service handles one domain:

| Service | Responsibility |
|---------|----------------|
| `exportService` | Export canvas to various formats |
| `canvasService` | Canvas manipulation utilities |
| `storageService` | Local/cloud storage operations |

### Service Interface Pattern

```typescript
// Pure functions, no side effects on module load
export const exportService = {
  toPNG: async (canvas: Canvas): Promise<Blob> => { ... },
  toPDF: async (canvas: Canvas, options: PDFOptions): Promise<Blob> => { ... },
}
```

## Error Boundaries

### Placement

- Root level: Catch-all fallback
- Feature level: Isolate failures
- Canvas level: Prevent canvas crashes from breaking app

### Recovery Strategy

```typescript
// Canvas errors: Offer reset
// Network errors: Offer retry
// Unknown errors: Show generic message + reload option
```
