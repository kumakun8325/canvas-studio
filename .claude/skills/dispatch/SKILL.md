---
name: dispatch
description: "設計完了後、実装タスクをGitHub Issueとして作成し、GLM-4.7による並列実装を自動トリガー"
---

# Dispatch Skill

設計フェーズ完了後、実装タスクを分析し、依存関係を考慮してGitHub Issueを作成、並列実装を自動起動します。

## Usage

```
/dispatch
```

または、特定のタスクを指定:

```
/dispatch task_02, task_03, task_04
```

## Process

### Step 1: タスク分析（効率的なフィルタリング）

**3層フィルタリングでコンテキスト消費を最小化:**

#### 1.1 インデックス読み込み（必須）
`docs/tasks.md` のみ読み込み、チェックボックスでステータス確認:
- `[ ]` → pending（対象）
- `[x]` → completed（スキップ）

```
例: Phase 4 は全て [x] → スキップ
    Phase 2 は [ ] が残っている → 対象
```

#### 1.2 GitHub Issues チェック
```bash
gh issue list --label "claude-auto" --state all --json number,title,state
```
- 既存Issueがあれば重複作成しない
- closed Issue のタスクは完了済みとして扱う

#### 1.3 詳細ファイル読み込み（必要な分のみ）
pending タスクの `docs/task_*.md` のみ読み込み:
- **Prerequisites**: 事前に必要なタスク
- **Dependencies**: 並列実行可能性の記述
- **Completion Checklist**: 完了条件

**重要**: 完了済みタスクの詳細ファイルは読み込まない

### Step 2: 依存関係グラフ構築

```
依存関係の例:
Task 02 ─┬─→ Task 03 (並列可能、同じstoreを使用)
         └─→ Task 04 (並列可能)
               ↓
         Task 05 (02, 03, 04 完了後)
```

依存パターンを分類:
- **独立**: 他に依存なし → 即座に並列実行可能
- **並列可能**: 同じリソースを使うが独立 → 並列実行可能
- **直列必須**: 前タスク完了が必要 → 待機が必要

### Step 3: Issue作成（依存関係付き）

```bash
# 独立タスク（queue-1）
gh issue create \
  --title "feat: Task 02 - Basic Canvas" \
  --body "..." \
  --label "claude-auto,queue-1"

# 並列可能タスク（queue-1、同じ優先度）
gh issue create \
  --title "feat: Task 03 - Slide Management" \
  --body "..." \
  --label "claude-auto,queue-1"

# 依存タスク（queue-2、Task 02完了後）
gh issue create \
  --title "feat: Task 05 - Firebase" \
  --body "..." \
  --label "claude-auto,queue-2"
```

Issue本文には以下を含める:
```markdown
## 概要
[タスク概要]

## 依存関係
- **Requires**: #XX (Task 02)  ← 必須の前提
- **Parallel with**: #YY       ← 並列実行可能

## 実装内容
[task_XX.md からコピー]

## 受け入れ条件
[Completion Checklist からコピー]

## 参考ファイル
- 詳細: `docs/task_XX.md`
- 設計: `.kiro/steering/design.md`
```

### Step 4: Batch Workflow起動

依存関係を考慮して段階的にトリガー:

```bash
# Phase 1: 独立タスクを並列実行
gh workflow run claude-batch.yml \
  -f issue_numbers="1,2,3" \
  -f mode="auto"

# Phase 2: Phase 1 完了後、依存タスクを実行
# → claude-auto-continue.yml が自動でキューから取得
```

### Step 5: 実行プラン表示

```
## Dispatch Plan

### Phase 1 (並列実行)
┌──────────┬──────────┬──────────┐
│ Issue #1 │ Issue #2 │ Issue #3 │
│ Task 02  │ Task 03  │ Task 04  │
│ 依存なし │ 依存なし │ 依存なし │
└──────────┴──────────┴──────────┘

### Phase 2 (Phase 1 完了後)
┌──────────┐
│ Issue #4 │
│ Task 05  │
│ Requires: #1, #2, #3 │
└──────────┘

### Actions
- Created Issues: #1, #2, #3, #4
- Triggered: claude-batch.yml with issues 1,2,3
- Queue: Issue #4 (queue-2, auto-triggered after Phase 1)

[View Actions](https://github.com/owner/repo/actions)
```

## 依存関係の判断基準

