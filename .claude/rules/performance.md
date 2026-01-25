# Performance Rules

## Model Selection Strategy

### When to Use Each Model

| Model | Use Case | Cost |
|-------|----------|------|
| Haiku | Simple tasks, quick fixes, formatting | Low |
| Sonnet | Standard coding (90% of work) | Medium |
| Opus | Complex architecture, 5+ files, deep reasoning | High |

### Escalation Triggers

Upgrade to Opus when:
- Task spans 5+ files
- Previous attempt failed
- Requires deep architectural reasoning
- Complex refactoring needed

## Context Window Management

### Token Budget

```
Total: 200k tokens
- System prompt: ~5k
- CLAUDE.md + rules: ~10k
- Tools/MCPs: 20-50k (varies)
- Conversation: Remaining
```

### Optimization Techniques

1. **Use `/compact` proactively** - Before context exceeds 50%
2. **Limit active MCPs** - Max 10 enabled per project
3. **Scope sub-agents narrowly** - Give specific, limited tasks
4. **Clean conversation** - Use `/clear` for fresh starts

### Sub-Agent Best Practices

```markdown
# Good: Specific scope
"Review the exportService.ts file for security issues"

# Bad: Unbounded scope
"Review the entire codebase for issues"
```

## React Performance

### Memoization

```typescript
// Memoize expensive computations
const processedData = useMemo(() => {
  return heavyComputation(data)
}, [data])

// Memoize callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// Memoize components that receive stable props
const MemoizedChild = memo(ChildComponent)
```

### Avoid Re-render Triggers

```typescript
// BAD: New object on every render
<Component style={{ color: 'red' }} />

// GOOD: Stable reference
const style = useMemo(() => ({ color: 'red' }), [])
<Component style={style} />

// BAD: Inline function
<Component onClick={() => handleClick(id)} />

// GOOD: Memoized callback
const onClick = useCallback(() => handleClick(id), [id])
<Component onClick={onClick} />
```

### Zustand Selectors

```typescript
// BAD: Subscribes to entire store
const store = useCanvasStore()
const width = store.width

// GOOD: Subscribes only to width
const width = useCanvasStore(state => state.width)

// GOOD: Multiple values with shallow compare
const { width, height } = useCanvasStore(
  state => ({ width: state.width, height: state.height }),
  shallow
)
```

## Canvas (Fabric.js) Performance

### Batch Operations

```typescript
// BAD: Multiple renders
canvas.add(obj1)
canvas.add(obj2)
canvas.add(obj3)

// GOOD: Single render
canvas.renderOnAddRemove = false
canvas.add(obj1)
canvas.add(obj2)
canvas.add(obj3)
canvas.renderOnAddRemove = true
canvas.requestRenderAll()
```

### Object Caching

```typescript
// Enable for complex objects
object.objectCaching = true

// Disable when frequently changing
object.objectCaching = false
```

### Animation

```typescript
// Use requestAnimationFrame
function animate() {
  // Update canvas
  canvas.requestRenderAll()
  requestAnimationFrame(animate)
}
```

## Bundle Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const HeavyEditor = lazy(() => import('./HeavyEditor'))

// Use Suspense boundary
<Suspense fallback={<Loading />}>
  <HeavyEditor />
</Suspense>
```

### Tree Shaking

```typescript
// BAD: Imports entire library
import _ from 'lodash'

// GOOD: Import specific functions
import { debounce } from 'lodash-es'
```

## Monitoring

### Development

- React DevTools Profiler
- Chrome Performance tab
- Lighthouse audits

### Production

- Consider Web Vitals monitoring
- Track bundle size in CI
