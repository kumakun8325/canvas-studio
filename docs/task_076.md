# Task 076: ローディング・エラーハンドリング

## 概要

Canvas Studio のローディング表示とエラーハンドリングを統一・改善する。ブラウザネイティブの `alert()` / `confirm()` を廃止し、トースト通知システムと確認ダイアログを実装する。ErrorBoundary を改善し、ユーザーフレンドリーなエラー表示とリカバリ手段を提供する。

## 要件

- [ ] トースト通知システム（成功・エラー・情報）の実装
- [ ] `alert()` / `confirm()` をカスタム UI に置換
- [ ] ErrorBoundary の改善（Tailwind 化、リカバリボタン、スタック非表示）
- [ ] エクスポート操作のエラーをトーストで表示
- [ ] プロジェクト削除の確認ダイアログ化
- [ ] 一貫したローディングスピナーコンポーネント

## 設計

### アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│  Toast System                                        │
│  ├── toastStore (Zustand)    ← 状態管理             │
│  ├── Toast.tsx (UI)          ← 表示コンポーネント   │
│  └── useToast hook           ← 簡易呼び出し         │
├──────────────────────────────────────────────────────┤
│  Confirm Dialog                                      │
│  ├── ConfirmDialog.tsx       ← 汎用確認ダイアログ   │
│  └── state + callback API    ← open/onConfirm       │
├──────────────────────────────────────────────────────┤
│  Loading                                             │
│  └── Spinner.tsx             ← 統一スピナー         │
├──────────────────────────────────────────────────────┤
│  ErrorBoundary               ← 改善版               │
└─────────────────────────────────────────────────────┘
```

レイヤー構成（architecture.md 準拠）:
- **Stores**: `toastStore.ts` - トースト状態管理
- **Hooks**: `useToast.ts` - トースト操作の hook
- **Components**: `Toast.tsx`, `ConfirmDialog.tsx`, `Spinner.tsx`
- 既存 `ErrorBoundary.tsx` の改修

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/stores/toastStore.ts` | **新規** トースト状態管理 |
| `src/hooks/useToast.ts` | **新規** トースト操作 hook |
| `src/components/ui/Toast.tsx` | **新規** トースト通知 UI |
| `src/components/ui/ConfirmDialog.tsx` | **新規** 確認ダイアログ |
| `src/components/ui/Spinner.tsx` | **新規** 統一ローディングスピナー |
| `src/components/ErrorBoundary.tsx` | 改善: Tailwind 化、リカバリ UI |
| `src/App.tsx` | Toast コンテナ配置 |
| `src/pages/Home.tsx` | confirm() → ConfirmDialog、エラー表示改善 |
| `src/components/export/ExportDialog.tsx` | alert() → toast |

### 型定義

```typescript
// toastStore.ts 内で定義
export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
}
```

### ストア設計

```typescript
// src/stores/toastStore.ts
import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastStore {
  toasts: ToastItem[]
  addToast: (type: ToastType, message: string) => void
  removeToast: (id: string) => void
}

let toastId = 0

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  // 純粋な状態更新のみ（タイマーは ToastContainer 側で管理）
  addToast: (type, message) => {
    const id = String(++toastId)
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }))
    return id
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
```

### Hook 設計

```typescript
// src/hooks/useToast.ts
import { useToastStore } from '../stores/toastStore'

const AUTO_DISMISS_MS: Record<ToastType, number> = {
  success: 3000,
  info: 4000,
  error: 6000,
}

export function useToast() {
  const addToast = useToastStore((s) => s.addToast)
  const removeToast = useToastStore((s) => s.removeToast)

  const show = useCallback((type: ToastType, message: string) => {
    const id = addToast(type, message)
    // 自動消去タイマーを hook 側で管理（store は純粋）
    setTimeout(() => removeToast(id), AUTO_DISMISS_MS[type])
  }, [addToast, removeToast])

  return {
    success: (message: string) => show('success', message),
    error: (message: string) => show('error', message),
    info: (message: string) => show('info', message),
  }
}
```

### コンポーネント設計

#### Toast.tsx

