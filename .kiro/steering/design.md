# Canvas Studio - 設計書

## 1. アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                        React App                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Toolbar │  │ SlideList   │  │      CanvasView         │  │
│  │         │  │ (Sidebar)   │  │      (Fabric.js)        │  │
│  └─────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     Zustand Stores                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ slideStore   │ │ editorStore  │ │ historyStore         │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     Custom Hooks                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ useCanvas    │ │ useAuth      │ │ useExport            │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     Firebase Services                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ Auth         │ │ Firestore    │ │ Storage              │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. ディレクトリ構成

```
canvas-studio/
├── src/
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── CanvasView.tsx      # Fabric.js Canvas
│   │   │   ├── Toolbar.tsx         # ツールバー
│   │   │   └── PropertyPanel.tsx   # プロパティパネル
│   │   ├── slides/
│   │   │   ├── SlideList.tsx       # スライド一覧
│   │   │   └── SlideThumb.tsx      # サムネイル
│   │   ├── export/
│   │   │   ├── ExportDialog.tsx    # エクスポートダイアログ
│   │   │   └── CMYKPreview.tsx     # CMYKプレビュー
│   │   ├── templates/
│   │   │   └── TemplateSelector.tsx # テンプレート選択
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── Toast.tsx
│   ├── hooks/
│   │   ├── useCanvas.ts            # Fabric.js操作
│   │   ├── useAuth.ts              # Firebase Auth
│   │   ├── useExport.ts            # エクスポート処理
│   │   ├── useHistory.ts           # Undo/Redo
│   │   └── useClipboard.ts         # コピー＆ペースト
│   ├── stores/
│   │   ├── slideStore.ts           # スライドデータ
│   │   ├── editorStore.ts          # エディタUI状態
│   │   └── historyStore.ts         # Undo/Redo履歴
│   ├── services/
│   │   ├── exportService.ts        # PDF/画像エクスポート
│   │   ├── cmykService.ts          # CMYK変換（pdfeditor参考）
│   │   └── businessCardService.ts  # 名刺PDF生成
│   ├── types/
│   │   ├── index.ts                # 共通型
│   │   └── fabric.d.ts             # Fabric.js型拡張
│   ├── lib/
│   │   └── firebase.ts             # Firebase設定
│   ├── pages/
│   │   ├── Editor.tsx              # メインエディタ
│   │   └── Home.tsx                # ホーム（認証）
│   ├── constants/
│   │   └── templates.ts            # テンプレート定義
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/                          # テストファイル
├── docs/
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
└── package.json
```

---

## 3. 型定義

### 3.1 基本型

```typescript
// src/types/index.ts

// スライド
export interface Slide {
  id: string
  canvasJson: string  // Fabric.js toJSON()
  thumbnail?: string  // Base64サムネイル
  createdAt: number
  updatedAt: number
}

// プロジェクト
export interface Project {
  id: string
  title: string
  slides: Slide[]
  template: TemplateType
  ownerId: string
  createdAt: number
  updatedAt: number
}

// テンプレート種別
export type TemplateType = 
  | '16:9'
  | 'a4-portrait'
  | 'a4-landscape'
  | 'business-card'
  | 'custom'

// テンプレート設定
export interface TemplateConfig {
  type: TemplateType
  width: number   // mm or px
  height: number
  unit: 'mm' | 'px'
  dpi: number     // 印刷用DPI（デフォルト300）
}

// エディタ状態
export interface EditorState {
  currentSlideId: string | null
  selectedObjectIds: string[]
  activeTool: ToolType
  zoom: number
}

// ツール種別
export type ToolType = 
  | 'select'
  | 'rect'
  | 'circle'
  | 'text'
  | 'image'

// エクスポート設定
export interface ExportOptions {
  format: 'png' | 'jpeg' | 'pdf'
  quality?: number        // 0-1
  cmyk?: boolean          // CMYK変換
  bleed?: number          // 塗り足し（mm）
  trimMarks?: boolean     // トンボ
}

// Undo/Redoアクション
export interface HistoryAction {
  type: string
  description: string
  undo: () => void
  redo: () => void
}
```

### 3.2 Fabric.js型拡張

```typescript
// src/types/fabric.d.ts
import 'fabric'

declare module 'fabric' {
  interface FabricObject {
    id?: string
  }
}
```

---

## 4. Zustandストア設計

### 4.1 slideStore

```typescript
// src/stores/slideStore.ts
interface SlideStore {
  project: Project | null
  currentSlideId: string | null
  
  // Actions
  setProject: (project: Project) => void
  setCurrentSlide: (slideId: string) => void
  updateSlideCanvas: (slideId: string, canvasJson: string) => void
  addSlide: () => void
  deleteSlide: (slideId: string) => void
  reorderSlides: (startIndex: number, endIndex: number) => void
  duplicateSlide: (slideId: string) => void
}
```

