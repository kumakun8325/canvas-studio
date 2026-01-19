---
description: Complete implementation and hand off for verification
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
model: inherit
---

# /finish - Complete Implementation

Complete implementation and hand off to Antigravity for verification.

## Automatic Quality Checks

> **Important**: Execute the following skills in order. Fix issues before proceeding to next.

### Step 1: Code Review (Auto)

Run `code-review` skill on changed files:

```
Review the changed files
```

Checklist:
- [ ] No quality issues
- [ ] No performance issues
- [ ] No security issues

**Fix critical issues before proceeding.**

### Step 2: Documentation Check (Auto)

Run `docstring` skill on new/changed functions and classes:

```
Add documentation to newly added functions
```

Checklist:
- [ ] Public functions have JSDoc/docstring
- [ ] Parameters and return values documented

### Step 3: Test Check (Auto)

If tests are missing, run `testing` skill:

```
Generate tests for new features
```

Then run tests:
```bash
npm run test
```

Checklist:
- [ ] Tests exist
- [ ] Tests pass

### Step 4: Refactoring Check (Auto)

For long functions or duplicate code, run `refactoring` skill:

```
Refactor this file
```

Checklist:
- [ ] Functions are under 50 lines
- [ ] No duplicate code

---

## Manual Checks

### 5. Build Verification
```bash
npm run lint
npm run build
```

### 6. Update Task Document
Edit `docs/task_XX.md`:
- Mark completed steps with `[x]`

### 7. Update Documentation (if needed)
- `docs/requirements.md` - Add new requirement IDs
- `docs/design.md` - Update architecture/types

### 8. Update handoff.md

```markdown
## Current Task
**Status**: `READY_FOR_VERIFY`
**Assigned To**: Antigravity

## Handoff: Claude → Antigravity
### Completed Work
- [What was implemented]

### Changed Files
- path/to/file1.ts
- path/to/file2.ts

### Test Instructions
1. Run `npm run dev`
2. Open http://localhost:5173/
3. [Test steps]

### Known Issues
- [Limitations or known issues]
```

### 9. Update SESSION_LOG.md

```markdown
## YYYY-MM-DD

### Completed
- Task #XX: [Description]

### Changed Files
- file1.ts
- file2.ts
```

### 10. Verify Functionality
```bash
npm run dev
```

### 11. Commit & Push
```bash
git add .
git commit -m "feat: Implement #XX - description"
git push -u origin HEAD
```

### 12. Create PR
```bash
gh pr create --title "feat: description" --body "Closes #XX"
```

---

## Final Checklist

### Auto Skills
- [ ] code-review executed
- [ ] docstring verified
- [ ] testing verified
- [ ] refactoring verified

### Build & Test
- [ ] lint passed
- [ ] build passed
- [ ] test passed

### Documentation
- [ ] Task document updated
- [ ] handoff.md updated
- [ ] SESSION_LOG.md updated

### Completion
- [ ] Functionality verified
- [ ] Committed
- [ ] PR created
