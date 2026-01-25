# /build-fix - ビルドエラー自動修正

ビルドエラーやTypeScriptエラーを自動で修正するコマンド。

## 実行内容

### 1. エラー収集

```bash
npm run build 2>&1
npm run lint 2>&1
npx tsc --noEmit 2>&1
```

### 2. エラー分類

| カテゴリ | 例 |
|---------|-----|
| TypeScript | 型エラー、未定義変数 |
| Import | モジュール解決失敗 |
| Syntax | 構文エラー |
| Lint | ESLintルール違反 |

### 3. 自動修正

以下のエラーは自動修正可能：

- 未使用インポートの削除
- 型の不一致（明らかな場合）
- ESLint auto-fixable ルール
- 欠落したインポートの追加

### 4. 手動対応が必要

以下は報告のみ：

- ロジックの問題
- 複雑な型エラー
- 破壊的変更が必要な修正

## 実行手順

1. ビルド実行してエラー収集
2. エラーを分類・優先度付け
3. 自動修正可能なものを一括修正
4. 再ビルドで確認
5. 残りのエラーを報告

## 出力フォーマット

```markdown
## Build Fix Report

### Initial Errors
- TypeScript: 12 errors
- ESLint: 5 errors
- Total: 17 errors

### Auto-Fixed ✅
- Removed 3 unused imports
- Fixed 2 type mismatches
- Applied 5 ESLint auto-fixes

### Remaining ⚠️

#### TypeScript Errors (2)
1. `file.ts:42` - Property 'x' does not exist on type 'Y'
   - Suggestion: Add property to interface or check type

2. `file.ts:88` - Cannot assign 'string' to 'number'
   - Suggestion: Check data source or update type

### Build Status
- Before: ❌ Failed
- After: ✅ Success / ⚠️ Partial (2 errors remain)
```

## オプション

- `--lint-only`: Lintエラーのみ修正
- `--type-only`: TypeScriptエラーのみ修正
- `--dry-run`: 変更せずに報告のみ
