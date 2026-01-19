# Canvaライク スライドエディタ - Claude Code 指示書（最終版）

## プロジェクト前提

### 開発環境
- OS: WSL2 (Ubuntu)
- Node.js: v20.x（nvm で管理）
- 作業ディレクトリ: ~/projects/slide-maker
- エディタ: VS Code（Remote - WSL 使用）
- ブラウザ: Windows 側 Chrome
- ポート: localhost:5173（WSL2 自動転送）

### 重要な制約
- プロジェクトは WSL2 の Linux ファイルシステム上（~/projects）に配置
- /mnt/c 配下は使用しない（パフォーマンス問題のため）

---

## 技術スタック（固定）

| カテゴリ | 技術 |
|---------|------|
| ビルドツール | Vite |
| フレームワーク | React + TypeScript |
| キャンバス | Fabric.js 6.x |
| 状態管理 | Zustand |
| スタイリング | Tailwind CSS v4（@tailwindcss/vite） |
| 認証 | Firebase Authentication |
| データベース | Firestore |
| ストレージ | Firebase Storage |
| ローカル開発 | Firebase Emulator |

### 設計方針
- SPA（SSR なし）
- SEO 考慮不要
- 初回表示より操作性重視

---

## プロジェクト作成手順

```bash
# 1. ディレクトリ作成・移動
cd ~/projects
npm create vite@latest slide-maker -- --template react-ts
cd slide-maker

# 2. 依存関係インストール
npm install

# 3. 追加ライブラリ
npm install fabric zustand firebase

# 4. 開発用ライブラリ
npm install -D tailwindcss @tailwindcss/vite

# ※ @types/fabric は不要（Fabric.js 6.x は型が組み込み済み）
```

---

## 設定ファイル

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,  // 0.0.0.0 にバインド（WSL2 から Windows ブラウザアクセス用）
    port: 5173
  }
})
```

### src/index.css

```css
@import "tailwindcss";
```

### firebase.json（プロジェクトルートに作成）

```json
{
  "emulators": {
    "auth": {
      "host": "0.0.0.0",
      "port": 9099
    },
    "firestore": {
      "host": "0.0.0.0",
      "port": 8080
    },
    "storage": {
      "host": "0.0.0.0",
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "host": "0.0.0.0",
      "port": 4000
    }
  }
}
```

### src/lib/firebase.ts

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  // 本番用の設定（後で追加）
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// ローカル開発時は Emulator に接続
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}
```

---

## ディレクトリ構成

```
slide-maker/
├── src/
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── CanvasView.tsx      # Fabric.js Canvas のラッパー
│   │   │   ├── Toolbar.tsx         # 図形追加などのツールバー
│   │   │   └── PropertyPanel.tsx   # 選択オブジェクトのプロパティ
│   │   ├── slides/
│   │   │   ├── SlideList.tsx       # スライド一覧
│   │   │   └── SlideThumb.tsx      # スライドサムネイル
│   │   └── ui/
│   │       └── Button.tsx          # 共通ボタン
│   ├── hooks/
│   │   ├── useCanvas.ts            # Fabric.js 操作ロジック
│   │   └── useAuth.ts              # Firebase Auth ロジック
│   ├── stores/
│   │   ├── slideStore.ts           # スライドデータの状態管理
│   │   ├── editorStore.ts          # エディタ UI の状態管理
│   │   └── historyStore.ts         # Undo/Redo 履歴管理
│   ├── types/
│   │   ├── index.ts                # 型定義
│   │   └── fabric.d.ts             # Fabric.js 型拡張
│   ├── lib/
│   │   └── firebase.ts             # Firebase 初期化
│   ├── pages/
│   │   └── Editor.tsx              # メインエディタページ
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── firebase.json
├── tsconfig.json
└── package.json
```

---

## 型定義

### src/types/index.ts

