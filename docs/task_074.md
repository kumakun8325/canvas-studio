# Task 074: ダークモード対応

## 概要

Canvas Studio にダークモードを追加する。ユーザーがライト/ダークテーマを手動で切り替えられるようにし、OS のシステム設定に追従するオプションも提供する。Tailwind CSS v4 の dark variant + class 戦略を採用する。

## 要件

- [ ] ライト/ダーク/システム追従の3モード切り替え
- [ ] テーマ設定の localStorage 永続化
- [ ] 全コンポーネントのダークモード対応
- [ ] キャンバス領域はデザイン視認性のためライト維持
- [ ] スムーズなテーマ切り替えトランジション
- [ ] WCAG AA 以上のコントラスト比確保

## 設計

### アーキテクチャ

```
┌─────────────────────────────────────────┐
│  ThemeToggle (UI)                       │
│    └── useTheme hook                    │
│          └── themeStore (Zustand)       │
│                └── localStorage         │
│                └── <html class="dark">  │
└─────────────────────────────────────────┘
```

レイヤー構成（architecture.md 準拠）:
- **Components**: `ThemeToggle.tsx` - テーマ切り替えボタン
- **Hooks**: `useTheme.ts` - テーマ管理ロジック
- **Stores**: `themeStore.ts` - テーマ状態管理
- **Types**: `Theme` 型定義を `types/index.ts` に追加

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `index.html` | FOUC 対策のテーマ事前適用スクリプト |
| `src/index.css` | Tailwind v4 dark variant 設定、color-scheme、トランジション |
| `src/stores/themeStore.ts` | **新規** テーマストア（型安全な localStorage 処理） |
| `src/hooks/useTheme.ts` | **新規** テーマ管理 hook（App で1回のみ実行） |
| `src/components/ui/ThemeToggle.tsx` | **新規** テーマ切り替えボタン |
| `src/App.tsx` | useTheme 初期化（副作用のみ） |
| `src/test/setup.ts` | matchMedia/localStorage のモック追加 |
| `src/pages/Home.tsx` | dark: variant 追加 |
| `src/pages/Editor.tsx` | dark: variant 追加 |
| `src/components/canvas/Toolbar.tsx` | dark: variant 追加 |
| `src/components/canvas/CanvasView.tsx` | dark: variant 追加（キャンバス背景は除外） |
| `src/components/canvas/PropertyPanel.tsx` | dark: variant 追加 |
| `src/components/slides/SlideList.tsx` | dark: variant 追加 |
| `src/components/slides/SlideThumb.tsx` | dark: variant 追加 |
| `src/components/export/ExportDialog.tsx` | dark: variant 追加 |
| `src/components/export/PrintSettingsPanel.tsx` | dark: variant 追加 |
| `src/components/export/CMYKPreview.tsx` | dark: variant 追加 |
| `src/components/templates/TemplateSelector.tsx` | dark: variant 追加 |
| `src/components/ui/UndoRedoButtons.tsx` | dark: variant 追加 |
| `src/components/ErrorBoundary.tsx` | インラインスタイル→Tailwind 変換 + dark: variant |

### 型定義

```typescript
// ThemeMode は themeStore.ts で定義（型と実装の近接配置）
// src/types/index.ts への追加は不要
```

### ストア設計

```typescript
// src/stores/themeStore.ts
import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'

// localStorage から安全に初期値を取得
function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system'

  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

interface ThemeStore {
  mode: ThemeMode
  resolved: 'light' | 'dark'

  setMode: (mode: ThemeMode) => void
  setResolved: (resolved: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: getInitialMode(),
  resolved: 'light',

  setMode: (mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', mode)
    }
    set({ mode })
  },

  setResolved: (resolved) => set({ resolved }),
}))
```

### Hook 設計

```typescript
// src/hooks/useTheme.ts
import { useEffect } from 'react'
import { useThemeStore } from '../stores/themeStore'

/**
 * テーマ管理 Hook
 *
 * 注意: この Hook は App.tsx で1回だけ実行すること。
 * ThemeToggle などの子コンポーネントでは useThemeStore を直接使用する。
 */
export function useTheme() {
  const mode = useThemeStore((state) => state.mode)
  const setResolved = useThemeStore((state) => state.setResolved)

  useEffect(() => {
    const root = document.documentElement

    function applyTheme(dark: boolean) {
      if (dark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      setResolved(dark ? 'dark' : 'light')
    }

    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mq.matches)
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }

    applyTheme(mode === 'dark')
  }, [mode, setResolved])

  return null // 副作用のみで返り値不要
}
```

### コンポーネント設計: ThemeToggle

```typescript
// src/components/ui/ThemeToggle.tsx
import { useThemeStore, type ThemeMode } from '../../stores/themeStore'

interface Props {
  className?: string
}

export function ThemeToggle({ className }: Props) {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)

  const modes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'ライト', icon: '☀' },
    { value: 'dark', label: 'ダーク', icon: '🌙' },
    { value: 'system', label: 'システム', icon: '💻' },
  ]

  return (
    <div className={className}>
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => setMode(m.value)}
          aria-label={m.label}
          className={`p-1.5 rounded text-sm
            ${mode === m.value
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
        >
          {m.icon}
        </button>
      ))}
    </div>
  )
}
```

### CSS 設計

```css
/* src/index.css */
@import "tailwindcss";