| パターン | 判断 | 例 |
|----------|------|-----|
| "No dependencies" | 即座に並列実行 | Task 02, 03, 04 |
| "Can run in parallel with X" | 同じqueue-Nで並列実行 | Task 03 ↔ Task 04 |
| "Prerequisites: Task X completed" | queue-N+1 で待機 | Task 05 → Task 02 |
| "Uses same store" | 並列可能だが注意 | slideStore使用 |

## 自動判断ロジック

1. **`docs/tasks.md` を読み込み、pending タスクを特定**
   - `[ ]` のタスクのみ抽出
   - Phase単位でグループ化
2. **GitHub Issues をチェックし、既存Issueを除外**
   ```bash
   gh issue list --label "claude-auto" --state all
   ```
3. **pending タスクの詳細ファイルのみ読み込み**
   - 例: Phase 2 が pending → `docs/task_02.md` のみ読み込み
   - Phase 4 が completed → `docs/task_04.md` はスキップ
4. **Prerequisites セクションをパース**
5. **依存グラフを構築**
6. **トポロジカルソートで実行順を決定**
7. **同一レベルのタスクは並列実行**
8. **Issue作成時にqueue-N ラベルを付与**

### フィルタリング例

```
docs/tasks.md の状態:
  Phase 1: [x] [x] [x] → SKIP (completed)
  Phase 2: [ ] [ ] [ ] → READ task_02.md
  Phase 3: [ ] [ ] [ ] → READ task_03.md
  Phase 4: [x] [x] [x] → SKIP (completed)
  Phase 5: [ ] [ ] [ ] → READ task_05.md (依存: Phase 2,3 完了後)

GitHub Issues:
  #10 "Task 02" (open) → SKIP (既にIssue存在)
  #11 "Task 03" (closed) → SKIP (完了済み)

結果:
  - task_02.md は読み込むが Issue作成しない（既存）
  - task_03.md は読み込まない（closed Issue = 完了）
  - task_05.md を読み込み、Phase 2,3 完了待ちでキュー
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| mode | 実行モード (auto/tdd) | auto |
| dry-run | Issueを作成せずプランのみ表示 | false |
| tasks | 特定のタスクのみ指定 | all |

## 実行例

```
User: /dispatch

Claude:
## Task Analysis

Found 4 task files:
- docs/task_02.md: Basic Canvas (no dependencies)
- docs/task_03.md: Slide Management (parallel with Task 02)
- docs/task_04.md: Undo/Redo (parallel with Task 02)
- docs/task_05.md: Firebase (requires Task 02, 03, 04)

## Dependency Graph

```
Task 02 ─┬─→ Task 03 ─┐
         │            ├─→ Task 05
         └─→ Task 04 ─┘
```

## Dispatch Plan

### Phase 1 (parallel)
- Task 02, Task 03, Task 04

### Phase 2 (after Phase 1)
- Task 05

Proceed with dispatch? [Y/n]
```

## Notes

- 各タスクは独立して実装可能な粒度に分割されていることを前提
- 循環依存がある場合はエラーを報告
- 5件以上の並列実行は max_parallel で制限
- タスクファイルが存在しない場合は handoff.md から抽出を試みる

## タスク完了の自動更新

### 自動 [x] マーキング
`task-completion.yml` ワークフローが自動で `docs/tasks.md` を更新:

| トリガー | 動作 |
|---------|------|
| `claude-auto` ラベル付きIssueがクローズ | 該当Phase/Taskを [x] に更新 |
| PRがmainにマージ（`Closes #N` を含む） | 該当Phase/Taskを [x] に更新 |

**Issue タイトル命名規則** (自動認識用):
- `Task 02: Basic Canvas` → Phase 2 全体を完了
- `Phase 3.2: SlideThumb` → Phase 3 の Task 2 を完了

## コンテキスト最適化

### 自動フィルタリング（デフォルト）
- `docs/tasks.md` のチェックボックスで完了判定（自動更新される）
- GitHub Issues の状態で重複防止
- **完了済みタスクの詳細ファイルは読み込まない**

### アーカイブ（オプション）
完了タスクを物理的に分離したい場合:
```bash
# 完了タスクをアーカイブフォルダに移動
mkdir -p docs/archive
mv docs/task_01.md docs/archive/  # Phase 1 完了時
```

ただし、チェックボックス方式で自動フィルタリングされるため、
アーカイブは必須ではありません。
