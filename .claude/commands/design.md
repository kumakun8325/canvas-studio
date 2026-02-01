---
description: "Opus設計→GPT-5.2 Codex xhighレビューの一気通しフロー"
allowed-tools: Read, Edit, Write, Bash, Grep, Glob, Task
model: opus
plan-mode: true
---

# /design $ARGUMENTS - 設計 & Codex レビュー

タスクの調査・設計を行い、GPT-5.2-Codex xhigh で自動レビューします。

**Usage**:
- `/design` - 次の未完了タスクを自動検出して設計
- `/design 074` - TASK-074 を指定して設計
- `/design "ダークモード対応"` - 自由記述で設計

---

## Phase 1: タスク特定 (Opus)

### Step 1: 現在のタスク状態を確認

以下のファイルを読み込む:
- `.kiro/steering/tasks.md` - タスク一覧
- `.kiro/steering/design.md` - 既存設計書
- `.kiro/steering/requirements.md` - 要件定義

`$ARGUMENTS` が指定されている場合:
- 数字の場合: TASK-$ARGUMENTS を対象にする
- 文字列の場合: その説明に対応するタスクを特定する

`$ARGUMENTS` が空の場合:
- `tasks.md` から最初の未完了タスク（`[ ]`）を自動検出する

### Step 2: コードベース調査

対象タスクに関連するコードを調査する:

1. **既存の実装確認**: 関連するコンポーネント、hooks、stores、services を Grep/Glob で検索
2. **依存関係の把握**: 変更が影響する範囲を特定
3. **パターン分析**: 既存コードの設計パターンを把握

> 調査は Task ツール (subagent_type=Explore) を活用して効率的に行うこと

---

## Phase 2: 設計作成 (Opus)

### Step 3: タスク仕様書の作成

`docs/task_XX.md` を作成する（XX = タスク番号）:

```markdown
# Task XX: [タスク名]

## 概要
[タスクの目的と背景]

## 要件
- [ ] 要件1
- [ ] 要件2

## 設計

### アーキテクチャ
[変更するレイヤーと影響範囲]

### 変更ファイル
| ファイル | 変更内容 |
|---------|---------|
| src/... | ... |

### 型定義
```typescript
// 新規・変更する型
```

### コンポーネント設計
[新規・変更するコンポーネントの設計]

### ストア設計
[Zustand ストアの変更がある場合]

### テスト方針
[テストの範囲と方針]

## 実装手順
1. Step 1
2. Step 2
...

## リスク・注意点
- [リスク1]
- [リスク2]
```

### Step 4: 設計書を更新（必要な場合）

タスクが既存設計に影響する場合、`.kiro/steering/design.md` の該当セクションも更新する。

---

## Phase 3: Codex レビュー (GPT-5.2-Codex xhigh)

### Step 5: レビュー用プロンプトの構築

タスク仕様書の内容をもとに、レビュープロンプトを構築する。

### Step 6: Copilot CLI でレビュー実行

以下のコマンドを実行する:

```bash
cd /Users/kumabookpro/Projects/personal/canvas-studio

TASK_FILE="docs/task_XX.md"
DESIGN_FILE=".kiro/steering/design.md"
ARCH_RULES=".claude/rules/architecture.md"
REVIEW_DATE=$(date +%Y%m%d)

copilot -p "
以下のタスク設計をレビューしてください。

## レビュー観点
1. **アーキテクチャ整合性**: architecture.md のルールに準拠しているか
2. **型安全性**: TypeScript strict mode に対応できる設計か
3. **テスト容易性**: 単体テスト・統合テストが書きやすい構造か
4. **パフォーマンス**: React/Fabric.js でボトルネックになる箇所
5. **セキュリティ**: Firebase連携・入力処理でリスクのある設計
6. **拡張性**: 将来の機能追加に対応できる構造か
7. **既存コードとの整合性**: 既存の設計パターンと矛盾しないか

## 出力形式（必ずこの形式で出力）
### 総評
[設計の全体評価 1-2文]

### スコア
| 観点 | スコア (1-5) | コメント |
|------|-------------|---------|

### 良い点
- [良い点1]
- [良い点2]

### 問題点（重要度順）
1. **[Critical/Major/Minor]**: [問題の説明]
   - 理由: [なぜ問題か]
   - 修正案: [具体的な修正提案]

### リスク
- [実装時の注意点]

### 推奨事項
- [追加で検討すべきこと]

---

## アーキテクチャルール:
$(cat $ARCH_RULES)

## 全体設計書:
$(cat $DESIGN_FILE)

## タスク設計:
$(cat $TASK_FILE)
" --model gpt-5.2-codex 2>&1 | tee "docs/reviews/design-task-XX-${REVIEW_DATE}.md"
```

> **注意**: 上記の `XX` は実際のタスク番号に置き換えること

### Step 7: レビュー結果の保存

レビュー結果が `docs/reviews/design-task-XX-YYYYMMDD.md` に保存されたことを確認する。

ディレクトリがない場合は作成:
```bash
mkdir -p docs/reviews
```

---

## Phase 4: 結果サマリ

### Step 8: レビュー結果の表示

レビュー結果をユーザーに提示する。以下の形式でサマリを表示:

```
## 設計 & レビュー完了

### タスク
TASK-XXX: [タスク名]

### 作成したファイル
- docs/task_XX.md (タスク仕様書)
- docs/reviews/design-task-XX-YYYYMMDD.md (Codex レビュー結果)

### Codex レビューサマリ
[レビュー結果の要約]

### 次のステップ
- Critical/Major の指摘がある場合: `/model sonnet` で設計改善
- 問題なしの場合: `/dispatch` または `/start XX` で実装開始
```

---

## Notes

- Opus で設計 → Codex (xhigh) でレビュー → Sonnet で改善、のフローを1コマンドで実行
- reasoning effort は copilot CLI のグローバル設定で xhigh に設定済み
- Premium Request: 1回/レビュー
- レビュー結果にCritical指摘がある場合は、設計修正を推奨
- 設計修正後に再度 `/review-design` で再レビュー可能
