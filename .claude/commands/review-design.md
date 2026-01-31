# /review-design - GPT-5.2-Codex xhigh による設計レビュー

## Usage

```
/review-design
```

## Description

Opus が作成した設計を GPT-5.2-Codex xhigh でレビューします。
クォータ効率: Copilot Pro の Premium Request を 1 回消費（約5円）

## Instructions

### Step 1: 設計ファイルの確認

以下のファイルを読み込み:
- `.kiro/steering/design.md` - メイン設計書
- `.kiro/steering/requirements.md` - 要件定義（参照用）

### Step 2: Copilot CLI でレビュー実行

ターミナルで以下を実行:

```bash
cd /Users/kumabookpro/Projects/personal/canvas-studio

copilot -p "
以下の設計をレビューしてください。

## レビュー観点
1. **アーキテクチャ整合性**: .claude/rules/architecture.md に準拠しているか
2. **型安全性**: TypeScript strict mode に対応できる設計か
3. **テスト容易性**: 単体テスト・統合テストが書きやすい構造か
4. **パフォーマンス**: Fabric.js との連携でボトルネックになる箇所
5. **セキュリティ**: Firebase との連携でリスクのある設計
6. **拡張性**: 将来の機能追加に対応できる構造か

## 出力形式
- **総評**: 設計の全体評価（1-2文）
- **良い点**: 設計の優れている部分
- **問題点**: 修正が必要な箇所（重要度順）
- **改善提案**: 具体的な修正案
- **リスク**: 実装時に注意すべき点

設計ファイル:
$(cat .kiro/steering/design.md)
" --model gpt-5.2-codex
```

### Step 3: 結果の保存

レビュー結果を保存:

```bash
# 日付付きで保存
copilot -p "..." --model gpt-5.2-codex > docs/reviews/design-review-$(date +%Y%m%d).md
```

### Step 4: Sonnet への引き継ぎ

レビュー結果をもとに、Sonnet で設計を改善:

1. このセッションでレビュー結果を共有
2. `/model sonnet` でモデル切り替え（または別セッション）
3. 指摘事項に基づいて設計を修正

## 対話モードでの実行（推奨）

より詳細なレビューが必要な場合:

```bash
copilot --model gpt-5.2-codex
```

対話モード内で:
```
/review .kiro/steering/design.md を詳細にレビューしてください
```

## Notes

- reasoning effort は CLI のグローバル設定で xhigh に設定済み
- Premium Request: 1回/レビュー（月300回まで）
- 設計の大きな変更時は必ず実行
