---
name: testing
description: "テストコードを生成。Vitest + Testing Library / Jest / Playwright に対応。単体テスト・統合テストをAAAパターンで作成。"
---

# テスト生成 スキル

## 使い方

```
このファイルのテストを書いてください: src/hooks/useAuth.ts
```

または

```
このコンポーネントのテストを生成: src/components/Button.tsx
```

## 対応フレームワーク

| フレームワーク | 用途 | ファイル命名 |
|---------------|------|-------------|
| Vitest + RTL | React コンポーネント | `*.spec.tsx` |
| Vitest | 関数・フック | `*.spec.ts` |
| Jest | Node.js | `*.test.ts` |
| Playwright | E2E | `*.e2e.ts` |

## 核心原則

### 1. AAA パターン（Arrange-Act-Assert）

```typescript
it('should disable button when loading', () => {
  // Arrange: セットアップ
  render(<Button loading />)
  
  // Act: アクション実行
  const button = screen.getByRole('button')
  
  // Assert: 検証
  expect(button).toBeDisabled()
})
```

### 2. ブラックボックステスト

- 実装詳細ではなく、観察可能な動作をテスト
- セマンティッククエリを使用（`getByRole`, `getByLabelText`）
- 内部状態を直接テストしない

```typescript
// ❌ 悪い例: ハードコードされたテキスト
expect(screen.getByText('Loading...')).toBeInTheDocument()

// ✅ 良い例: ロールベース
expect(screen.getByRole('status')).toBeInTheDocument()

// ✅ 良い例: パターンマッチング
expect(screen.getByText(/loading/i)).toBeInTheDocument()
```

### 3. 1テスト1動作

```typescript
// ✅ 良い例: 1つの動作
it('should disable button when loading', () => {
  render(<Button loading />)
  expect(screen.getByRole('button')).toBeDisabled()
})

// ❌ 悪い例: 複数の動作
it('should handle loading state', () => {
  render(<Button loading />)
  expect(screen.getByRole('button')).toBeDisabled()
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  expect(screen.getByRole('button')).toHaveClass('loading')
})
```

### 4. セマンティックな命名

```typescript
it('should show error message when validation fails')
it('should call onSubmit when form is valid')
it('should disable input when isReadOnly is true')
```

## 必須テストシナリオ

### 常に必要

- [ ] 初期レンダリング
- [ ] ユーザーインタラクション（クリック、入力）
- [ ] エッジケース（空、null、undefined）
- [ ] エラー状態

### 条件付き

- [ ] 非同期処理（API呼び出し）
- [ ] ローディング状態
- [ ] フォームバリデーション
- [ ] アクセシビリティ

## テストテンプレート

### React コンポーネント

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  describe('初期レンダリング', () => {
    it('should render correctly', () => {
      render(<ComponentName />)
      expect(screen.getByRole('...')).toBeInTheDocument()
    })
  })

  describe('ユーザーインタラクション', () => {
    it('should call onClick when button is clicked', async () => {
      const onClick = vi.fn()
      render(<ComponentName onClick={onClick} />)
      
      await userEvent.click(screen.getByRole('button'))
      
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('エッジケース', () => {
    it('should handle empty data', () => {
      render(<ComponentName data={[]} />)
      expect(screen.getByText(/no data/i)).toBeInTheDocument()
    })
  })
})
```

### カスタムフック

```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCustomHook } from './useCustomHook'

describe('useCustomHook', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useCustomHook())
    expect(result.current.value).toBe(initialValue)
  })

  it('should update value when action is called', () => {
    const { result } = renderHook(() => useCustomHook())
    
    act(() => {
      result.current.update(newValue)
    })
    
    expect(result.current.value).toBe(newValue)
  })
})
```

## カバレッジ目標

| カテゴリ | 目標 |
|---------|------|
| 行カバレッジ | 80%+ |
| 分岐カバレッジ | 70%+ |
| 関数カバレッジ | 90%+ |