```typescript
// スライド1枚のデータ
export interface Slide {
  id: string
  canvasJson: string  // Fabric.js の toJSON() 結果
  createdAt: number
  updatedAt: number
}

// プロジェクト全体
export interface Project {
  id: string
  title: string
  slides: Slide[]
  ownerId: string
  createdAt: number
  updatedAt: number
}

// エディタの状態
export interface EditorState {
  currentSlideId: string | null
  selectedObjectId: string | null
  activeTool: 'select' | 'rect' | 'circle' | 'text'
  zoom: number
}
```

### src/types/fabric.d.ts（重要：Fabric.js 型拡張）

```typescript
// Fabric.js のオブジェクトに id プロパティを追加
// Fabric.js は公式には id を持たないため、型を拡張する

import 'fabric'

declare module 'fabric' {
  interface FabricObject {
    id?: string
  }
}
```

---

## 実装方針

### 責務分離（重要）

| 担当 | 役割 |
|------|------|
| React | UI 描画、状態管理、イベントハンドリング |
| Fabric.js | Canvas 操作（描画、オブジェクト管理） |
| Zustand | グローバル状態（スライド、UI状態、履歴） |

### ルール
- React コンポーネント内に Fabric.js のロジックを直接書かない
- Canvas 操作は `useCanvas` hook に集約
- Fabric.js の Canvas インスタンスは useRef で保持

---

## Zustand ストア設計

### src/stores/slideStore.ts

```typescript
import { create } from 'zustand'
import type { Slide, Project } from '../types'

interface SlideStore {
  project: Project | null
  currentSlideId: string | null
  
  // Actions
  setProject: (project: Project) => void
  setCurrentSlide: (slideId: string) => void
  updateSlideCanvas: (slideId: string, canvasJson: string) => void
  addSlide: () => void
  deleteSlide: (slideId: string) => void
}

export const useSlideStore = create<SlideStore>((set) => ({
  project: null,
  currentSlideId: null,
  
  setProject: (project) => set({ project }),
  
  setCurrentSlide: (slideId) => set({ currentSlideId: slideId }),
  
  updateSlideCanvas: (slideId, canvasJson) => set((state) => {
    if (!state.project) return state
    return {
      project: {
        ...state.project,
        slides: state.project.slides.map((slide) =>
          slide.id === slideId
            ? { ...slide, canvasJson, updatedAt: Date.now() }
            : slide
        )
      }
    }
  }),
  
  addSlide: () => set((state) => {
    if (!state.project) return state
    const newSlide: Slide = {
      id: crypto.randomUUID(),
      canvasJson: '{}',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    return {
      project: {
        ...state.project,
        slides: [...state.project.slides, newSlide]
      },
      currentSlideId: newSlide.id
    }
  }),
  
  deleteSlide: (slideId) => set((state) => {
    if (!state.project) return state
    const newSlides = state.project.slides.filter((s) => s.id !== slideId)
    return {
      project: {
        ...state.project,
        slides: newSlides
      },
      currentSlideId: newSlides[0]?.id ?? null
    }
  })
}))
```

### src/stores/editorStore.ts

```typescript
import { create } from 'zustand'
import type { EditorState } from '../types'

interface EditorStore extends EditorState {
  setActiveTool: (tool: EditorState['activeTool']) => void
  setSelectedObject: (objectId: string | null) => void
  setZoom: (zoom: number) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  currentSlideId: null,
  selectedObjectId: null,
  activeTool: 'select',
  zoom: 1,
  
  setActiveTool: (tool) => set({ activeTool: tool }),
  setSelectedObject: (objectId) => set({ selectedObjectId: objectId }),
  setZoom: (zoom) => set({ zoom })
}))
```

---

## useCanvas hook

### src/hooks/useCanvas.ts

