# 開発ワークフロー (AI協調モデル)

Antigravity (PM/設計/検証) と Claude Code (実装/GitHub Actions) の分業による開発プロセスです。

---

## 役割分担

### 🧠 Antigravity (あなた)

- **ロール**: プロジェクトマネージャー、アーキテクト、QAエンジニア
- **責任**:
  - 要件定義・設計・タスク分解
  - **実装指示書 (GitHub Issue) の作成**
  - コードレビュー・動作検証 (`npm run dev` / `npm run build`)
  - デプロイ
- **禁止事項**:
  - `src/` 配下のコードを直接編集すること（リファクタリングや微修正を除く）
  - 実装を自ら行うこと（必ずClaudeに委譲する）

### 🤖 Claude Code (GitHub Actions)

- **ロール**: 開発エンジニア
- **責任**:
  - Issueに基づいたコード実装
  - テストコード作成
  - Pull Request作成

---

## 🔄 標準開発サイクル

### 1. 計画・設計 (Design)

**担当**: Antigravity

- ユーザーの要望を分析・調査します。
- 必要な変更を特定し、設計を行います。

### 2. タスク定義 (Issue Creation)

**担当**: Antigravity

実装をClaudeに依頼するためのGitHub Issueを作成します。

#### ケースA: 既定のタスク定義書がある場合 (Task 02-04)

既に詳細なドキュメント (`docs/task_XX.md`) が存在する場合は、それを参照させます。

```bash
gh issue create --title "feat: 機能名 (Task XX)" --body "@claude

**Objective**: docs/task_XX.md に基づいて機能を実装してください。
**Reference**: docs/task_XX.md"
```

#### ケースB: 新規タスクの場合 (Task 05以降)

Antigravityが調査した結果を**Issue本文に直接**記述します。

```bash
gh issue create --title "feat: 新機能名" --body "@claude

**Objective**: 〇〇機能を実装してください。

**Requirements**:
- 要件A
- 要件B

**Technical Specs**:
- ファイルAを変更し、関数Bを追加
- ライブラリCを使用
- データ構造は以下..."
```

### 3. 実装 (Implementation)

**担当**: Claude Code (Automation)

- Issue作成をトリガーにGitHub Actionsが起動します。
- 自動的にブランチ作成、実装、テスト、PR作成が行われます。
- Antigravityはこの間、他の設計や調査を行うか、完了を待ちます。

### 4. 検証 (Verification)

**担当**: Antigravity

作成されたPRを確認します。

1. **コードレビュー**: PRのFiles changedを確認。
2. **動作確認**:
   ```bash
   gh pr checkout <PR番号>
   npm install
   npm run dev
   # ブラウザで動作確認
   ```
3. **マージ**: 問題なければマージします。
   ```bash
   gh pr merge --merge --delete-branch
   ```
4. **フィードバック (NGの場合)**:
   PRにコメントで修正指示を出すか、新たなIssueを作成して修正させます。

---

## ドキュメント管理

- **.kiro/steering/**: 上流設計ドキュメント (要件定義、全体設計)
- **docs/**: プロジェクト固有ドキュメント
  - `task_XX.md`: 既存のタスク定義書
- **GitHub Issues**: タスクの実体。Task 05以降の詳細仕様はここに蓄積される。

---

## コマンドリファレンス

### Issue作成 (実装開始)

```bash
gh issue create --title "タイトル" --body "@claude 本文"
```

### PRチェックアウト

```bash
gh pr checkout <PR番号>
```

### ビルド・テスト

```bash
npm run typecheck
npm run test:run
npm run build
```
