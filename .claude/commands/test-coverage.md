# Test Coverage Command

Analyze and improve test coverage.

## Usage

`/test-coverage [analyze|improve|report]`

## Workflow

### 1. Run Coverage
```bash
npm run test:coverage
```

### 2. Analyze Results
Read `coverage/coverage-summary.json` and identify:
- Files below 80% coverage threshold
- Untested branches
- Missing edge case coverage

### 3. Generate Tests
For each under-covered file:
- Examine untested branches
- Write unit tests for functions
- Write integration tests for APIs
- Write E2E tests for critical flows

### 4. Verify Tests Pass
```bash
npm run test:run
```

### 5. Report Improvement
Show before/after metrics.

## Coverage Targets

| Metric | Minimum | Critical Code |
|--------|---------|---------------|
| Lines | 80% | 100% |
| Branches | 70% | 90% |
| Functions | 90% | 100% |

## Test Focus Areas

- Happy path scenarios
- Error handling
- Edge cases (null, undefined, empty)
- Boundary conditions

## Output Format

```
TEST COVERAGE REPORT
====================

CURRENT COVERAGE
----------------
Lines:     XX% (target: 80%)
Branches:  XX% (target: 70%)
Functions: XX% (target: 90%)

UNDER-COVERED FILES
-------------------
src/services/exportService.ts    [45%] needs +35%
src/hooks/useCanvas.ts           [62%] needs +18%
src/components/Toolbar.tsx       [78%] needs +2%

RECOMMENDED TESTS
-----------------
1. exportService.ts:
   - Test PDF export with bleed
   - Test CMYK color conversion
   - Test error handling for large files

2. useCanvas.ts:
   - Test object selection
   - Test undo/redo edge cases

AFTER IMPROVEMENTS
------------------
Lines:     XX% (+YY%)
Branches:  XX% (+YY%)
Functions: XX% (+YY%)

STATUS: [PASS/NEEDS WORK]
```

## Arguments

$ARGUMENTS:
- `analyze` - Show current coverage status
- `improve` - Generate tests for low-coverage files
- `report` - Generate detailed coverage report
