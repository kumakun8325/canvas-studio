---
name: tdd-workflow
description: "TDD (Test-Driven Development) workflow: RED → GREEN → REFACTOR"
---

# TDD Workflow Skill

## Overview

TDD (Test-Driven Development) is a development approach where tests are written BEFORE implementation. This ensures code is testable, requirements are clear, and edge cases are considered upfront.

## The TDD Cycle

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              RED → GREEN → REFACTOR → REPEAT                │
│                                                             │
│   RED:      Write a failing test (code doesn't exist yet)   │
│   GREEN:    Write minimal code to make test pass            │
│   REFACTOR: Improve code quality, keep tests passing        │
│   REPEAT:   Next test case / feature                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Step-by-Step Process

### Phase 1: RED - Write Failing Test

```typescript
// Step 1: Create test file
// src/utils/calculator.test.ts

import { describe, it, expect } from 'vitest'
import { calculateTotal } from './calculator'

describe('calculateTotal', () => {
  it('should calculate total with tax', () => {
    // Arrange
    const amount = 100
    const taxRate = 0.1
    
    // Act
    const result = calculateTotal(amount, taxRate)
    
    // Assert
    expect(result).toBe(110)
  })
})
```

```bash
# Step 2: Run test - it should FAIL
npm test

# Expected output:
# ✗ calculateTotal > should calculate total with tax
#   Error: calculateTotal is not defined
```

**CRITICAL**: The test MUST fail at this point. If it passes, something is wrong.

### Phase 2: GREEN - Minimal Implementation

```typescript
// Step 3: Create implementation file
// src/utils/calculator.ts

export function calculateTotal(amount: number, taxRate: number): number {
  return amount * (1 + taxRate)
}
```

```bash
# Step 4: Run test - it should PASS
npm test

# Expected output:
# ✓ calculateTotal > should calculate total with tax
```

**IMPORTANT**: Write ONLY enough code to pass the test. No extra features.

### Phase 3: REFACTOR - Improve Code

```typescript
// Step 5: Refactor while keeping tests green
// src/utils/calculator.ts

/**
 * Calculate total amount including tax
 * @param amount - Base amount before tax
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns Total amount including tax
 */
export function calculateTotal(amount: number, taxRate: number): number {
  const taxMultiplier = 1 + taxRate
  return amount * taxMultiplier
}
```

```bash
# Step 6: Run test - it should still PASS
npm test

# Expected output:
# ✓ calculateTotal > should calculate total with tax
```

### Phase 4: Add More Test Cases

```typescript
// Step 7: Add edge cases
describe('calculateTotal', () => {
  it('should calculate total with tax', () => {
    expect(calculateTotal(100, 0.1)).toBe(110)
  })
  
  it('should handle zero amount', () => {
    expect(calculateTotal(0, 0.1)).toBe(0)
  })
  
  it('should handle zero tax rate', () => {
    expect(calculateTotal(100, 0)).toBe(100)
  })
  
  it('should handle negative amount', () => {
    expect(calculateTotal(-100, 0.1)).toBe(-110)
  })
})
```

Repeat the RED → GREEN → REFACTOR cycle for each new test case.

## Test Structure: AAA Pattern

Always structure tests using Arrange-Act-Assert:

```typescript
it('should do something', () => {
  // Arrange - Setup test data and dependencies
  const input = createTestData()
  const mockService = vi.fn()
  
  // Act - Execute the code under test
  const result = functionUnderTest(input)
  
  // Assert - Verify the expected outcome
  expect(result).toEqual(expectedOutput)
  expect(mockService).toHaveBeenCalledWith(expectedArgs)
})
```

## Query Priority (Testing Library)

When testing UI components, prefer queries in this order:

1. **Accessible queries** (best)
   - `getByRole`, `getByLabelText`, `getByPlaceholderText`
   
2. **Semantic queries**
   - `getByAltText`, `getByTitle`
   
3. **Test IDs** (last resort)
   - `getByTestId`

```typescript
// ✅ Good - Role-based
screen.getByRole('button', { name: /submit/i })

// ✅ Good - Label-based
screen.getByLabelText(/email/i)

// ⚠️ Acceptable - Test ID
screen.getByTestId('submit-button')

// ❌ Avoid - Implementation detail
screen.getByClassName('btn-primary')
```

## Coverage Requirements

| Metric | Minimum | Critical Code |
|--------|---------|---------------|
| Line coverage | 80%+ | 100% |
| Branch coverage | 70%+ | 90%+ |
| Function coverage | 90%+ | 100% |

### Critical Code (100% coverage required)

- Financial calculations
- Authentication logic
- Security-critical code
- Core business logic
- Data validation

## Mocking Guidelines

### When to Mock

- ✅ External APIs
- ✅ Database calls
- ✅ File system operations
- ✅ Time-dependent code
- ✅ Random values

### When NOT to Mock

- ❌ Pure functions
- ❌ Simple utilities
- ❌ Data transformations

### Mock Examples

```typescript
// Mock API call
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Test' })
}))

// Mock timer
vi.useFakeTimers()
vi.setSystemTime(new Date('2024-01-01'))

// Mock module
vi.mock('fs', () => ({
  readFileSync: vi.fn().mockReturnValue('file content')
}))
```

## Anti-Patterns to Avoid

### ❌ Testing Implementation Details

```typescript
// Bad - testing internal state
it('should set isLoading to true', () => {
  const { result } = renderHook(() => useData())
  expect(result.current.state.isLoading).toBe(true)
})
```

### ✅ Test User-Visible Behavior

```typescript
// Good - testing what user sees
it('should show loading indicator', () => {
  render(<DataComponent />)
  expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
```

### ❌ Tests Depend on Each Other

```typescript
// Bad - shared mutable state
let counter = 0
it('test 1', () => { counter++ })
it('test 2', () => { expect(counter).toBe(1) }) // Depends on test 1
```

### ✅ Independent Tests

```typescript
// Good - each test is isolated
it('test 1', () => {
  const counter = createCounter()
  counter.increment()
  expect(counter.value).toBe(1)
})

it('test 2', () => {
  const counter = createCounter()
  expect(counter.value).toBe(0)
})
```

## Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific file
npm test -- src/utils/calculator.test.ts

# Run in watch mode
npm test -- --watch

# Run with UI (Vitest)
npm test -- --ui
```
