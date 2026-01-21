# Phase 10: 仕上げ・デプロイ - 実装タスク

## 概要

Phase 10では、アプリケーションの品質向上とデプロイを行う。
- ダークモード対応
- レスポンシブ対応
- ローディング・エラーハンドリング統一
- ドキュメント整備
- Firebase Hostingへのデプロイ

## 前提条件

- Phase 1-9 完了済み
- Vite 6.1.1 + React 19
- Tailwind CSS v4（@tailwindcss/vite統合）
- Firebase設定済み（lib/firebase.ts）

---

## 現状分析

### ビルド環境

| 項目 | 設定 |
|------|------|
| ビルドツール | Vite 6.1.1 |
| React | 19.0.0 |
| TypeScript | 5.7.2 |
| Tailwind CSS | 4.0.0（Viteプラグイン統合） |
| テスト | Vitest |

### 既存スクリプト（package.json）

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

---

## タスク一覧

### 10.1 ダークモード対応

**目的:** ライト/ダークテーマの切り替え機能

**実装方法（Tailwind CSS v4）:**

1. **Theme Store作成**

```typescript
// src/stores/themeStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',

      setTheme: (theme) => {
        set({ theme })

        // DOMに反映
        const resolved = theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : theme

        set({ resolvedTheme: resolved })
        document.documentElement.classList.toggle('dark', resolved === 'dark')
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)
```

2. **App.tsxでテーマ初期化**

```typescript
// src/App.tsx
import { useEffect } from 'react'
import { useThemeStore } from './stores/themeStore'

function App() {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    // 初期化時にテーマを適用
    setTheme(theme)

    // システムテーマ変更を監視
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') setTheme('system')
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return (/* ... */)
}
```

3. **ThemeToggleコンポーネント**

```typescript
// src/components/ui/ThemeToggle.tsx
import { useThemeStore } from '../../stores/themeStore'

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()

  return (
    <button
      onClick={() => {
        const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
        setTheme(next)
      }}
      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
      title={`テーマ: ${theme}`}
    >
      {theme === 'light' && '☀️'}
      {theme === 'dark' && '🌙'}
      {theme === 'system' && '💻'}
    </button>
  )
}
```

4. **コンポーネントのダークモード対応例**

```typescript
// 変更前
<div className="bg-white border-b">

// 変更後
<div className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
```

**主要コンポーネントの対応箇所:**

| コンポーネント | 対応内容 |
|--------------|---------|
| Toolbar | 背景、ボタン色、ホバー状態 |
| SlideList | 背景、ボーダー、選択状態 |
| CanvasView | コンテナ背景 |
| Editor | ページ背景 |
| Home | 背景、テキスト、ボタン |
| ExportDialog | モーダル背景、入力フィールド |
| PropertyPanel | パネル背景、入力フィールド |

---

### 10.2 レスポンシブ対応

**目的:** モバイル・タブレット・デスクトップ対応

**Tailwindブレークポイント:**

| プレフィックス | 幅 | 用途 |
|--------------|------|------|
| (なし) | 0px~ | モバイル（デフォルト） |
| `sm:` | 640px~ | 大型スマートフォン |
| `md:` | 768px~ | タブレット |
| `lg:` | 1024px~ | デスクトップ |
| `xl:` | 1280px~ | 大画面 |

**Editor.tsxのレスポンシブ化:**

```typescript
// src/pages/Editor.tsx
export function Editor() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー（モバイル用メニューボタン） */}
      <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2"
        >
          ☰
        </button>
        <span className="font-medium">Canvas Studio</span>
        <ThemeToggle />
      </div>

      {/* Toolbar（デスクトップ） */}
      <div className="hidden md:block">
        <Toolbar canvasActions={canvasActions} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SlideList（レスポンシブ） */}
        <div
          className={`
            ${sidebarOpen ? 'block' : 'hidden'}
            md:block
            absolute md:relative
            z-10 md:z-auto
            w-48 md:w-40
            h-full
            bg-gray-50 dark:bg-gray-800
            border-r dark:border-gray-700
          `}
        >
          <SlideList />
        </div>

        {/* オーバーレイ（モバイル） */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden z-5"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* CanvasView */}
        <div className="flex-1 overflow-auto">
          <CanvasView canvasActions={canvasActions} />
        </div>

        {/* PropertyPanel（デスクトップのみ） */}
        <div className="hidden lg:block w-64">
          <PropertyPanel canvas={canvasRef.current} />
        </div>
      </div>

      {/* モバイル用ツールバー（下部固定） */}
      <div className="md:hidden border-t dark:border-gray-700 p-2">
        <MobileToolbar canvasActions={canvasActions} />
      </div>
    </div>
  )
}
```

