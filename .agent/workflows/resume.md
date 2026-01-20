# プロジェクト再開用情報（Canvas Studio - TDD Integration）

## ステータス

- **完了**: TDDワークフローの統合と検証が完了。
- **カレントブランチ**: `main`

## 現在の構成

- **TDDサイクル**: GitHub Issue (Template) → Actions → Claude (TDD) → Issues/PR
- **自動化範囲**: テスト作成、実装、リファクタリング、PR作成、カバレッジチェック
- **開発環境**: VS Code (Prettier, YAML Support)

## 次回のアクション

- 新機能の実装を開始する際は、Issueテンプレート "🧪 Claude TDD Implementation" を使用する。
- 既存機能の改修やバグ修正には "🤖 Claude Auto Implementation" を使用する（テスト必須ではない場合）。

## 主要ファイル

- `.github/workflows/claude-responder.yml`: 自動化の中枢
- `.claude/agents/tdd-guide.md`: TDDエージェント定義
