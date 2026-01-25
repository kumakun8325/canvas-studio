# Performance Rules

## Model Selection Strategy

### クォータ最適化モデル選択

| Phase | Step | Model | 用途 | コスト |
|-------|------|-------|------|--------|
| 設計 | 要件・設計 | 🟣 Opus | 複雑な設計・アーキテクチャ | Pro消費 |
| 設計 | 設計レビュー | 🟢 Codex (xhigh) | 設計の問題点洗い出し | Plus内 |
| 設計 | 設計改善 | 🟡 Sonnet | 指摘に基づく改善 | Pro消費（軽量）|
| 実装 | 並列実装 | 🔵 GLM-4.7 | コーディング | Pro消費なし |
| 実装 | 自己点検 | 🔵 GLM-4.7 | セルフレビュー | Pro消費なし |
| レビュー | 実装チェック | 🟢 Codex (medium) | コード品質チェック | Plus内 |
| レビュー | 修正Issue | 🟡 Sonnet | Issue作成（必要時のみ）| Pro消費（軽量）|
| 最終 | 詳細分析 | 🟢 Codex (xhigh) | 詳細な分析 | Plus内 |
| 最終 | 判断・承認 | 🟡 Sonnet | 承認判断 | Pro消費（軽量）|

### Opus使用基準

Opusは以下の場合のみ使用（クォータ節約）:
- 新規アーキテクチャ設計
- 複雑な要件定義
- 5+ ファイルにまたがる設計変更
- 他モデルで失敗した場合のエスカレーション
- 最終レビューで重大な設計変更が必要な場合

### Sonnet使用基準

Extended Thinking OFF で使用:
- Codexの指摘に基づく改善（指摘が明確なため）
- Issue作成
- 最終判断・承認（Codexが詳細分析済みのため）

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
