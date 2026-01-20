# Testing Rules

## Mandatory Requirements

These rules apply to ALL code changes.

### 1. TDD Enforcement

- Tests **MUST** be written BEFORE implementation
- Never skip the RED phase (failing test)
- All new features require tests
- Bug fixes require a failing test that reproduces the bug

### 2. Coverage Requirements

| Metric | Minimum | Critical Code |
|--------|---------|---------------|
| Line coverage | 80%+ | 100% |
| Branch coverage | 70%+ | 90%+ |
| Function coverage | 90%+ | 100% |

**100% coverage required for:**
- Financial calculations
- Authentication logic
- Security-critical code
- Core business logic
- Data validation

### 3. Test Quality Standards

- Use AAA pattern (Arrange-Act-Assert)
- One behavior per test (when practical)
- Descriptive test names (`should [expected behavior] when [condition]`)
- Test behavior, not implementation details
- Independent tests (no shared mutable state)

### 4. Before Commit Checklist

- [ ] All tests pass (`npm test`)
- [ ] Coverage meets requirements (`npm run test:coverage`)
- [ ] No skipped tests without explanation
- [ ] No `console.log` in test files
- [ ] No hardcoded test data that should be mocked

### 5. Required Test Types

| Type | When Required |
|------|---------------|
| Unit tests | All functions and components |
| Integration tests | API endpoints, database operations |
| E2E tests | Critical user flows |

### 6. Naming Conventions

```typescript
// Test file naming
component.test.tsx   // Unit tests
component.spec.tsx   // Also acceptable
component.e2e.ts     // E2E tests

// Test description
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should [expected] when [condition]', () => {})
  })
})
```

## Verification Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/file.test.ts

# Run tests matching pattern
npm test -- --grep "should validate"
```

## Exceptions

If you must skip a test, document the reason:

```typescript
it.skip('should handle edge case', () => {
  // TODO: Skipped because [specific reason]
  // Issue: #123
})
```

Never skip tests without:
1. A documented reason
2. A linked issue for follow-up
3. Team acknowledgment
