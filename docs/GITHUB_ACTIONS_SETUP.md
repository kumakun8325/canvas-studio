# GitHub Actions Claude連携 セットアップガイド

IssueやPRコメントに `@claude` と書くだけで、Claude Codeが自動で応答・実装します。

---

## 🚀 クイックスタート

### 1. APIキーを設定

GitHubリポジトリの Settings → Secrets and variables → Actions → New repository secret

| Secret名 | 値 |
|----------|-----|
| `ANTHROPIC_API_KEY` | Anthropic APIキー |

### 2. 使い方

Issueを作成して、本文に `@claude` を含める：

```markdown
@claude 

以下の機能を実装してください：
- ユーザー認証機能
- ログイン/ログアウト
```

これだけで：
1. Claude Codeが自動起動
2. ブランチ作成
3. 実装
4. PR作成

---

## ⚙️ オプション設定

### GLM API (Z.AI) を使用する場合

コスト削減のためGLM-4.7を使用できます。

**Secrets:**
| Secret名 | 値 |
|----------|-----|
| `ZAI_API_KEY` | Z.AI APIキー |

**Variables:**
| Variable名 | 値 |
|------------|-----|
| `ANTHROPIC_BASE_URL` | `https://api.z.ai/api/anthropic` |

**ワークフローの修正:**
```yaml
env:
  ANTHROPIC_API_KEY: ${{ secrets.ZAI_API_KEY }}
  ANTHROPIC_BASE_URL: ${{ vars.ANTHROPIC_BASE_URL }}
```

---

## 📋 使用例

### バグ修正を依頼

```markdown
@claude

ログイン画面でパスワードが表示されてしまうバグを修正してください。
ファイル: src/components/LoginForm.tsx
```

### 機能追加を依頼

```markdown
@claude

以下の機能を追加してください：
- ダークモード切り替えボタン
- LocalStorageで設定を保存
- システム設定に追従するオプション
```

### PRレビューを依頼

PRのコメントで：
```markdown
@claude

このPRをレビューして、改善点があれば指摘してください。
```

---

## 🔧 トラブルシューティング

### Actions が実行されない

1. リポジトリのSettings → Actions → General で「Allow all actions」が選択されているか確認
2. Workflowファイルが `.github/workflows/` にあるか確認
3. APIキーが正しく設定されているか確認

### Claude Code がエラーになる

1. Actions Logを確認
2. APIキーの有効期限を確認
3. 使用量制限に達していないか確認

---

## 🔐 セキュリティ注意事項

- APIキーは必ずSecretsに保存（ハードコードしない）
- パブリックリポジトリでは、フォークからのトリガーに注意
- 必要に応じて `if` 条件でトリガーを制限

---

## 📊 マルチエージェント開発との使い分け

| 状況 | 推奨 |
|------|------|
| 集中開発セッション | マルチエージェント（tmux） |
| スマホから指示 | GitHub Actions |
| 複雑な機能実装 | マルチエージェント |
| 簡単なバグ修正 | GitHub Actions |
| リアルタイム対話 | マルチエージェント |
| 非同期作業 | GitHub Actions |