**CanvasViewのレスポンシブ化:**

```typescript
// src/components/canvas/CanvasView.tsx
export function CanvasView({ canvasActions }: CanvasViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // コンテナサイズに合わせてスケール調整
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || !canvasRef.current) return

      const container = containerRef.current
      const canvas = canvasRef.current

      const scaleX = (container.clientWidth - 40) / canvas.width!
      const scaleY = (container.clientHeight - 40) / canvas.height!
      const newScale = Math.min(scaleX, scaleY, 1)

      setScale(newScale)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-gray-200 dark:bg-gray-900 overflow-auto p-4"
    >
      <div
        style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
      >
        <canvas id="main-canvas" />
      </div>
    </div>
  )
}
```

---

### 10.3 ローディング・エラーハンドリング

**目的:** 統一されたローディング・エラー表示

**1. 共通ローディングコンポーネント**

```typescript
// src/components/ui/Loading.tsx
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function Loading({ size = 'md', text }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`
          ${sizeClasses[size]}
          border-2 border-gray-300 dark:border-gray-600
          border-t-blue-500
          rounded-full
          animate-spin
        `}
      />
      {text && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {text}
        </span>
      )}
    </div>
  )
}

// 全画面ローディング
export function FullPageLoading({ text }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <Loading size="lg" text={text} />
    </div>
  )
}
```

**2. ErrorBoundaryの改善**

```typescript
// src/components/ErrorBoundary.tsx
import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {this.state.error?.message || '予期しないエラーが発生しました'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                再試行
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ページを再読み込み
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

**3. Suspense統合**

```typescript
// src/App.tsx
import { Suspense } from 'react'
import { FullPageLoading } from './components/ui/Loading'

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<FullPageLoading text="読み込み中..." />}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/editor" element={<Editor />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  )
}
```

---

### 10.4 README.md 作成

**目的:** プロジェクトドキュメント整備

**実装場所:** `README.md`（プロジェクトルート）

```markdown
# Canvas Studio

スライドベースのキャンバスエディタ。名刺やプレゼンテーション資料を作成し、PDF/PNG/JPEGでエクスポートできます。

## 機能

- 🎨 キャンバス編集（図形、テキスト、画像）
- 📄 複数スライド管理
- ↩️ Undo/Redo対応
- 📤 PNG/JPEG/PDFエクスポート
- 🖨️ 印刷用PDF（塗り足し・トンボ対応）
- 🌙 ダークモード対応
- 📱 レスポンシブデザイン
- 🔐 Google認証・クラウド保存

## 技術スタック

- **フロントエンド**: React 19, TypeScript, Tailwind CSS v4
- **キャンバス**: Fabric.js 6.5
- **状態管理**: Zustand
- **PDF生成**: pdf-lib
- **バックエンド**: Firebase (Auth, Firestore, Storage, Hosting)
- **ビルド**: Vite

## セットアップ

### 必要環境

- Node.js 18+
- npm または yarn

### インストール

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env
# .envにFirebase設定を記入
```

### 環境変数

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:5173 でアクセス

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run preview` | ビルドプレビュー |
| `npm run test` | テスト実行（watch） |
| `npm run test:run` | テスト実行（1回） |
| `npm run lint` | ESLintチェック |

## デプロイ

```bash
# ビルド
npm run build

# Firebase Hostingにデプロイ
firebase deploy --only hosting
```

## ディレクトリ構成

```
src/
├── components/      # UIコンポーネント
│   ├── canvas/      # キャンバス関連
│   ├── slides/      # スライド管理
│   ├── export/      # エクスポート機能
│   ├── templates/   # テンプレート選択
│   └── ui/          # 共通UI
├── hooks/           # カスタムフック
├── stores/          # Zustand状態管理
├── services/        # ビジネスロジック
├── types/           # 型定義
├── constants/       # 定数
├── lib/             # ライブラリ設定
└── pages/           # ページコンポーネント
```

## ライセンス

MIT
```

---

### 10.5 ビルド確認

**目的:** 本番ビルドの成功確認

**確認手順:**

```bash
# 1. 型チェック
npx tsc --noEmit

# 2. ESLintチェック
npm run lint

# 3. テスト実行
npm run test:run

# 4. ビルド実行
npm run build

