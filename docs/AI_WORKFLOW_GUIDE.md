# AI Division Workflow Guide

> Antigravity (Planning/Verification) + Claude (Implementation)

---

## Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Antigravity   │ ──► │     Claude      │ ──► │   Antigravity   │
│     /plan       │     │ /start → /finish│     │     /verify     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Phase 1: Planning (Antigravity)

### Prompt
```
/plan を実行してください。
タスク: [機能/バグ/リファクタリングの説明]
```

### Detailed Prompt
```
以下のタスクの計画を作成してください:

## 概要
[やりたいことの説明]

## 要件
- [要件1]
- [要件2]

/plan ワークフローに従い:
1. GitHub Issueを作成
2. docs/task_XX.md を作成
3. docs/handoff.md を READY_FOR_IMPLEMENTATION に更新
```

### Output
- GitHub Issue created
- `docs/task_XX.md` created
- `docs/handoff.md` status → `READY_FOR_IMPLEMENTATION`

---

## Phase 2: Implementation (Claude)

### Prompt
```
/start
```

That's it. Claude reads `handoff.md` automatically.

### What Claude Does
1. Reads `docs/handoff.md`
2. Reads task document
3. Creates feature branch
4. Implements changes + tests

---

## Phase 3: Implementation Complete (Claude)

### Prompt
```
/finish
```

### What Claude Does
1. Runs tests (workflow-defined)
2. Runs lint/typecheck if configured
3. Commits and pushes
4. Creates PR

---

## Phase 4: Verification (Antigravity)

### Prompt
```
/verify を実行してください。
```

### What Antigravity Does
1. Pulls latest changes
2. Runs `npm run build`
3. Tests the implementation
4. Checks acceptance criteria
5. Confirms AI reviews (Codex/Claude) and auto-fix results

### If PASS
- Updates status → `VERIFIED`
- Updates `docs/tasks.md`

### If FAIL
- Adds feedback to `docs/handoff.md`
- Sets status → `READY_FOR_IMPLEMENTATION`

---

## Phase 5: Fix Issues (Claude)

### Prompt (if verification failed)
```
/start

handoff.md の Feedback Loop を確認し、指摘を修正してください。
```

---

## Full Cycle Example

```
┌────────────────────────────────────────────────────────────────┐
│ 1. [Antigravity]                                               │
│    Prompt: タッチ操作のサポートを計画してください。/plan        │
│                                                                │
│    → Issue #50 created                                         │
│    → docs/task_50_touch.md created                             │
│    → handoff.md → READY_FOR_IMPLEMENTATION                     │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ 2. [Claude]                                                    │
│    Prompt: /start                                              │
│                                                                │
│    → Reads handoff.md                                          │
│    → Creates branch feature/issue-50-touch                     │
│    → Implements touch support                                  │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ 3. [Claude]                                                    │
│    Prompt: /finish                                             │
│                                                                │
│    → Commits and pushes                                        │
│    → Creates PR                                                │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ 4. [Antigravity]                                               │
│    Prompt: /verify を実行してください。                         │
│                                                                │
│    → Tests implementation                                      │
│    → PASS: handoff.md → VERIFIED, update tasks.md              │
│    → FAIL: handoff.md → add feedback, READY_FOR_IMPLEMENTATION │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│ 5. [If FAIL - Claude]                                          │
│    Prompt: /start                                              │
│            Feedback Loop を確認し修正してください。              │
│                                                                │
│    → Reads feedback                                            │
│    → Fixes issues                                              │
│    → /finish                                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/handoff.md` | Task handoff between AIs |
| `docs/task_XX.md` | Detailed task document |
| `.github/workflows/claude-responder.yml` | Claude自動実装トリガー |
| `.github/workflows/claude-batch.yml` | 並列実装 |
| `.github/workflows/codex-review.yml` | Codex自動レビュー |
| `.github/workflows/claude-review.yml` | Claude自動レビュー |

---

## Status Flow

```
IDLE → PLANNING → READY_FOR_IMPLEMENTATION → IMPLEMENTING → READY_FOR_VERIFY → VERIFIED
                         ↑                                    │
                         └──────────── (if FAIL) ─────────────┘
```
