---
name: debug
description: "バグの原因を特定し修正を提案。エラーメッセージ、スタックトレース、再現手順から問題を分析。"
---

# デバッグ スキル

## 使い方

```
このエラーを調べてください:
TypeError: Cannot read property 'map' of undefined
  at Dashboard.tsx:45
```

または

```
この問題をデバッグしてください:
ボタンをクリックしても何も起きない
```

## デバッグプロセス

### 1. 情報収集

```
📋 チェックリスト:
- エラーメッセージ
- スタックトレース
- 再現手順
- 期待される動作
- 実際の動作
- 関連するコード変更
```

### 2. 仮説立案

```
🔍 可能性のある原因:
1. [最も可能性が高い原因]
2. [次に考えられる原因]
3. [その他の可能性]
```

### 3. 検証と修正

```
✅ 原因特定:
[原因の説明]

🔧 修正案:
[具体的な修正コード]
```

## よくあるエラーパターン

### TypeScript / JavaScript

| エラー | 原因 | 解決策 |
|--------|------|--------|
| `Cannot read property 'x' of undefined` | null/undefinedアクセス | オプショナルチェイニング `?.` |
| `x is not a function` | 型の不一致 | typeof チェック |
| `Maximum call stack exceeded` | 無限再帰 | 終了条件を確認 |
| `Cannot find module` | パス/インポート誤り | パスを確認 |

### React

| 現象 | 原因 | 解決策 |
|------|------|--------|
| 無限ループ | useEffectの依存配列 | 依存配列を修正 |
| 状態が更新されない | 直接変更 | 新しいオブジェクトを作成 |
| イベントが発火しない | バインド忘れ | アロー関数を使用 |
| 子コンポーネントが更新されない | key不足 | 一意のkeyを設定 |

### 非同期処理

| 現象 | 原因 | 解決策 |
|------|------|--------|
| データがundefined | await忘れ | async/awaitを確認 |
| 競合状態 | 複数のリクエスト | AbortController使用 |
| メモリリーク | クリーンアップ忘れ | useEffectのreturn |

## デバッグツール

### ブラウザ

```javascript
// コンソールログ
console.log('value:', value)
console.table(array)
console.trace('call stack')

// ブレークポイント
debugger

// パフォーマンス測定
console.time('label')
// ... code
console.timeEnd('label')
```

### React DevTools

```javascript
// コンポーネントの再レンダリング確認
import { useEffect } from 'react'

useEffect(() => {
  console.log('Component rendered')
})

// 依存配列の変化確認
useEffect(() => {
  console.log('deps changed:', dep1, dep2)
}, [dep1, dep2])
```

### Node.js

```javascript
// 詳細なエラースタック
Error.stackTraceLimit = 50

// 環境変数でデバッグモード
DEBUG=app:* node server.js
```

## 出力フォーマット

```
# デバッグレポート

## エラー内容
[エラーメッセージ]

## 原因分析

### 調査
1. [調査した内容]
2. [確認した箇所]

### 原因
[特定した原因]

## 修正案

### ファイル: `path/to/file.ts` 行 XX

**Before:**
```typescript
// 問題のあるコード
```

**After:**
```typescript
// 修正後のコード
```

### 理由
[修正理由の説明]

---

修正を適用しますか？
```

## 予防策

- [ ] 型を厳密に定義する
- [ ] nullチェックを徹底する
- [ ] エラーハンドリングを実装する
- [ ] テストを書く
- [ ] コードレビューを受ける