```typescript
import { useEffect, useRef, useCallback } from 'react'
import { Canvas, Rect, Circle, IText, TPointerEventInfo, TPointerEvent } from 'fabric'
import { useSlideStore } from '../stores/slideStore'
import { useEditorStore } from '../stores/editorStore'

export function useCanvas(canvasElementId: string) {
  const canvasRef = useRef<Canvas | null>(null)
  const { currentSlideId, updateSlideCanvas } = useSlideStore()
  const { setSelectedObject } = useEditorStore()

  // Canvas を JSON として保存
  const saveCanvas = useCallback(() => {
    if (!canvasRef.current || !currentSlideId) return
    const json = JSON.stringify(canvasRef.current.toJSON(['id']))
    updateSlideCanvas(currentSlideId, json)
  }, [currentSlideId, updateSlideCanvas])

  // 選択オブジェクト削除
  const deleteSelected = useCallback(() => {
    if (!canvasRef.current) return
    const activeObjects = canvasRef.current.getActiveObjects()
    activeObjects.forEach((obj) => {
      canvasRef.current?.remove(obj)
    })
    canvasRef.current.discardActiveObject()
    saveCanvas()
  }, [saveCanvas])

  // Canvas 初期化
  useEffect(() => {
    const canvasElement = document.getElementById(canvasElementId) as HTMLCanvasElement
    if (!canvasElement) return

    const canvas = new Canvas(canvasElement, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    })

    canvasRef.current = canvas

    // 選択イベントハンドラー（共通化）
    const handleSelection = (e: TPointerEventInfo<TPointerEvent>) => {
      const selected = e.selected?.[0]
      if (selected) {
        setSelectedObject(selected.id ?? null)
      }
    }

    // 選択イベント（created と updated 両方を監視）
    canvas.on('selection:created', handleSelection)
    canvas.on('selection:updated', handleSelection)

    canvas.on('selection:cleared', () => {
      setSelectedObject(null)
    })

    // 変更時に保存
    canvas.on('object:modified', () => {
      saveCanvas()
    })

    return () => {
      canvas.dispose()
    }
  }, [canvasElementId, setSelectedObject, saveCanvas])

  // Delete キー対応
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // input や textarea にフォーカスがある場合は無視
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelected()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelected])

  // Canvas を JSON から復元
  const loadCanvas = useCallback((json: string) => {
    if (!canvasRef.current || !json || json === '{}') return
    canvasRef.current.loadFromJSON(json).then(() => {
      canvasRef.current?.renderAll()
    })
  }, [])

  // 図形追加
  const addRect = useCallback(() => {
    if (!canvasRef.current) return
    const rect = new Rect({
      id: crypto.randomUUID(),
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: '#3b82f6',
      stroke: '#1d4ed8',
      strokeWidth: 2
    })
    canvasRef.current.add(rect)
    canvasRef.current.setActiveObject(rect)
    saveCanvas()
  }, [saveCanvas])

  const addCircle = useCallback(() => {
    if (!canvasRef.current) return
    const circle = new Circle({
      id: crypto.randomUUID(),
      left: 100,
      top: 100,
      radius: 50,
      fill: '#22c55e',
      stroke: '#15803d',
      strokeWidth: 2
    })
    canvasRef.current.add(circle)
    canvasRef.current.setActiveObject(circle)
    saveCanvas()
  }, [saveCanvas])

  const addText = useCallback(() => {
    if (!canvasRef.current) return
    const text = new IText('テキストを入力', {
      id: crypto.randomUUID(),
      left: 100,
      top: 100,
      fontSize: 24,
      fill: '#1f2937'
    })
    canvasRef.current.add(text)
    canvasRef.current.setActiveObject(text)
    saveCanvas()
  }, [saveCanvas])

  return {
    canvas: canvasRef,
    addRect,
    addCircle,
    addText,
    deleteSelected,
    loadCanvas,
    saveCanvas
  }
}
```

---

## Phase 1: 基本キャンバス実装

### 目標
- 白紙の Canvas が表示される
- 図形（四角形、円）を追加できる
- テキストを追加できる
- 図形を選択・移動・リサイズできる
- Delete キーで削除できる

### 実装ファイル

#### src/components/canvas/CanvasView.tsx

```typescript
import { useEffect } from 'react'
import { useCanvas } from '../../hooks/useCanvas'
import { useSlideStore } from '../../stores/slideStore'

export function CanvasView() {
  const { loadCanvas } = useCanvas('main-canvas')
  const { project, currentSlideId } = useSlideStore()

  // スライド切り替え時に Canvas を読み込み
  useEffect(() => {
    if (!project || !currentSlideId) return
    const slide = project.slides.find((s) => s.id === currentSlideId)
    if (slide) {
      loadCanvas(slide.canvasJson)
    }
  }, [currentSlideId, project, loadCanvas])

  return (
    <div className="flex items-center justify-center bg-gray-200 p-8 flex-1">
      <div className="shadow-lg">
        <canvas id="main-canvas" />
      </div>
    </div>
  )
}
```

