---
description: Complete implementation and hand off for verification
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
model: inherit
---

# /finish - Complete Implementation

実装を完了し、Antigravityに検証を引き継ぐ。

## 自動品質チェック

> **重要**: 以下のスキルを順番に自動実行する。問題があれば修正してから次へ進む。

### Step 1: コードレビュー（自動）

変更されたファイルに対して `code-review` スキルを実行：

```
変更されたファイルをレビューしてください
```

チェック項目：
- [ ] 品質問題なし
- [ ] パフォーマンス問題なし
- [ ] セキュリティ問題なし

**緊急の問題があれば修正してから次へ。**

### Step 2: ドキュメント確認（自動）

新規/変更した関数・クラスに `docstring` スキルを実行：

```
新しく追加した関数にドキュメントを追加してください
```

チェック項目：
- [ ] 公開関数にJSDoc/docstringあり
- [ ] パラメータと戻り値の説明あり

### Step 3: テスト確認（自動）

テストがない場合、`testing` スキルを実行：

```
新しい機能のテストを生成してください
```

その後テストを実行：
```bash
npm run test
```

チェック項目：
- [ ] テストが存在する
- [ ] テストがパスする

### Step 4: リファクタリング確認（自動）

長すぎる関数や重複コードがあれば `refactoring` スキルを実行：

```
このファイルをリファクタリングしてください
```

チェック項目：
- [ ] 関数は50行以下
- [ ] 重複コードなし

---

## 手動チェック

### 5. ビルド確認
```bash
npm run lint
npm run build
```

### 6. タスクドキュメント更新
`docs/task_XX.md` を編集：
- 完了したステップに `[x]` をつける

### 7. ドキュメント更新（必要に応じて）
- `docs/requirements.md` - 新しい要件IDを追加
- `docs/design.md` - アーキテクチャ/型を更新

### 8. handoff.md 更新

```markdown
## Current Task
**Status**: `READY_FOR_VERIFY`
**Assigned To**: Antigravity

## Handoff: Claude → Antigravity
### Completed Work
- [実装した内容]

### Changed Files
- path/to/file1.ts
- path/to/file2.ts

### Test Instructions
1. `npm run dev` を実行
2. http://localhost:5173/ を開く
3. [テスト手順]

### Known Issues
- [制限事項や既知の問題]
```

### 9. SESSION_LOG.md 更新

```markdown
## YYYY-MM-DD

### Completed
- Task #XX: [説明]

### Changed Files
- file1.ts
- file2.ts
```

### 10. 動作確認
```bash
npm run dev
```

### 11. コミット＆プッシュ
```bash
git add .
git commit -m "feat: Implement #XX - description"
git push -u origin HEAD
```

### 12. PR作成
```bash
gh pr create --title "feat: description" --body "Closes #XX"
```

---

## チェックリスト（最終確認）

### 自動スキル
- [ ] code-review 実行済み
- [ ] docstring 確認済み
- [ ] testing 確認済み
- [ ] refactoring 確認済み

### ビルド＆テスト
- [ ] lint パス
- [ ] build パス
- [ ] test パス

### ドキュメント
- [ ] タスクドキュメント更新
- [ ] handoff.md 更新
- [ ] SESSION_LOG.md 更新

### 完了
- [ ] 動作確認OK
- [ ] コミット済み
- [ ] PR作成済み
