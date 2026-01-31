# /refactor-clean - コードクリーンアップ

長時間のコーディングセッション後にコードを整理するコマンド。

## 実行内容

### 1. 未使用コードの検出

- 未使用のインポート
- 未使用の変数・関数
- 未使用の型定義
- デッドコード

### 2. コード品質の改善

- 重複コードの抽出
- 長すぎる関数の分割
- 複雑すぎる条件式の簡略化
- マジックナンバーの定数化

### 3. 整理作業

- インポートの整理（順序、グルーピング）
- 不要なコメントの削除
- console.log/debuggerの削除
- 一貫性のないフォーマットの修正

### 4. TypeScript改善

- 暗黙のanyを明示的な型に
- 冗長な型アノテーションの削除
- より厳密な型への変更

## 実行手順

1. 変更対象のファイル/ディレクトリを確認
2. 各カテゴリの問題を検出
3. 修正提案をリスト化
4. 承認後に一括修正
5. テスト実行で破壊的変更がないことを確認

## 出力フォーマット

```markdown
## Refactor Report

### Files Analyzed
- [ファイル一覧]

### Issues Found

#### Unused Code
- `import { unused } from 'module'` in file.ts:1
- `const deadVar = ...` in file.ts:42

#### Code Smells
- Function `processData` is 150 lines (recommend: <50)
- Duplicated logic in A.ts:10 and B.ts:20

#### Quick Wins
- 5 console.log statements to remove
- 3 files with unsorted imports

### Proposed Changes
1. [変更1]
2. [変更2]

Proceed with refactoring? (y/n)
```

## 注意事項

- 機能的な変更は行わない
- テストが通ることを確認してから実行
- 大規模な変更は段階的に実施
