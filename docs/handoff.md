# Handoff Document

## Current Task
**Status**: `READY_FOR_IMPLEMENTATION`
**Phase**: Phase 2 - 実装

---

## ワークフロー概要

```
Phase 1: 設計
├── Step 1: 要件・設計          🟣 Opus
├── Step 2: 設計レビュー        🟢 Codex (xhigh)
└── Step 3: 設計改善            🟡 Sonnet

Phase 2: 実装  ← 現在
├── Step 4: 並列実装            🔵 GLM-4.7
└── Step 5: 自己点検            🔵 GLM-4.7

Phase 3: レビュー
├── Step 6: 実装チェック        🟢 Codex (medium)
└── Step 7: 修正Issue作成       🟡 Sonnet (必要時のみ)

Phase 4: 最終レビュー
├── Step 8a: 詳細分析           🟢 Codex (xhigh)
└── Step 8b: 判断・承認         🟡 Sonnet
    └── 【例外】重大変更時      🟣 Opus
```

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

## Worker Instructions (Phase 2: 実装)

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

## After Implementation (Phase 2 → Phase 3)

### Step 5: 自己点検 (🔵 GLM-4.7)
各 Worker が `/finish` を実行:
1. セルフレビュー実施
2. Build/Lint 確認
3. コミット・プッシュ
4. PR作成

### Step 6: 実装チェック (🟢 Codex medium)
- コード品質チェック
- 設計適合性確認
- テストカバレッジ確認

### Step 7: 修正Issue作成 (🟡 Sonnet)
問題があれば Issue 作成

### Step 8: 最終レビュー (🟢 Codex xhigh → 🟡 Sonnet)
1. Codex で詳細分析
2. Sonnet で判断・承認
3. PR マージ (02 → 03 → 04 の順)

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
- 各 Step で適切なモデルを使用してクォータを最適化