# 5. ビルドプレビュー
npm run preview
```

**ビルド成功基準:**
- TypeScriptエラーなし
- ESLint警告・エラーなし
- 全テストパス
- `dist/`フォルダに出力
- プレビューで動作確認

**よくあるビルドエラー対応:**

| エラー | 対応 |
|-------|------|
| 型エラー | tsconfig.jsonの`strict`確認、型定義追加 |
| import不足 | パッケージインストール確認 |
| 環境変数未定義 | .envファイル確認 |
| バンドルサイズ超過 | コード分割、lazy import |

---

### 10.6 Firebase Hosting デプロイ

**目的:** 本番環境へのデプロイ

**1. Firebase CLIセットアップ**

```bash
# Firebase CLIインストール
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクト初期化
firebase init hosting
```

**2. firebase.json設定**

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

**3. .firebaserc設定**

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

**4. デプロイ実行**

```bash
# ビルド
npm run build

# デプロイ
firebase deploy --only hosting

# または特定プロジェクト指定
firebase deploy --only hosting --project your-project-id
```

**5. デプロイ確認**

デプロイ完了後、以下を確認:
- https://your-project-id.web.app でアクセス可能
- Google認証が動作
- キャンバス編集が動作
- エクスポートが動作

**6. package.jsonにデプロイスクリプト追加**

```json
{
  "scripts": {
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:preview": "npm run build && firebase hosting:channel:deploy preview"
  }
}
```

---

## 実装順序（推奨）

1. **10.3 ローディング・エラー** - 基盤整備
2. **10.1 ダークモード** - themeStore + コンポーネント対応
3. **10.2 レスポンシブ** - レイアウト調整
4. **10.5 ビルド確認** - エラー修正
5. **10.4 README** - ドキュメント作成
6. **10.6 デプロイ** - Firebase Hosting設定・公開

---

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/stores/themeStore.ts` | 新規: テーマ状態管理 |
| `src/components/ui/ThemeToggle.tsx` | 新規: テーマ切替ボタン |
| `src/components/ui/Loading.tsx` | 新規: ローディングコンポーネント |
| `src/components/ErrorBoundary.tsx` | 修正: Tailwind化 |
| `src/pages/Editor.tsx` | 修正: レスポンシブ化 |
| `src/components/canvas/CanvasView.tsx` | 修正: レスポンシブ化 |
| `README.md` | 新規: プロジェクトドキュメント |
| `firebase.json` | 新規: Hosting設定 |
| `.firebaserc` | 新規: プロジェクト設定 |

---

## チェックリスト

### 10.1 ダークモード
- [ ] themeStore作成
- [ ] ThemeToggleコンポーネント
- [ ] 全コンポーネントにdark:クラス追加
- [ ] システムテーマ追従

### 10.2 レスポンシブ
- [ ] Editor.tsxモバイル対応
- [ ] SlideList折りたたみ
- [ ] CanvasViewスケーリング
- [ ] モバイルツールバー
- [ ] PropertyPanel表示制御

### 10.3 ローディング・エラー
- [ ] Loadingコンポーネント作成
- [ ] ErrorBoundary改善
- [ ] Suspense統合
- [ ] 各ページでローディング表示

### 10.4 README
- [ ] 機能説明
- [ ] セットアップ手順
- [ ] 環境変数説明
- [ ] スクリプト一覧
- [ ] ディレクトリ構成

### 10.5 ビルド
- [ ] TypeScriptエラーなし
- [ ] ESLintエラーなし
- [ ] 全テストパス
- [ ] ビルド成功
- [ ] プレビュー動作確認

### 10.6 デプロイ
- [ ] Firebase CLI設定
- [ ] firebase.json作成
- [ ] .firebaserc作成
- [ ] デプロイ成功
- [ ] 本番動作確認

---

## 注意事項

1. **ダークモード:** 全コンポーネントで色指定を確認、ハードコードされた色をCSS変数化
2. **レスポンシブ:** モバイルファーストで設計、固定幅を避ける
3. **Firebase:** 環境変数は`.env`で管理、本番用と開発用を分離
4. **キャッシュ:** 静的アセットに適切なCache-Control設定
5. **SPA対応:** firebase.jsonでリライト設定必須

---

## 検証方法

1. **ダークモード:** システム設定変更で自動切り替え、手動切り替えボタン動作
2. **レスポンシブ:** Chrome DevToolsでモバイル表示確認、実機テスト
3. **ローディング:** ネットワーク遅延シミュレーションで表示確認
4. **エラー:** 意図的にエラーを発生させてErrorBoundary動作確認
5. **ビルド:** `npm run build && npm run preview`で本番相当確認
6. **デプロイ:** 本番URLで全機能動作確認
