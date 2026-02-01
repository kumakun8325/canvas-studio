# Task 74: ダークモード対応

## 概要

Canvas Studio に ダークモード（Dark Mode）を実装する。ユーザーがライト/ダークを手動切り替えでき、OS設定にも自動追従する。非機能要件 NF-002 に対応。

## 要件

- [ ] ライトモード/ダークモードの切り替えトグルをUIに配置
- [ ] OS の `prefers-color-scheme` に自動追従（初回アクセス時）
- [ ] ユーザーの選択を `localStorage` で永続化
- [ ] 全コンポーネント・ページでダークモード表示が正常動作
- [ ] キャンバス描画領域自体はテーマに影響されない（背景は灰色のまま）
- [ ] コントラスト比 WCAG AA 準拠（4.5:1 以上）

## 設計

### アーキテクチャ

**アプローチ: Tailwind CSS v4 `dark:` バリアント + CSS カスタムプロパティ**

Tailwind CSS v4 では `darkMode` はデフォルトで `@media (prefers-color-scheme: dark)` 。ただし手動切り替えも必要なため、`dark` セレクタのカスタム variant を `index.css` で設定する。

```
┌───────────────────────────────────────────────────────┐
│  App.tsx                                               │
│  ┌─ useTheme hook ─────────────────────────────────┐  │
│  │  - isDark state                                  │  │
│  │  - toggle() / setTheme()                        │  │
│  │  - localStorage 永続化                           │  │
│  │  - prefers-color-scheme 監視                     │  │
│  │  - <html> に dark クラス付与                     │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  全コンポーネント: dark: プレフィックス付きクラス       │
└───────────────────────────────────────────────────────┘
```

