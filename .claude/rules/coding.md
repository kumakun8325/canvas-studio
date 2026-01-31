# Coding Rules

## TypeScript Standards

### Type Safety

- **NO `any`** - Always define proper types
- Use `unknown` for truly unknown types, then narrow with type guards
- Prefer interfaces for object shapes, types for unions/intersections
- Export types from `src/types/`

```typescript
// Bad
function process(data: any) { ... }

// Good
function process(data: CanvasObject) { ... }
```

### Strict Mode Requirements

- `strictNullChecks`: Handle null/undefined explicitly
- `noImplicitAny`: All parameters must have types
- `strictFunctionTypes`: Strict function type checking

## React Patterns

### Component Structure

```typescript
// 1. Imports
import { useState, useCallback } from 'react'

// 2. Types (if component-specific)
interface Props {
  title: string
  onSave: () => void
}

// 3. Component
export function ComponentName({ title, onSave }: Props) {
  // 3a. Hooks (in consistent order)
  const [state, setState] = useState<string>('')
  const store = useCanvasStore()

  // 3b. Derived values
  const isValid = state.length > 0

  // 3c. Callbacks
  const handleClick = useCallback(() => {
    // ...
  }, [dependencies])

  // 3d. Effects
  useEffect(() => {
    // ...
  }, [dependencies])

  // 3e. Render
  return <div>...</div>
}
```

### Hook Rules

- Custom hooks must start with `use`
- Place in `src/hooks/`
- One hook per file
- Return object for multiple values (not array)

```typescript
// Good
export function useCanvas() {
  return { canvas, addObject, removeObject }
}
```

### State Management (Zustand)

- One store per domain
- Keep stores flat, avoid deep nesting
- Use selectors for derived state

```typescript
// Good
const width = useCanvasStore(state => state.width)

// Avoid (causes unnecessary re-renders)
const store = useCanvasStore()
```

## Error Handling

### Service Layer

```typescript
// Return Result type for operations that can fail
type Result<T> = { success: true; data: T } | { success: false; error: string }

export async function exportCanvas(): Promise<Result<Blob>> {
  try {
    const blob = await generateBlob()
    return { success: true, data: blob }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
```

### Component Layer

- Use error boundaries for unexpected errors
- Show user-friendly messages
- Log errors for debugging

## Performance

### Canvas Operations

- Batch Fabric.js operations with `renderOnAddRemove: false`
- Use `requestAnimationFrame` for animations
- Dispose canvas properly on unmount

### React Optimization

- `useMemo` for expensive computations
- `useCallback` for callbacks passed to children
- Avoid inline object/array literals in JSX props

## File Organization

| Type | Location | Naming |
|------|----------|--------|
| Components | `src/components/` | `PascalCase.tsx` |
| Hooks | `src/hooks/` | `useCamelCase.ts` |
| Services | `src/services/` | `camelCaseService.ts` |
| Types | `src/types/` | `camelCase.ts` |
| Constants | `src/constants/` | `UPPER_SNAKE.ts` |
| Utils | `src/lib/` | `camelCase.ts` |