@variant dark (&:is(.dark *));

/* color-scheme で OS ネイティブ要素も統一 */
:root {
  color-scheme: light;
}

.dark {
  color-scheme: dark;
}

/* トランジション: ルートコンテナのみ適用、canvas は除外 */
@media (prefers-reduced-motion: no-preference) {
  body,
  .theme-transition {
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }
}
```

### FOUC 対策スクリプト

```html
<!-- index.html の <head> 内に配置 -->
<script>
  (function() {
    const theme = localStorage.getItem('theme');
    const isDark = theme === 'dark' ||
      (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

### ダークモード カラーマッピング

| 用途 | ライト | ダーク |
|------|--------|--------|
| 背景 (メイン) | `bg-white` | `dark:bg-gray-900` |
| 背景 (サブ) | `bg-gray-50` / `bg-gray-100` | `dark:bg-gray-800` |
| テキスト (メイン) | `text-gray-800` | `dark:text-gray-100` |
| テキスト (サブ) | `text-gray-600` | `dark:text-gray-400` |
| ボーダー | `border-gray-200` / `border-gray-300` | `dark:border-gray-700` |
| アクセント | `bg-blue-500` | `dark:bg-blue-600` |
| ホバー | `hover:bg-gray-100` | `dark:hover:bg-gray-700` |
| グラデーション | `from-blue-50 to-indigo-100` | `dark:from-gray-900 dark:to-gray-800` |
| モーダルオーバーレイ | `bg-black/50` | `bg-black/60` (共通) |
| 入力フィールド | `bg-white border-gray-300` | `dark:bg-gray-800 dark:border-gray-600` |

### テスト方針

| テスト対象 | テスト内容 |
|-----------|-----------|
| `themeStore` | mode 切り替え、localStorage 永続化 |
| `useTheme` | DOM class 操作、system モード追従 |
| `ThemeToggle` | ボタン表示、クリックで切り替え |
| 各コンポーネント | dark クラス適用時の描画確認（snapshot） |

## 実装手順

### Phase 1: インフラ

1. `src/stores/themeStore.ts` 作成（型安全な localStorage 処理）
2. `src/hooks/useTheme.ts` 作成（副作用専用）
3. `src/index.css` に dark variant 設定、color-scheme、トランジション追加
4. `index.html` に FOUC 対策スクリプト追加
5. `src/test/setup.ts` に matchMedia/localStorage モック追加
6. `src/App.tsx` で `useTheme()` を呼び出して初期化

### Phase 2: UI

7. `src/components/ui/ThemeToggle.tsx` 作成（store から直接読み取り）
8. `Toolbar.tsx` に ThemeToggle を配置
9. `Home.tsx` に ThemeToggle を配置

### Phase 3: コンポーネント更新（dark: variant 追加）

10. `Home.tsx` - ログイン画面、プロジェクト一覧
11. `Editor.tsx` - エディタレイアウト
12. `Toolbar.tsx` - ツールバー
13. `CanvasView.tsx` - キャンバス周辺（キャンバス自体はライト維持）
14. `PropertyPanel.tsx` - プロパティパネル
15. `SlideList.tsx` + `SlideThumb.tsx` - スライドサイドバー
16. `TemplateSelector.tsx` - テンプレート選択モーダル
17. `ExportDialog.tsx` - エクスポートダイアログ
18. `PrintSettingsPanel.tsx` - 印刷設定
19. `CMYKPreview.tsx` - CMYKプレビュー
20. `UndoRedoButtons.tsx` - Undo/Redo ボタン
21. `ErrorBoundary.tsx` - エラー表示（インラインスタイル→Tailwind変換）

### Phase 4: テスト

22. `themeStore.test.ts` - ストアの単体テスト（localStorage バリデーション）
23. `useTheme.test.ts` - Hook のテスト（matchMedia リスナー）
24. `ThemeToggle.test.tsx` - コンポーネントのテスト

## リスク・注意点（Codex 指摘反映済み）

1. **✅ Tailwind v4 dark variant**: `@variant dark (&:is(.dark *));` で class 戦略を明示的に設定
2. **✅ useTheme の副作用**: App.tsx で1回のみ実行し、ThemeToggle は store から直接読み取るよう分離
3. **✅ localStorage 型安全性**: `getInitialMode()` でバリデーション + SSR ガード実装
4. **✅ トランジションパフォーマンス**: ルートコンテナのみ適用、`prefers-reduced-motion` 対応
5. **✅ FOUC 対策**: `index.html` の `<script>` でテーマを先行適用
6. **キャンバス背景**: Fabric.js キャンバスの背景色はダークモードの影響を受けないようにする
7. **CMYK プレビュー**: カラーの正確性が重要。ダークモードでもプレビュー色は変えない
8. **インラインスタイル**: `ErrorBoundary.tsx`, `PrintSettingsPanel.tsx`, `CMYKPreview.tsx`, `TemplateSelector.tsx` は個別対応が必要
9. **テストモック**: `src/test/setup.ts` で matchMedia/localStorage のモックを追加すること
