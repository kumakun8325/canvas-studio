---
name: testing
description: "Generate test code. Supports Vitest + Testing Library / Jest / Playwright. Creates unit/integration tests using AAA pattern."
---

# Test Generation Skill

## Usage

```
Write tests for this file: src/hooks/useAuth.ts
```

or

```
Generate tests for this component: src/components/Button.tsx
```

## Supported Frameworks

| Framework | Use Case | File Naming |
|-----------|----------|-------------|
| Vitest + RTL | React components | `*.spec.tsx` |
| Vitest | Functions/hooks | `*.spec.ts` |
| Jest | Node.js | `*.test.ts` |
| Playwright | E2E | `*.e2e.ts` |

## Core Principles

### 1. AAA Pattern (Arrange-Act-Assert)

```typescript
it('should disable button when loading', () => {
  // Arrange: Setup
  render(<Button loading />)
  
  // Act: Execute action
  const button = screen.getByRole('button')
  
  // Assert: Verify
  expect(button).toBeDisabled()
})
```

### 2. Black Box Testing

- Test observable behavior, not implementation details
- Use semantic queries (`getByRole`, `getByLabelText`)
- Don't test internal state directly

```typescript
// ❌ Bad: Hardcoded text
expect(screen.getByText('Loading...')).toBeInTheDocument()

// ✅ Good: Role-based
expect(screen.getByRole('status')).toBeInTheDocument()

// ✅ Good: Pattern matching
expect(screen.getByText(/loading/i)).toBeInTheDocument()
```

### 3. One Test, One Behavior

```typescript
// ✅ Good: Single behavior
it('should disable button when loading', () => {
  render(<Button loading />)
  expect(screen.getByRole('button')).toBeDisabled()
})

// ❌ Bad: Multiple behaviors
it('should handle loading state', () => {
  render(<Button loading />)
  expect(screen.getByRole('button')).toBeDisabled()
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  expect(screen.getByRole('button')).toHaveClass('loading')
})
```

### 4. Semantic Naming

```typescript
it('should show error message when validation fails')
it('should call onSubmit when form is valid')
it('should disable input when isReadOnly is true')
```

## Required Test Scenarios

### Always Required
- [ ] Initial rendering
- [ ] User interaction (click, input)
- [ ] Edge cases (empty, null, undefined)
- [ ] Error states

### Conditional
- [ ] Async operations (API calls)
- [ ] Loading states
- [ ] Form validation
- [ ] Accessibility

## Test Templates

### React Component

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  describe('Initial Rendering', () => {
    it('should render correctly', () => {
      render(<ComponentName />)
      expect(screen.getByRole('...')).toBeInTheDocument()
    })
  })

  describe('User Interaction', () => {
    it('should call onClick when button is clicked', async () => {
      const onClick = vi.fn()
      render(<ComponentName onClick={onClick} />)
      
      await userEvent.click(screen.getByRole('button'))
      
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      render(<ComponentName data={[]} />)
      expect(screen.getByText(/no data/i)).toBeInTheDocument()
    })
  })
})
```

### Custom Hook

```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCustomHook } from './useCustomHook'

describe('useCustomHook', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useCustomHook())
    expect(result.current.value).toBe(initialValue)
  })

  it('should update value when action is called', () => {
    const { result } = renderHook(() => useCustomHook())
    
    act(() => {
      result.current.update(newValue)
    })
    
    expect(result.current.value).toBe(newValue)
  })
})
```

## Coverage Targets

| Category | Target |
|----------|--------|
| Line coverage | 80%+ |
| Branch coverage | 70%+ |
| Function coverage | 90%+ |