```tsx
// src/components/ui/Toast.tsx
import { useToastStore } from '../../stores/toastStore'
import type { ToastType } from '../../stores/toastStore'

const STYLES: Record<ToastType, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium
            animate-slide-in ${STYLES[toast.type]}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

#### ConfirmDialog.tsx

```tsx
// src/components/ui/ConfirmDialog.tsx
import { useState, useCallback } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'default'
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '確認',
  cancelLabel = 'キャンセル',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmDialogProps) {
  if (!open) return null

  const confirmClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
```

#### Spinner.tsx

```tsx
// src/components/ui/Spinner.tsx

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-current
        border-t-transparent ${SIZES[size]} ${className}`}
      role="status"
      aria-label="読み込み中"
    />
  )
}
```

#### ErrorBoundary 改善

```tsx
// src/components/ErrorBoundary.tsx
// インラインスタイル → Tailwind、リカバリボタン追加、スタック非表示

render() {
  if (this.state.hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-8">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠</div>
          <h2 className="text-xl font-semibold text-gray-800">
            予期しないエラーが発生しました
          </h2>
          <p className="mt-2 text-gray-600 text-sm">
            {import.meta.env.DEV
              ? this.state.error?.message
              : 'アプリケーションでエラーが発生しました'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    )
  }
  return this.props.children
}
```

### 既存コード置換

#### ExportDialog.tsx（alert → toast）

```tsx
// Before:
alert('エクスポートに失敗しました')

// After:
const toast = useToast()
toast.error('エクスポートに失敗しました')
```

#### Home.tsx（confirm → ConfirmDialog）

```tsx
// Before:
if (!confirm('このプロジェクトを削除しますか？')) return

// After:
const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

<ConfirmDialog
  open={deleteTarget !== null}
  title="プロジェクトの削除"
  message="このプロジェクトを削除しますか？この操作は取り消せません。"
  confirmLabel="削除する"
  variant="danger"
  onConfirm={() => { handleDeleteConfirmed(deleteTarget!); setDeleteTarget(null) }}
  onCancel={() => setDeleteTarget(null)}
/>
```

#### Home.tsx（削除失敗のフィードバック追加）

```tsx
// Before:
catch (err) {
  if (import.meta.env.DEV) {
    console.error('Failed to delete project:', err)
  }
  // silent failure
}

// After:
catch (err) {
  if (import.meta.env.DEV) {
    console.error('Failed to delete project:', err)
  }
  toast.error('プロジェクトの削除に失敗しました')
}
```

### CSS 追加

```css
/* src/index.css に追加 */
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.2s ease-out;
}
```

### テスト方針

| テスト対象 | テスト内容 |
|-----------|-----------|
| `toastStore` | addToast でトースト追加、removeToast で削除 |
| `useToast` | success/error/info メソッドの動作 |
| `Toast` | トーストの表示と閉じる動作 |
| `ConfirmDialog` | 開閉、確認/キャンセルコールバック |
| `Spinner` | サイズ別レンダリング |
| `ErrorBoundary` | エラー発生時のリカバリ UI 表示 |

## 実装手順

### Phase 1: 基盤コンポーネント

1. `src/stores/toastStore.ts` 作成
2. `src/hooks/useToast.ts` 作成
3. `src/components/ui/Toast.tsx` 作成
4. `src/components/ui/Spinner.tsx` 作成
5. `src/components/ui/ConfirmDialog.tsx` 作成
6. `src/index.css` にアニメーション追加
7. `src/App.tsx` に `ToastContainer` 配置

### Phase 2: 既存コード改修

8. `src/components/ErrorBoundary.tsx` 改善（本番では汎用メッセージ、DEV時のみ詳細）
9. `src/components/export/ExportDialog.tsx` の alert → toast
10. `src/pages/Home.tsx` の confirm → ConfirmDialog
11. `src/pages/Home.tsx` の削除エラー表示追加
12. `src/App.tsx` と `src/pages/Home.tsx` の既存スピナーを `Spinner` コンポーネントに置換

### Phase 3: テスト

12. toastStore.test.ts
13. Toast.test.tsx
14. ConfirmDialog.test.tsx
15. Spinner.test.tsx
16. ErrorBoundary.test.tsx

## リスク・注意点（Codex 指摘反映済み）

1. **✅ ConfirmDialog API**: state + callback パターンに統一（Promise ベース表記を削除）
2. **✅ Toast の自動消去**: store は純粋な状態管理のみ。タイマーは `useToast` hook 側で管理
3. **✅ Spinner 統一**: App/Home の既存スピナーも Spinner コンポーネントに置換
4. **✅ ErrorBoundary**: 本番では汎用メッセージ、DEV 時のみ詳細エラーメッセージ表示
5. **✅ 自動消去タイミング**: type 別に duration を設定（success: 3s, info: 4s, error: 6s）
6. **トーストの z-index**: モーダル（ExportDialog, TemplateSelector）より上に表示する必要がある（z-50）
7. **フォーカス制御**: ConfirmDialog 表示時に背景要素へのフォーカスを防ぐ（将来改善）
8. **ErrorBoundary**: class component のため hook が使えない。Tailwind クラスで直接記述
9. **TASK-074 との連携**: ダークモード対応が先に完了している場合、各コンポーネントに dark: variant も追加する