#### src/components/canvas/Toolbar.tsx

```typescript
import { useCanvas } from '../../hooks/useCanvas'

export function Toolbar() {
  const { addRect, addCircle, addText, deleteSelected } = useCanvas('main-canvas')

  return (
    <div className="flex gap-2 p-4 bg-white border-b">
      <button
        onClick={addRect}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        四角形
      </button>
      <button
        onClick={addCircle}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        円
      </button>
      <button
        onClick={addText}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
      >
        テキスト
      </button>
      <div className="flex-1" />
      <button
        onClick={deleteSelected}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        削除
      </button>
    </div>
  )
}
```

#### src/pages/Editor.tsx

```typescript
import { useEffect } from 'react'
import { CanvasView } from '../components/canvas/CanvasView'
import { Toolbar } from '../components/canvas/Toolbar'
import { useSlideStore } from '../stores/slideStore'
import type { Project } from '../types'

export function Editor() {
  const { project, setProject, setCurrentSlide } = useSlideStore()

  // 初期化：空のプロジェクトを作成
  useEffect(() => {
    if (project) return

    const initialProject: Project = {
      id: crypto.randomUUID(),
      title: '無題のプロジェクト',
      slides: [
        {
          id: crypto.randomUUID(),
          canvasJson: '{}',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ],
      ownerId: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    setProject(initialProject)
    setCurrentSlide(initialProject.slides[0].id)
  }, [project, setProject, setCurrentSlide])

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <CanvasView />
    </div>
  )
}
```

#### src/App.tsx

```typescript
import { Editor } from './pages/Editor'

function App() {
  return <Editor />
}

export default App
```

#### src/main.tsx

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

---

## Phase 2: スライド管理（Phase 1 完了後）

- スライド一覧表示
- スライド追加・削除
- スライド切り替え
- サムネイル表示

---

## Phase 3: Undo/Redo（Phase 2 完了後）

- 履歴管理ストア実装
- Ctrl+Z / Ctrl+Y 対応
- 履歴スタックの最大数制限

---

## Phase 4: Firebase 連携（Phase 3 完了後）

- Google 認証
- Firestore へのプロジェクト保存
- Firebase Storage への画像アップロード
- 自動保存機能

---

## コーディングルール

1. TypeScript の型を省略しない
2. `any` は使わない（型拡張で対応する）
3. React コンポーネントは責務を分離する
4. 1ファイルが 200行を超えたら分割を検討
5. コメントは「なぜ」を書く（「何を」はコードで表現）

---

## WSL2 特有の注意

1. ファイル監視が効かない場合は vite.config.ts に以下を追加：
   ```typescript
   server: {
     watch: {
       usePolling: true,
       interval: 1000
     }
   }
   ```

2. Firebase CLI のログイン：
   ```bash
   firebase login --no-localhost
   ```

3. Emulator 起動：
   ```bash
   firebase emulators:start
   ```
   Windows ブラウザから http://localhost:4000 で Emulator UI にアクセス可能

---

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Firebase Emulator 起動
firebase emulators:start

# 型チェック
npx tsc --noEmit
```

---

## 作業開始

まず Phase 1 を実装してください。
上記のコードはそのまま使用可能ですが、必要に応じて改善してください。

実装完了後、localhost:5173 で以下を確認：
- [ ] 白い Canvas が表示される
- [ ] 「四角形」ボタンで青い四角が追加される
- [ ] 「円」ボタンで緑の円が追加される
- [ ] 「テキスト」ボタンでテキストが追加される
- [ ] オブジェクトをクリックで選択できる
- [ ] 選択したオブジェクトをドラッグで移動できる
- [ ] 選択したオブジェクトの角をドラッグでリサイズできる
- [ ] Delete キーで選択オブジェクトが削除される