### 4.2 historyStore（Undo/Redo）

```typescript
// src/stores/historyStore.ts
interface HistoryStore {
  undoStack: HistoryAction[]
  redoStack: HistoryAction[]
  maxHistory: number  // 50
  
  // Actions
  push: (action: HistoryAction) => void
  undo: () => void
  redo: () => void
  clear: () => void
  canUndo: boolean
  canRedo: boolean
}
```

---

## 5. サービス設計

### 5.1 cmykService（pdfeditor参考）

```typescript
// src/services/cmykService.ts
export class CMYKService {
  // RGB → CMYK変換（ICC プロファイル考慮）
  static rgbToCmyk(r: number, g: number, b: number): [number, number, number, number]
  
  // Canvas全体をCMYK変換
  static convertCanvasToCMYK(canvas: HTMLCanvasElement): ImageData
  
  // CMYKプレビュー生成
  static generatePreview(canvas: HTMLCanvasElement): string  // Base64
}
```

### 5.2 businessCardService

```typescript
// src/services/businessCardService.ts
export class BusinessCardService {
  // 名刺サイズ定数
  static readonly SIZE = { width: 91, height: 55 }  // mm
  static readonly BLEED = 3  // mm
  static readonly DPI = 300

  // トンボ付きPDF生成
  static generatePDF(canvas: fabric.Canvas, options: {
    bleed: number
    trimMarks: boolean
    cmyk: boolean
  }): Promise<Blob>

  // トンボ描画
  private static drawTrimMarks(ctx: CanvasRenderingContext2D, config: TemplateConfig): void
}
```

---

## 6. テンプレート定義

```typescript
// src/constants/templates.ts
export const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  '16:9': {
    type: '16:9',
    width: 1920,
    height: 1080,
    unit: 'px',
    dpi: 72
  },
  'a4-portrait': {
    type: 'a4-portrait',
    width: 210,
    height: 297,
    unit: 'mm',
    dpi: 300
  },
  'a4-landscape': {
    type: 'a4-landscape',
    width: 297,
    height: 210,
    unit: 'mm',
    dpi: 300
  },
  'business-card': {
    type: 'business-card',
    width: 91,
    height: 55,
    unit: 'mm',
    dpi: 300
  },
  'custom': {
    type: 'custom',
    width: 800,
    height: 600,
    unit: 'px',
    dpi: 72
  }
}
```

---

## 7. コンポーネント設計

### 7.1 CanvasView

```typescript
// Fabric.js Canvasのラッパー
// 責務: Canvas描画、オブジェクト操作、イベントハンドリング
interface CanvasViewProps {
  slideId: string
}
```

### 7.2 Toolbar

```typescript
// ツールバー
// 責務: ツール選択、オブジェクト追加ボタン
interface ToolbarProps {
  onAddRect: () => void
  onAddCircle: () => void
  onAddText: () => void
  onAddImage: () => void
  onUndo: () => void
  onRedo: () => void
  onExport: () => void
}
```

### 7.3 SlideList

```typescript
// スライド一覧（サイドバー）
// 責務: サムネイル表示、スライド選択、ドラッグ並べ替え
interface SlideListProps {
  slides: Slide[]
  currentSlideId: string
  onSelect: (slideId: string) => void
  onReorder: (startIndex: number, endIndex: number) => void
}
```

---

## 8. テスト戦略

### 8.1 テスト種別

| 種別 | ツール | 対象 |
|------|--------|------|
| 単体テスト | Vitest | サービス、ユーティリティ |
| コンポーネントテスト | Vitest + RTL | Reactコンポーネント |
| E2Eテスト | Playwright | 主要ユーザーフロー |

### 8.2 テスト方針

- サービス（CMYKService等）は必ず単体テスト
- Zustandストアは単体テスト
- 主要フロー（スライド作成→編集→エクスポート）はE2Eテスト

---

## 9. Firebase設計

### 9.1 Firestoreコレクション

```
users/{userId}
  - email: string
  - displayName: string
  - createdAt: timestamp

projects/{projectId}
  - title: string
  - ownerId: string
  - template: string
  - slides: array
  - createdAt: timestamp
  - updatedAt: timestamp
```

### 9.2 セキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.ownerId;
    }
  }
}
```

---

## 10. pdfeditor参考ファイル

| 機能 | pdfeditorパス | 備考 |
|------|--------------|------|
| CMYK変換 | `src/services/CMYKService.ts` | RGB→CMYK変換ロジック |
| Undo/Redo | `src/services/UndoManager.ts` | 履歴管理パターン |
| PDF出力 | `src/services/PDFService.ts` | pdf-lib使用 |
