# マルチClaude開発ガイド

tmux + git worktree を使って、複数のClaude Codeを並列で起動し、高速に開発する方法です。

---

## 🎯 概要

```
┌─────────────────────────────────────────────────────────────┐
│  Antigravity (Opus) - PM/統合役                             │
│  ・調査・設計・検証・マージ                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  WSL2: tmux + 複数 Claude Code                              │
│  ┌──────────┬──────────┬──────────┬──────────┐              │
│  │ Worker 1 │ Worker 2 │ Worker 3 │ Worker 4 │              │
│  │Components│  Hooks   │  Stores  │  Tests   │              │
│  └──────────┴──────────┴──────────┴──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 クイックスタート

### 前提条件

```bash
# WSL2環境で確認
tmux -V       # tmux 3.x
node -v       # v20.x
claude --version  # 2.x
git --version # 2.x
```

### セットアップ

```bash
cd /mnt/c/tool/my-project
./scripts/multi-claude-setup.sh my-project 3
```

これで3つのワーカー + mainの4ペインが起動します。

---

## ⚙️ GLM-4.7 設定（コスト削減）

### 方法1: settings.jsonを切り替え

```bash
~/.claude/
├── settings.json           # 現在の設定
├── settings-zai.json       # GLM-4.7用
└── settings-anthropic.json # Anthropic API用
```

**settings-zai.json の例:**
```json
{
  "apiProvider": "openai-compatible",
  "openaiBaseUrl": "https://api.z.ai/api/anthropic",
  "openaiApiKey": "your-zai-api-key"
}
```

**切り替えコマンド:**
```bash
# GLM-4.7に切り替え
cp ~/.claude/settings-zai.json ~/.claude/settings.json

# Anthropicに戻す
cp ~/.claude/settings-anthropic.json ~/.claude/settings.json
```

### 方法2: 環境変数で指定

```bash
export ANTHROPIC_API_KEY="your-zai-api-key"
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
claude
```

### 方法3: 混在利用（PM:Opus、ワーカー:GLM）

```bash
# PM用（Anthropic Opus）
cp ~/.claude/settings-anthropic.json ~/.claude/settings.json
claude --model claude-opus-4-20250514

# ワーカー用（GLM-4.7）
cp ~/.claude/settings-zai.json ~/.claude/settings.json
claude
```

---

## 📋 tmux操作

| 操作 | キー |
|------|------|
| ペイン移動 | `Ctrl+b` → 矢印キー |
| ペイン最大化/復元 | `Ctrl+b` → `z` |
| セッション切断 | `Ctrl+b` → `d` |
| セッション再接続 | `tmux attach -t <name>-dev` |
| 全ペインに同時入力 | `Ctrl+b` → `:setw synchronize-panes on` |
| 同時入力解除 | `Ctrl+b` → `:setw synchronize-panes off` |
| ペインを閉じる | `Ctrl+d` または `exit` |

---

## 🔧 worktree管理

```bash
# 一覧表示
git worktree list

# 削除
git worktree remove ../project-worker-1

# 追加（新規ブランチ）
git worktree add ../project-newfeature -b feature/newfeature

# 追加（既存ブランチ）
git worktree add ../project-existing feature/existing
```

---

## 👥 役割分担の例

### React/TypeScriptプロジェクト

| ワーカー | 担当ディレクトリ | ブランチ |
|----------|-----------------|---------|
| Worker 1 | src/components/ | feature/worker-1 |
| Worker 2 | src/hooks/ | feature/worker-2 |
| Worker 3 | src/stores/ | feature/worker-3 |
| Worker 4 | tests/ | feature/worker-4 |

### 役割指示の例

```
あなたは src/components/ を担当するワーカーです。

担当:
- src/components/ 配下のファイルのみ

ルール:
- src/hooks/ と src/stores/ は触らない
- 完了したらコミットして報告
```

---

## 🔄 統合フロー

### 1. 各Claudeが担当部分を実装

```
Worker 1 → src/components/ を実装 → commit
Worker 2 → src/hooks/ を実装 → commit  
Worker 3 → src/stores/ を実装 → commit
```

### 2. Antigravityでマージ

```bash
# main ブランチで
git merge feature/worker-3  # 先に型定義/stores
git merge feature/worker-2  # 次にhooks
git merge feature/worker-1  # 最後にcomponents
```

### 3. 競合解決（必要な場合）

```bash
# 競合ファイルを確認
git status

# 手動で解決後
git add .
git commit -m "Resolve merge conflicts"
```

---

## 🧹 クリーンアップ

```bash
./scripts/multi-claude-setup.sh --cleanup my-project
```

これで:
- 全worktreeを削除
- ワーカーブランチを削除
- tmuxセッションを終了

---

## 📊 メリット・デメリット

| 項目 | 内容 |
|------|------|
| **メリット** | ファイル競合を防げる、並列作業で高速化 |
| **デメリット** | 初期設定が必要、マージ作業が発生 |
| **推奨ワーカー数** | 3〜5 並列が管理しやすい |
| **向いているケース** | 大規模プロジェクト、明確に分担できる構造 |

---

## 🔗 関連ドキュメント

- [GitHub Actions連携](GITHUB_ACTIONS_SETUP.md) - スマホからの非同期開発
- [開発ワークフロー](DEVELOPMENT_WORKFLOW.md) - SDD + 2AI分業の全体像
