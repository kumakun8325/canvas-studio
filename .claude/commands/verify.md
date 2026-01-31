# Verify Command

Run comprehensive verification checks before commit/PR.

## Usage

`/verify [mode]`

## Modes

| Mode | Checks | Use Case |
|------|--------|----------|
| `quick` | Build, Types | Fast iteration |
| `full` | All checks | Before PR (default) |
| `pre-commit` | Build, Types, Lint, Logs | Before commit |
| `pre-pr` | All + Security scan | Before PR |

## Verification Steps

Execute in this exact order:

### 1. Build Check
```bash
npm run build
```
If it fails, report errors and STOP.

### 2. Type Check
```bash
npx tsc --noEmit
```
Report any type errors with file:line.

### 3. Lint Check
```bash
npm run lint
```
Report lint warnings and errors.

### 4. Test Check
```bash
npm run test:run
```
Report test results and coverage percentage.

### 5. Console.log Check
```bash
grep -r "console.log" src/ --include="*.ts" --include="*.tsx"
```
Warn if any found (except in designated debug files).

### 6. Git Status
```bash
git status --short
```
Show uncommitted changes.

## Output Format

```
VERIFICATION REPORT
===================
Mode: [quick|full|pre-commit|pre-pr]
Time: [timestamp]

Build:    [PASS/FAIL]
Types:    [PASS/FAIL] (X errors)
Lint:     [PASS/FAIL] (X warnings, Y errors)
Tests:    [PASS/FAIL] (X passed, Y failed, Z% coverage)
Secrets:  [PASS/FAIL]
Logs:     [PASS/WARN] (X console.log found)

CRITICAL ISSUES
---------------
[List any blocking issues]

WARNINGS
--------
[List non-blocking issues]

RECOMMENDATION
--------------
Ready for PR: [YES/NO]
[Suggested fixes if NO]
```

## Quick Reference

```bash
# Fast check during development
/verify quick

# Full check before PR
/verify full

# Pre-commit hook equivalent
/verify pre-commit

# Full + security before PR
/verify pre-pr
```

## Arguments

$ARGUMENTS:
- `quick` - Build and type checks only
- `full` - All checks (default)
- `pre-commit` - Commit-relevant checks
- `pre-pr` - Full + security scan
