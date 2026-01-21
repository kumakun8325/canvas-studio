---
description: AntigravityがPMとしてClaudeを管理し、自動的に開発を進めるワークフロー
---

# Autopilot Workflow (PM Mode)

Userから指示を受けたら、以下のフローに従って自律的に作業を進めること。

## 1. Issueの特定・作成

既存のIssueがある場合はそれを使用し、ない場合は作成する。

```bash
gh issue create --title "Feature: [機能名]" --body "[詳細説明]"
```

## 2. Claudeへの指示出し

具体的な指示をIssueにコメントする。QAプロトコルは自動的に付与されるため、タスク内容に集中する。

```bash
gh issue comment [ISSUE_NUMBER] --body "@claude
## タスク
[タスク内容]

## 要件
- [要件1]
- [要件2]
"
```

## 3. 監視ループ (Polling)

**ユーザーに確認せず、以下のコマンドで完了を待機する。**

```bash
# 最新のRun IDを取得
gh run list --workflow claude-responder.yml --limit 1 --json databaseId
# 待機
gh run watch [RUN_ID] --exit-status
```

## 4. 結果判定とアクション

### 成功 (Exit Code 0) の場合

PRの内容を確認し、ローカルで検証する。

```bash
gh pr list --state open --json number,headRefName
git fetch origin [BRANCH_NAME]
git checkout [BRANCH_NAME]
npm run build
npm run test
```

**UI確認が必要な場合のみ**、ここで `notify_user` を使用してユーザーに依頼する。
不要な場合はそのままマージする。

```bash
gh pr merge [PR_NUMBER] --merge --delete-branch
```

### 失敗 (Exit Code != 0) の場合

ログを確認し、Claudeに修正指示を出す。

```bash
# ログ確認
gh run view [RUN_ID] --log-failed

# 修正指示
gh issue comment [ISSUE_NUMBER] --body "@claude
ビルド/テストが失敗しました。以下のエラーを修正してください：

\`\`\`
[エラーログ抜粋]
\`\`\`
"
```

その後、**手順3 (監視ループ)** に戻る。

## 5. 完了報告

全て完了したら、`task.md` を更新し、ユーザーに報告する。
