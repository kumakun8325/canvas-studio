# Task 075: レスポンシブ対応

## 概要

Canvas Studio のエディタ画面をレスポンシブ対応する。デスクトップ優先（Desktop First）で、タブレットサイズまで快適に操作できるようにする。モバイル（スマートフォン）は閲覧のみのレイアウトとし、編集は非対応とする。

## 要件

- [ ] エディタ画面のレスポンシブ対応（タブレット以上で編集可能）
- [ ] サイドパネル（SlideList / PropertyPanel）の折りたたみ機能
- [ ] ツールバーのレスポンシブ対応（狭い画面でのオーバーフロー対策）
- [ ] モバイル画面（< 768px）では「デスクトップで編集してください」のメッセージ表示
- [ ] Home ページは全画面サイズで正常表示
- [ ] editorStore にパネル開閉状態を追加

## 設計

### アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│  Editor.tsx                                          │
│  ├── Toolbar.tsx         (レスポンシブ: アイコン化)  │
│  ├── SlideList.tsx       (折りたたみ可能)            │
│  ├── CanvasView.tsx      (flex-1 で伸縮)            │
│  └── PropertyPanel.tsx   (折りたたみ可能)            │
└─────────────────────────────────────────────────────┘

ブレークポイント:
  < 768px  : モバイル（編集不可メッセージ）
  768-1023 : タブレット（パネル折りたたみ、ツールバー縮小）
  1024+    : デスクトップ（フル表示）
```

レイヤー構成（architecture.md 準拠）:
- **Stores**: `editorStore.ts` にパネル開閉状態を追加
- **Components**: 各コンポーネントに responsive variant を追加
- 新規ファイルは作成しない（既存コンポーネントの改修のみ）

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/hooks/useMediaQuery.ts` | **新規** メディアクエリ監視 hook |
| `src/stores/editorStore.ts` | `isSlideListOpen`, `isPropertyPanelOpen` 追加 |
| `src/pages/Editor.tsx` | EditorContent 分離、JS 条件レンダリングでモバイル判定 |
| `src/components/canvas/Toolbar.tsx` | レスポンシブ: アイコンのみ表示、パネルトグル |
| `src/components/slides/SlideList.tsx` | 幅のレスポンシブ化 |
| `src/components/canvas/PropertyPanel.tsx` | 幅のレスポンシブ化 |
| `src/components/canvas/CanvasView.tsx` | ResizeObserver でコンテナ追従 |

### ストア設計

```typescript
// src/stores/editorStore.ts に追加
interface EditorStore extends EditorState {
  // 既存
  // ...

  // パネル開閉状態
  isSlideListOpen: boolean
  isPropertyPanelOpen: boolean
  toggleSlideList: () => void
  togglePropertyPanel: () => void
}

// 初期値
isSlideListOpen: true,
isPropertyPanelOpen: true,
toggleSlideList: () => set((state) => ({ isSlideListOpen: !state.isSlideListOpen })),
togglePropertyPanel: () => set((state) => ({ isPropertyPanelOpen: !state.isPropertyPanelOpen })),
```

### Hook 設計: useMediaQuery

```typescript
// src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react'

/**
 * メディアクエリの一致を監視する汎用 hook
 * テスト時に matchMedia をスタブ可能
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}
```

### コンポーネント設計

#### Editor.tsx（レスポンシブレイアウト）

```tsx
import { useMediaQuery } from '../hooks/useMediaQuery'

export function Editor() {
  const isSlideListOpen = useEditorStore((s) => s.isSlideListOpen)
  const isPropertyPanelOpen = useEditorStore((s) => s.isPropertyPanelOpen)
  const isMdUp = useMediaQuery('(min-width: 768px)')

  // モバイル: Canvas 初期化を行わない（useCanvas 呼び出しを条件化）
  if (!isMdUp) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 p-8">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">
            デスクトップまたはタブレットで編集してください
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            このアプリはタブレット以上の画面サイズで編集できます
          </p>
        </div>
      </div>
    )
  }

  // タブレット以上: 通常のエディタ表示
  // useCanvas などの hook はここから先で実行される
  return <EditorContent />
}

// EditorContent を分離して hook を条件実行可能にする
function EditorContent() {
  const isSlideListOpen = useEditorStore((s) => s.isSlideListOpen)
  const isPropertyPanelOpen = useEditorStore((s) => s.isPropertyPanelOpen)
  const canvasActions = useCanvas('main-canvas')
  // ... 既存の hook 呼び出し

  return (
    <div className="h-screen flex flex-col">
      <Toolbar ... />
      <div className="flex-1 flex overflow-hidden">
        {isSlideListOpen && <SlideList />}
        <CanvasView ... />
        {isPropertyPanelOpen && <PropertyPanel ... />}
      </div>
    </div>
  )
}
```