**レイヤー構成:**
- `useTheme` hook → テーマ状態の管理（Hooks レイヤー）
- `editorStore` → `isDarkMode` state を追加（Stores レイヤー）
- 各コンポーネント → `dark:` Tailwind クラスを追加（Components レイヤー）

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/index.css` | `@custom-variant dark` 設定追加 |
| `src/types/index.ts` | `ThemeMode` 型追加 |
| `src/hooks/useTheme.ts` | **新規**: テーマ切り替えhook |
| `src/stores/editorStore.ts` | `isDarkMode`, `setDarkMode` 追加 |
| `src/App.tsx` | `useTheme` フック統合 |
| `src/pages/Home.tsx` | `dark:` クラス追加 |
| `src/pages/Editor.tsx` | `dark:` クラス追加 |
| `src/pages/EditorContent.tsx` | `dark:` クラス追加（必要な場合） |
| `src/components/canvas/Toolbar.tsx` | `dark:` クラス追加、テーマトグルボタン配置 |
| `src/components/canvas/CanvasView.tsx` | `dark:` クラス追加 |
| `src/components/canvas/PropertyPanel.tsx` | `dark:` クラス追加 |
| `src/components/slides/SlideList.tsx` | `dark:` クラス追加 |
| `src/components/slides/SlideThumb.tsx` | `dark:` クラス追加 |
| `src/components/ui/Toast.tsx` | `dark:` クラス追加 |
| `src/components/ui/ConfirmDialog.tsx` | `dark:` クラス追加 |
| `src/components/ui/Spinner.tsx` | `dark:` クラス追加 |
| `src/components/ui/UndoRedoButtons.tsx` | `dark:` クラス追加（必要な場合） |
| `src/components/ErrorBoundary.tsx` | `dark:` クラス追加 |
| `src/components/templates/TemplateSelector.tsx` | `dark:` クラス追加 |
| `src/components/export/ExportDialog.tsx` | `dark:` クラス追加 |
| `src/components/export/CMYKPreview.tsx` | `dark:` クラス追加（必要な場合） |
| `src/components/export/PrintSettingsPanel.tsx` | `dark:` クラス追加（必要な場合） |

### 型定義

```typescript
// src/types/index.ts に追加
export type ThemeMode = 'light' | 'dark' | 'system'
```

### useTheme Hook 設計

```typescript
// src/hooks/useTheme.ts
interface UseThemeReturn {
  isDark: boolean
  themeMode: ThemeMode      // 'light' | 'dark' | 'system'
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

export function useTheme(): UseThemeReturn {
  // 1. localStorage から保存済みモードを取得（デフォルト: 'system'）
  // 2. 'system' の場合、window.matchMedia('(prefers-color-scheme: dark)') を監視
  // 3. isDark を算出し、document.documentElement に 'dark' クラスを付与/除去
  // 4. editorStore.setDarkMode(isDark) でストアに同期
  // 5. localStorage にモードを永続化
}
```

### ストア設計

```typescript
// src/stores/editorStore.ts に追加
interface EditorStore extends EditorState {
  // 既存 ...
  isDarkMode: boolean
  setDarkMode: (isDark: boolean) => void
}
```

### Tailwind CSS v4 設定

```css
/* src/index.css に追加 */
@import "tailwindcss";

/* ダークモード: class-based strategy */
@custom-variant dark (&:where(.dark, .dark *));
```

Tailwind CSS v4 では `@custom-variant` ディレクティブで `dark:` の挙動を `class` ベースに切り替える。これにより `<html class="dark">` が付与されたとき `dark:bg-gray-900` などが適用される。

### カラーパレット設計

| 用途 | ライトモード | ダークモード |
|------|-------------|-------------|
| ページ背景 | `bg-white` | `dark:bg-gray-950` |
| セカンダリ背景 | `bg-gray-50` | `dark:bg-gray-900` |
| カード/パネル背景 | `bg-white` | `dark:bg-gray-900` |
| 三次背景 | `bg-gray-100` | `dark:bg-gray-800` |
| ホバー背景 | `hover:bg-gray-200` | `dark:hover:bg-gray-700` |
| テキスト（メイン） | `text-gray-800` | `dark:text-gray-100` |
| テキスト（サブ） | `text-gray-600` | `dark:text-gray-300` |
| テキスト（薄い） | `text-gray-500` | `dark:text-gray-400` |
| テキスト（最薄） | `text-gray-400` | `dark:text-gray-500` |
| ボーダー | `border-gray-300` | `dark:border-gray-700` |
| ボーダー（薄い） | `border-gray-200` | `dark:border-gray-700` |
| アクセント青 | `bg-blue-500` | `dark:bg-blue-600` |
| アクセント青（薄い） | `bg-blue-50` | `dark:bg-blue-950` |
| エラー赤 | `bg-red-500` | `dark:bg-red-600` |
| エラー赤（薄い） | `bg-red-50` | `dark:bg-red-950` |
| 成功緑 | `bg-green-500` | `dark:bg-green-600` |
| オーバーレイ | `bg-black/50` | `dark:bg-black/70` |
| グラデーション | `from-blue-50 to-indigo-100` | `dark:from-gray-900 dark:to-gray-800` |
| キャンバス背景 | `bg-gray-100` | `dark:bg-gray-800` |
| 入力フィールド | `border rounded` | `dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100` |
| シャドウ | `shadow-sm` | `dark:shadow-gray-900/50` |

### テーマトグルUI設計

**配置場所**: `Toolbar.tsx` の右端に Sun/Moon アイコンのトグルボタンを配置

```
┌───────────────────────────────────────────────────────┐
│ [□][○][T][📷][↶↷] ... [保存状態] [🌙/☀️] [ホーム] │
└───────────────────────────────────────────────────────┘
```

Home ページ（`Home.tsx`）にも独立したトグルボタンを右上に配置。

### テスト方針

1. **useTheme hook テスト**
   - 初期状態: `system` モードでOS設定に追従
   - `localStorage` からの復元
   - `setThemeMode('dark')` でダーク切り替え
   - `toggleTheme()` でトグル動作
   - OS設定変更時の自動追従（`system` モード時のみ）
   - `<html>` 要素の `dark` クラス付与確認

2. **editorStore テスト**
   - `isDarkMode` 初期値 `false`
   - `setDarkMode(true)` で更新

3. **コンポーネント視覚テスト**
   - ライトモードで正常表示
   - ダークモードで正常表示（`document.documentElement.classList.add('dark')` でシミュレーション）

## 実装手順

1. `src/types/index.ts` に `ThemeMode` 型追加
2. `src/index.css` に `@custom-variant dark` 設定追加
3. `src/stores/editorStore.ts` に `isDarkMode`, `setDarkMode` 追加
4. `src/hooks/useTheme.ts` 新規作成
5. `src/App.tsx` に `useTheme` 統合
6. `src/components/canvas/Toolbar.tsx` にテーマトグルボタン追加 + `dark:` クラス
7. `src/pages/Home.tsx` にテーマトグル + `dark:` クラス
8. 残りの全コンポーネントに `dark:` クラス追加（優先度順）:
   - `src/pages/Editor.tsx`
   - `src/components/canvas/CanvasView.tsx`
   - `src/components/canvas/PropertyPanel.tsx`
   - `src/components/slides/SlideList.tsx`
   - `src/components/slides/SlideThumb.tsx`
   - `src/components/ui/ConfirmDialog.tsx`
   - `src/components/ui/Spinner.tsx`
   - `src/components/ui/Toast.tsx`
   - `src/components/ErrorBoundary.tsx`
   - `src/components/templates/TemplateSelector.tsx`
   - `src/components/export/ExportDialog.tsx`
   - `src/components/export/CMYKPreview.tsx`（必要な場合）
   - `src/components/export/PrintSettingsPanel.tsx`（必要な場合）
9. テスト作成・実行
10. ビルド確認

## リスク・注意点

- **Tailwind CSS v4 の `@custom-variant` 構文**: v4特有の設定方法。v3の `darkMode: 'class'` とは異なる。`@custom-variant dark (&:where(.dark, .dark *));` が正しい構文
- **Fabric.js キャンバス**: canvas 要素自体はTailwind管理外。キャンバスの背景色はFabric.jsの `backgroundColor` プロパティで設定されるため、テーマ変更の影響を受けない（意図通り）
- **サムネイル表示**: `SlideThumb` のサムネイルはcanvasのdataURL。ダークモードでも内容は変わらない（正しい挙動）
- **モーダル/ダイアログ**: オーバーレイの `bg-black/50` はダークモードで `dark:bg-black/70` に変更し、暗い背景でもモーダルが区別可能にする
- **入力フィールド**: `PropertyPanel`, `TemplateSelector` の `<input>` 要素にダーク背景・テキスト色の指定が必要
- **アクセシビリティ**: ダークモードでのコントラスト比を確認。特に `text-gray-400` on `bg-gray-900` は 4.63:1 で AA は通るが、ギリギリのため注意
- **テスト環境**: jsdom では `matchMedia` のモックが必要
- **パフォーマンス**: `dark:` クラスの追加によるCSSバンドルサイズの増加は軽微（Tailwind v4のJIT処理のため）

## Codex レビュー指摘への対応

### 1. [Major] CanvasView背景の競合

**指摘**: CanvasViewに`dark:`背景を付与するとキャンバス背景固定の要件と競合する。

**対応**: CanvasView の外枠（キャンバス周囲の灰色領域）のみダーク対応する。`bg-gray-100` → `bg-gray-100 dark:bg-gray-800` とし、Fabric.js canvas 要素自体には手を加えない。キャンバスの背景色（白紙のスライド背景）はFabric.jsの `backgroundColor` で管理されておりテーマとは独立。

### 2. [Major] FOUC（Flash of Unstyled Content）防止

**指摘**: React初期化後にdarkクラスを付与するとライト→ダークのフラッシュが発生する。

**対応**: `index.html` の `<head>` 内にインラインスクリプトを追加し、React初期化前に `localStorage` から テーマモードを読み取り、`<html>` に `dark` クラスを付与する。

```html
<!-- index.html に追加 -->
<script>
  (function() {
    var mode = localStorage.getItem('canvas-studio-theme');
    var isDark = mode === 'dark' ||
      (mode !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  })();
</script>
```

### 3. [Minor] localStorage型ガード

**指摘**: localStorage値が不正な場合にThemeModeが崩壊する。

**対応**: `useTheme` hook 内に型ガード関数を実装する。

```typescript
function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

function getStoredThemeMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isValidThemeMode(stored) ? stored : 'system'
}
```

### 4. [リスク] editorStore再レンダリング

**対応**: `isDarkMode` を `useEditorStore(state => state.isDarkMode)` のセレクタで取得するコンポーネントを最小化する。テーマトグルボタンのみが直接参照し、他コンポーネントはTailwindの `dark:` クラスが自動的に `<html>` のクラスに反応するためストア購読不要。

### 5. [推奨] useMediaQuery との統一

**対応**: 既存の `useMediaQuery` hookを `useTheme` 内部で再利用する。OS設定の `prefers-color-scheme` 監視に `useMediaQuery('(prefers-color-scheme: dark)')` を活用。
