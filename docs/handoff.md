# Handoff Document

## Current Task
**Status**: `READY_FOR_CLAUDE`
**Assigned To**: Claude Code (Multiple Workers)

---

## Parallel Tasks Available

| Task | Worker | Branch | Dependencies |
|------|--------|--------|--------------|
| [task_02.md](./task_02.md) | Worker 1 | `feature/task-02-canvas` | None |
| [task_03.md](./task_03.md) | Worker 2 | `feature/task-03-slides` | Uses slideStore from Task 02 |
| [task_04.md](./task_04.md) | Worker 3 | `feature/task-04-undo` | Integrates with useCanvas from Task 02 |

---

## Recommended Execution Order

### Option A: Sequential (Safer)
```
Task 02 → Merge → Task 03 + Task 04 (parallel) → Merge
```

### Option B: Parallel with Coordination
All three workers start simultaneously:
- Worker 1: Task 02 (full implementation, will have store conflicts to resolve)
- Worker 2: Task 03 (creates slide components, imports stores)
- Worker 3: Task 04 (creates history system, toolbar integration)

**Note**: Task 03 and 04 depend on stores from Task 02. If running in parallel:
- Each worker creates their own branch
- Worker 1 (Task 02) merges first
- Workers 2 and 3 rebase on main after Task 02 merges

---

## Worker Instructions

### Worker 1 (Task 02: Canvas)
```
/start 02
```
Create branch: `feature/task-02-canvas`

### Worker 2 (Task 03: Slides)
```
/start 03
```
Create branch: `feature/task-03-slides`

### Worker 3 (Task 04: Undo/Redo)
```
/start 04
```
Create branch: `feature/task-04-undo`

---

## After Completion

Each worker runs `/finish` which:
1. Runs code-review
2. Verifies build/lint
3. Commits and pushes
4. Creates PR

Antigravity will:
1. Review PRs
2. Merge in order (02 → 03 → 04)
3. Resolve any conflicts

---

## Task Summaries

### Task 02: Basic Canvas
- Zustand stores (editorStore, slideStore)
- useCanvas hook with Fabric.js
- CanvasView component
- Toolbar component
- Editor page

### Task 03: Slide Management
- SlideThumb component
- SlideList component with drag reorder
- Slide add/delete/switch

### Task 04: Undo/Redo
- historyStore with undo/redo stacks
- useHistory hook with Ctrl+Z/Y
- UndoRedoButtons component
- Toolbar integration

---

## Notes
- Use exact code from task documents
- Follow module structure in design.md
- Test manually before /finish
