# E2E Command

End-to-end testing workflow using Playwright.

## Usage

`/e2e [generate|run|report] [target]`

## What This Command Does

Invokes the e2e-runner agent to:
1. Generate Playwright tests for user flows
2. Execute tests across browsers (Chrome, Firefox, Safari)
3. Capture artifacts (screenshots, videos, traces) on failure
4. Generate HTML reports and JUnit XML
5. Detect and quarantine flaky tests

## When to Use

- Critical user journeys need validation
- Multi-step workflows need verification
- UI interaction testing required
- Frontend-backend integration testing
- Pre-release verification

## Workflow

1. Analyze user flow from description or existing code
2. Generate Page Object Model pattern tests
3. Run tests across all browsers
4. Capture failure artifacts (screenshots, video, trace)
5. Generate test report
6. Flag flaky tests for review

## Best Practices

DO:
- Use Page Object Model pattern
- Use data-testid for selectors
- Wait for API responses, not arbitrary delays
- Test complete user journeys
- Run in CI/CD pipeline
- Review failure artifacts

DON'T:
- Use brittle CSS selectors
- Test implementation details
- Run against production
- Ignore flaky tests
- Skip artifact review

## Output

```
E2E TEST RESULTS
================
Total: X tests
Passed: Y
Failed: Z
Flaky: W (quarantined)

Browser Results:
- Chrome: X/Y passed
- Firefox: X/Y passed
- Safari: X/Y passed

Artifacts:
- Report: ./playwright-report/index.html
- Screenshots: ./test-results/
- Videos: ./test-results/

Failed Tests:
- [test-name]: [failure reason]
```

## Arguments

$ARGUMENTS:
- `generate <flow>` - Generate tests for user flow
- `run` - Run all E2E tests
- `run <pattern>` - Run tests matching pattern
- `report` - Generate/open test report
