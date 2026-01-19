# SDD Templates

> **Specification-Driven Development (SDD) テンプレート集**

AI支援開発のためのドキュメント駆動開発テンプレートです。

## 📁 構造

```
sdd-templates/
├── .kiro/steering/          # コアドキュメント（SDD）
│   ├── requirements.md      # 要件定義書
│   ├── design.md            # 設計ドキュメント
│   └── tasks.md             # タスク管理
├── .agent/workflows/        # Antigravityワークフロー
│   ├── deploy.md            # デプロイ手順
│   ├── feature-development.md  # 機能開発フロー
│   ├── plan.md              # タスク計画・Issue作成
│   ├── verify.md            # 検証・デプロイ
│   └── sdd.md               # SDD統合ワークフロー
├── .claude/commands/        # Claude Codeコマンド
│   ├── start.md             # 実装開始
│   ├── finish.md            # 実装完了・PR作成
│   └── review.md            # コードレビュー
├── docs/                    # 追加ドキュメント
│   ├── SPECIFICATION.md     # 詳細仕様書
│   ├── DEVELOPMENT_WORKFLOW.md # 開発ワークフロー
│   ├── MULTI_CLAUDE_GUIDE.md # 並列Claude開発ガイド
│   ├── GITHUB_ACTIONS_SETUP.md # GitHub Actions連携
│   ├── handoff.md           # AI間引き継ぎ
│   └── SESSION_LOG.md       # セッション履歴
├── .github/workflows/       # GitHub Actions
│   └── claude-responder.yml # @claudeトリガー
├── scripts/                 # ユーティリティ
│   └── multi-claude-setup.sh # 並列Claude起動
├── examples/                # 使用例
│   └── GAME_PROJECT_KICKSTART.md
├── CHANGELOG.md             # 変更履歴
├── CLAUDE.md                # Claude Code設定
├── PROJECT_README.md        # プロジェクトREADMEテンプレート
└── README.md                # このファイル
```

## 🚀 使い方

### 方法1: GitHub Template（推奨・最もシンプル）

1. このページ上部の **"Use this template"** → **"Create a new repository"** をクリック
2. リポジトリ名を入力 → **Create repository**
3. `git clone` でローカルにダウンロード

```bash
git clone https://github.com/YOUR_USERNAME/my-new-project.git
cd my-new-project
```

### 方法2: degit を使う場合

```bash
npx degit kumakun8325/sdd-templates my-new-project
cd my-new-project
git init
```

> 📖 **開発ワークフローの詳細**: [docs/DEVELOPMENT_WORKFLOW.md](docs/DEVELOPMENT_WORKFLOW.md)

### 手動でコピーする場合

```bash
# リポジトリをクローン
git clone https://github.com/kumakun8325/sdd-templates.git

# 必要なファイルをプロジェクトにコピー
cp -r sdd-templates/.kiro your-project/
cp -r sdd-templates/.agent your-project/
cp -r sdd-templates/.claude your-project/
cp -r sdd-templates/docs your-project/
cp sdd-templates/CLAUDE.md your-project/
```

## 🔄 プレースホルダー置換

各ファイル内の以下を実際の値に置き換えてください：

| プレースホルダー | 説明 | 例 |
|------------------|------|-----|
| `{{PROJECT_NAME}}` | プロジェクト名 | タスク管理アプリ |
| `{{PROJECT_NAME_EN}}` | プロジェクト名（英語） | task-manager |
| `{{DESCRIPTION}}` | 簡単な説明 | シンプルなタスク管理アプリ |
| `{{TARGET_USER}}` | ターゲットユーザー | 個人の生産性向上を目指す社会人 |
| `{{TECH_STACK}}` | 技術スタック | TypeScript, React, Firebase |
| `{{DATE}}` | 作成日 | 2025-12-13 |

## 📝 ドキュメント説明

### コアドキュメント（.kiro/steering/）

| ファイル | 目的 |
|----------|------|
| `requirements.md` | ユーザーストーリー、機能要件、非機能要件 |
| `design.md` | アーキテクチャ、モジュール設計、UI設計 |
| `tasks.md` | スプリント管理、TODOリスト |

### Antigravityワークフロー（.agent/workflows/）

| コマンド | 目的 |
|----------|------|
| `/plan` | タスク計画・GitHub Issue作成 |
| `/verify` | 実装検証・デプロイ |
| `/sdd` | SDD統合ワークフロー（req, design, tasks, impl） |
| `/deploy` | 本番/プレビューデプロイ手順 |
| `/feature-development` | ブランチ作成→開発→マージのフロー |

### Claude Codeコマンド（.claude/commands/）

| コマンド | 目的 |
|----------|------|
| `/start` | handoff.mdを読み、実装開始 |
| `/finish` | 実装完了、テスト、PR作成 |
| `/review` | コードレビュー |

### 2AI分業ドキュメント（docs/）

| ファイル | 目的 |
|----------|------|
| `handoff.md` | Antigravity ↔ Claude Code 間の引き継ぎ |
| `SESSION_LOG.md` | セッション履歴 |

## ⚠️ 重要な規則

### ブランチ戦略

> **機能開発を開始する前に、必ずフィーチャーブランチを作成すること**

```bash
git checkout -b feature/<機能名>
```

### コミットメッセージ

```
<type>: <説明>

例:
feat: ユーザー認証機能を追加
fix: ログイン画面のバグを修正
docs: READMEを更新
```

## 🔗 関連プロジェクト

- [BBQ (Bird Battle Quest)](https://github.com/kumakun8325/bbq) - このテンプレートを使用
- [dotart-coloring-game](https://github.com/kumakun8325/dotart-coloring-game)

## 📄 ライセンス

MIT License