#### Toolbar.tsx（レスポンシブ対応）

```tsx
// ツールバーの変更点:
// - プロジェクト名: lg: 以上で表示、md: では非表示
// - ツールアイコン: ラベル非表示（アイコンのみ）
// - パネルトグルボタン追加（右端）

<div className="bg-white border-b px-2 md:px-4 py-2 flex gap-1 md:gap-2 items-center justify-between">
  <div className="flex gap-1 md:gap-2 items-center flex-wrap">
    {/* ホームボタン */}
    <button ... />

    {/* プロジェクト名: lg以上のみ */}
    {project && (
      <span className="hidden lg:inline text-sm font-medium text-gray-700 ml-2">
        {project.title}
      </span>
    )}

    {/* ツール群 */}
    ...
  </div>

  <div className="flex gap-1 items-center">
    {/* 保存ステータス: md以上のみ */}
    <span className="hidden md:inline ...">...</span>

    {/* パネルトグル */}
    <button onClick={toggleSlideList} title="スライドパネル">
      ☰
    </button>
    <button onClick={togglePropertyPanel} title="プロパティパネル">
      ⚙
    </button>
  </div>
</div>
```

#### SlideList.tsx（折りたたみ対応）

```tsx
// 変更点:
// - 幅: w-52 → w-40 lg:w-52（タブレットで狭く）
// - min-w を削除し、柔軟に縮小可能にする

<div className="shrink-0 w-40 lg:w-52 bg-gray-50 border-r p-2 overflow-y-auto">
  ...
</div>
```

#### PropertyPanel.tsx（折りたたみ対応）

```tsx
// 変更点:
// - 幅: w-64 → w-56 lg:w-64（タブレットで狭く）

<div className="w-56 lg:w-64 p-4 border-l bg-white overflow-y-auto">
  ...
</div>
```

### テスト方針

| テスト対象 | テスト内容 |
|-----------|-----------|
| `editorStore` | パネル開閉 toggle の動作確認 |
| `Editor` | md 未満でモバイルメッセージ表示 |
| `Toolbar` | パネルトグルボタンのクリック動作 |

## 実装手順

1. `editorStore.ts` にパネル開閉状態を追加
2. `Editor.tsx` にモバイル判定とパネル条件表示を追加
3. `Toolbar.tsx` にパネルトグルボタン追加 + レスポンシブ調整
4. `SlideList.tsx` の幅をレスポンシブ化
5. `PropertyPanel.tsx` の幅をレスポンシブ化
6. テスト作成

## リスク・注意点（Codex 指摘反映済み）

1. **✅ モバイルでのCanvas初期化**: `useMediaQuery` で JS 条件レンダリングし、モバイルでは `useCanvas` を呼ばない（`EditorContent` を分離）
2. **✅ パネル開閉時のキャンバスリサイズ**: `useCanvas` 内で `ResizeObserver` を使い `setDimensions` + zoom 調整。`requestAnimationFrame` で描画負荷を抑制
3. **✅ CSS のみのレスポンシブはテスト困難**: `useMediaQuery` を導入し、テストで `matchMedia` をスタブ可能に
4. **リサイズと auto-save**: `setDimensions` が auto-save や履歴に不要な差分を発生させないよう注意
5. **ドラッグ操作**: SlideList のドラッグ操作がタブレットのタッチイベントで動作するかは将来課題
6. **ブレークポイント**: Tailwind v4 のデフォルト `md: 768px`, `lg: 1024px` を使用
7. **既存レイアウト維持**: デスクトップ (1024px+) では現在の見た目を維持する
