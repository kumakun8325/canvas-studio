---
description: 新機能開発のワークフロー（ブランチ作成から完了まで）
---

# 機能開発ワークフロー

> ⚠️ **重要**: 機能開発を開始する前に、必ずフィーチャーブランチを作成すること。

---

## 1. 開発開始

```bash
# 1-1. mainブランチを最新に更新
git checkout main
git pull origin main

# 1-2. フィーチャーブランチを作成
git checkout -b feature/<機能名>
```

### ブランチ命名規則

| プレフィックス | 用途 | 例 |
|--------------|------|-----|
| `feature/` | 新機能開発 | `feature/user-auth` |
| `bugfix/` | バグ修正 | `bugfix/login-error` |
| `refactor/` | リファクタリング | `refactor/api-layer` |
| `docs/` | ドキュメント更新 | `docs/api-reference` |
| `hotfix/` | 緊急修正 | `hotfix/security-patch` |

---

## 2. 開発〜コミット

```bash
# 2-1. 開発作業を行う

# 2-2. 変更を確認
// turbo
git status
git diff

# 2-3. コミット
git add -A
git commit -m "<type>: <説明>"
```

### コミットメッセージ規則

| Type | 説明 | 例 |
|------|------|-----|
| `feat` | 新機能 | `feat: ユーザー認証を追加` |
| `fix` | バグ修正 | `fix: ログインエラーを修正` |
| `refactor` | リファクタリング | `refactor: API層を整理` |
| `docs` | ドキュメント | `docs: READMEを更新` |
| `chore` | 設定・ビルド関連 | `chore: ESLint設定を追加` |
| `style` | コードスタイル | `style: フォーマット修正` |
| `test` | テスト | `test: ユニットテスト追加` |
| `perf` | パフォーマンス | `perf: 画像読み込み最適化` |

### タスクIDの付与（推奨）

```
feat: ユーザー認証を追加 (TASK-001)
fix: ログインエラーを修正 (TASK-002)
```

---

## 3. プッシュ

```bash
# 3-1. リモートにプッシュ
git push origin feature/<機能名>
```

---

## 4. コードレビュー（チーム開発の場合）

### GitHub Pull Request

1. GitHubでPull Requestを作成
2. レビュアーを割り当て
3. 承認後、マージ

### セルフレビュー（個人開発の場合）

```bash
# 変更内容を確認
git log --oneline main..HEAD
git diff main...HEAD
```

---

## 5. マージ（機能完了時）

```bash
# 5-1. mainブランチに切り替え
git checkout main
git pull origin main

# 5-2. フィーチャーブランチをマージ
git merge feature/<機能名>

# 5-3. mainをプッシュ
git push origin main

# 5-4. タスク管理ファイルを更新
# .kiro/steering/tasks.md で該当タスクを完了にマーク
```

---

## 6. ブランチ削除（オプション）

```bash
# 6-1. ローカルブランチを削除
git branch -d feature/<機能名>

# 6-2. リモートブランチを削除
git push origin --delete feature/<機能名>
```

---

## トラブルシューティング

### コンフリクトが発生した場合

```bash
# 1. mainの変更を取り込む
git checkout main
git pull origin main
git checkout feature/<機能名>
git merge main

# 2. コンフリクトを解決
# エディタでコンフリクト箇所を修正

# 3. コミット
git add -A
git commit -m "merge: mainブランチをマージ"
```

### 間違えてmainにコミットした場合

```bash
# 1. コミットをフィーチャーブランチに移動
git branch feature/<機能名>

# 2. mainを元に戻す
git reset --hard origin/main

# 3. フィーチャーブランチに切り替え
git checkout feature/<機能名>
```

---

## 注意事項

- **mainブランチに直接コミットしない**
- 開発前に `.kiro/steering/design.md` のブランチ対応表を確認
- 機能完了時はタスク管理ファイル (`.kiro/steering/tasks.md`) も更新
- 大きな機能は複数の小さなコミットに分割
