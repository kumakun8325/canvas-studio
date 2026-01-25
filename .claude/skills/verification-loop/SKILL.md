---
name: verification-loop
description: Comprehensive verification system for quality assurance before commits and PRs
---

# Verification Loop Skill

A comprehensive verification system for Claude Code sessions.

## When to Use

Invoke this skill:
- After completing a feature or significant code change
- Before creating a PR
- When you want to ensure quality gates pass
- After refactoring
- Every 15 minutes during long sessions

## Verification Phases

### Phase 1: Build Verification

```bash
# Check if project builds
npm run build 2>&1 | tail -20
```

If build fails, STOP and fix before continuing.

### Phase 2: Type Check

```bash
# TypeScript projects
npx tsc --noEmit 2>&1 | head -30
```

Report all type errors. Fix critical ones before continuing.

### Phase 3: Lint Check

```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30
```

### Phase 4: Test Suite

```bash
# Run tests with coverage
npm run test:coverage 2>&1 | tail -50

# Check coverage threshold
# Target: 80% minimum
```

Report:
- Total tests: X
- Passed: X
- Failed: X
- Coverage: X%

### Phase 5: Security Scan

```bash
# Check for secrets
grep -rn "sk-" --include="*.ts" --include="*.js" src/ 2>/dev/null | head -10
grep -rn "api_key" --include="*.ts" --include="*.js" src/ 2>/dev/null | head -10
grep -rn "VITE_.*=" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10

# Check for console.log
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10

# Check for TODO/FIXME
grep -rn "TODO\|FIXME" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
```

### Phase 6: Diff Review

```bash
# Show what changed
git diff --stat
git diff HEAD~1 --name-only
```

Review each changed file for:
- Unintended changes
- Missing error handling
- Potential edge cases

## Output Format

After running all phases, produce a verification report:

```
VERIFICATION REPORT
==================
Time: [timestamp]
Mode: [quick|full|pre-commit|pre-pr]

Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X errors)
Lint:      [PASS/FAIL] (X warnings, Y errors)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (X issues)
Diff:      [X files changed]

Overall:   [READY/NOT READY] for PR

CRITICAL ISSUES
---------------
1. [Issue description with file:line]
2. ...

WARNINGS
--------
1. [Warning description]
2. ...

RECOMMENDATIONS
---------------
[Suggested fixes or improvements]
```

## Modes

| Mode | Phases | Use Case |
|------|--------|----------|
| `quick` | Build, Types | Fast iteration during development |
| `full` | All phases | Standard verification (default) |
| `pre-commit` | Build, Types, Lint, Security | Before committing |
| `pre-pr` | All + detailed security | Before creating PR |

## Continuous Mode

For long sessions, run verification at these checkpoints:

1. **After completing each function** - Quick mode
2. **After finishing a component** - Full mode
3. **Before moving to next task** - Full mode
4. **Every 15 minutes** - Quick mode (mental checkpoint)

```markdown
Set mental checkpoints:
✓ Function complete → /verify quick
✓ Component complete → /verify full
✓ Feature complete → /verify pre-pr
```

## Quick Reference

```bash
# Fast check during development
/verify quick

# Full check (default)
/verify

# Before commit
/verify pre-commit

# Before PR
/verify pre-pr
```

## Integration with Hooks

This skill complements PostToolUse hooks:
- **Hooks**: Catch issues immediately after each edit
- **Verification Loop**: Comprehensive review at milestones

Use both for maximum quality assurance.

## Canvas Studio Specific Checks

### Fabric.js Checks

```bash
# Check for canvas memory leaks
grep -rn "new fabric\." --include="*.ts" --include="*.tsx" src/ | \
  grep -v "dispose" | head -10

# Check for proper event cleanup
grep -rn "\.on\(" --include="*.ts" --include="*.tsx" src/ | \
  grep -v "\.off\(" | head -10
```

### Store Checks

```bash
# Check for direct store mutations
grep -rn "useCanvasStore()" --include="*.ts" --include="*.tsx" src/ | head -10
# Should use selectors: useCanvasStore(state => state.X)
```

## Failure Recovery

If verification fails:

1. **Build fails**: Fix compilation errors first
2. **Types fail**: Check recent changes for type mismatches
3. **Lint fails**: Run `npm run lint -- --fix` for auto-fixable issues
4. **Tests fail**: Review test output, check for regressions
5. **Security issues**: Remove secrets, console.logs before commit

Never proceed to PR with failing critical checks.
