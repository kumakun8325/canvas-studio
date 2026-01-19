# Branch Protection ルール設定ガイド
#
# GitHub UIでの設定が必要です。
# このファイルは設定手順のドキュメントです。

## 設定手順

1. **リポジトリ Settings → Branches → Add branch protection rule**

2. **Branch name pattern**: `main`

3. **以下をチェック**:

   - [x] **Require a pull request before merging**
     - [x] Require approvals (1以上を推奨)
     - [x] Dismiss stale pull request approvals when new commits are pushed
   
   - [x] **Require status checks to pass before merging**
     - [x] Require branches to be up to date before merging
     - Status checks to require:
       - `Analyze (javascript-typescript)` (CodeQL)
       - `test` (テストがある場合)
       - `build` (ビルドがある場合)
   
   - [x] **Require conversation resolution before merging**
   
   - [x] **Do not allow bypassing the above settings**

4. **Create**をクリック

---

## GitHub CLI での設定（オプション）

```bash
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Analyze (javascript-typescript)"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}'
```

---

## 推奨ルール

| 設定 | 推奨値 | 理由 |
|------|--------|------|
| Require approvals | 1 | 最低1人のレビュー |
| Require status checks | ON | CI通過必須 |
| Require up to date | ON | マージ前に最新化 |
| Include administrators | ON | 例外なし |
