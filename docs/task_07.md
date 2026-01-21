# Phase 7: テンプレート - 実装タスク

## 概要

Phase 7では、プロジェクト作成時にキャンバスサイズを選択できるテンプレート機能を実装する。
- 定義済みテンプレート（16:9、A4縦/横、名刺）
- カスタムサイズ入力
- プロジェクト作成フローへの統合

## 前提条件

- Phase 1-6 完了済み
- 既存の型定義（TemplateType, TemplateConfig）を使用
- Fabric.js の動的サイズ変更対応

---

## 既存の型定義（types/index.ts）

```typescript
// 既に定義済み
export type TemplateType =
  | '16:9'
  | 'a4-portrait'
  | 'a4-landscape'
  | 'business-card'
  | 'custom'

export interface TemplateConfig {
  type: TemplateType
  width: number
  height: number
  unit: 'mm' | 'px'
  dpi: number
}

export interface Project {
  id: string
  title: string
  slides: Slide[]
  template: TemplateType  // ← テンプレート対応済み
  ownerId: string
  createdAt: number
  updatedAt: number
}
```

---

## テンプレートサイズ仕様

### DPI変換公式

```typescript
// ミリメートルからピクセルへの変換（96 DPI基準）
const mmToPixel = (mm: number, dpi: number = 96): number => {
  return Math.round((mm * dpi) / 25.4)
}
```

### 標準テンプレートサイズ

| テンプレート | 物理サイズ | ピクセル（96 DPI） | 用途 |
|------------|----------|------------------|------|
| **16:9** | - | 1920 x 1080 | プレゼンテーション |
| **A4 縦** | 210 x 297 mm | 794 x 1123 | ドキュメント |
| **A4 横** | 297 x 210 mm | 1123 x 794 | 横向きドキュメント |
| **名刺** | 91 x 55 mm | 344 x 208 | ビジネスカード |

---

## タスク一覧

### 7.1 templates.ts 定数ファイル作成

**目的:** テンプレート設定を一元管理

**実装場所:** `src/constants/templates.ts`（新規作成）

**実装内容:**

```typescript
import type { TemplateConfig, TemplateType } from '../types'

// DPI変換ユーティリティ
export const mmToPixel = (mm: number, dpi: number = 96): number => {
  return Math.round((mm * dpi) / 25.4)
}

// テンプレート設定
export const TEMPLATE_CONFIGS: Record<TemplateType, TemplateConfig> = {
  '16:9': {
    type: '16:9',
    width: 1920,
    height: 1080,
    unit: 'px',
    dpi: 96,
  },
  'a4-portrait': {
    type: 'a4-portrait',
    width: 794,   // mmToPixel(210)
    height: 1123, // mmToPixel(297)
    unit: 'px',
    dpi: 96,
  },
  'a4-landscape': {
    type: 'a4-landscape',
    width: 1123,  // mmToPixel(297)
    height: 794,  // mmToPixel(210)
    unit: 'px',
    dpi: 96,
  },
  'business-card': {
    type: 'business-card',
    width: 344,   // mmToPixel(91)
    height: 208,  // mmToPixel(55)
    unit: 'px',
    dpi: 96,
  },
  'custom': {
    type: 'custom',
    width: 800,
    height: 600,
    unit: 'px',
    dpi: 96,
  },
}

// テンプレートラベル（UI表示用）
export const TEMPLATE_LABELS: Record<TemplateType, string> = {
  '16:9': '16:9 プレゼンテーション',
  'a4-portrait': 'A4 縦',
  'a4-landscape': 'A4 横',
  'business-card': '名刺',
  'custom': 'カスタムサイズ',
}

// テンプレート説明（UI表示用）
export const TEMPLATE_DESCRIPTIONS: Record<TemplateType, string> = {
  '16:9': '1920 x 1080 px',
  'a4-portrait': '210 x 297 mm (794 x 1123 px)',
  'a4-landscape': '297 x 210 mm (1123 x 794 px)',
  'business-card': '91 x 55 mm (344 x 208 px)',
  'custom': '任意のサイズを指定',
}

// テンプレート一覧（選択UI用）
export const TEMPLATE_LIST: TemplateType[] = [
  '16:9',
  'a4-portrait',
  'a4-landscape',
  'business-card',
  'custom',
]
```

---

### 7.2 TemplateSelector コンポーネント実装

**目的:** テンプレート選択UI

**実装場所:** `src/components/templates/TemplateSelector.tsx`（新規作成）

**インターフェース:**

```typescript
interface TemplateSelectorProps {
  onSelect: (template: TemplateType, config: TemplateConfig) => void
  onCancel?: () => void
  showCustomOption?: boolean
}
```

**実装:**

```typescript
import { useState } from 'react'
import type { TemplateType, TemplateConfig } from '../../types'
import {
  TEMPLATE_CONFIGS,
  TEMPLATE_LABELS,
  TEMPLATE_DESCRIPTIONS,
  TEMPLATE_LIST,
} from '../../constants/templates'

interface TemplateSelectorProps {
  onSelect: (template: TemplateType, config: TemplateConfig) => void
  onCancel?: () => void
  showCustomOption?: boolean
}

export function TemplateSelector({
  onSelect,
  onCancel,
  showCustomOption = true,
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('16:9')
  const [customWidth, setCustomWidth] = useState(800)
  const [customHeight, setCustomHeight] = useState(600)

  const templates = showCustomOption
    ? TEMPLATE_LIST
    : TEMPLATE_LIST.filter((t) => t !== 'custom')

  const handleConfirm = () => {
    if (selectedTemplate === 'custom') {
      const customConfig: TemplateConfig = {
        type: 'custom',
        width: customWidth,
        height: customHeight,
        unit: 'px',
        dpi: 96,
      }
      onSelect('custom', customConfig)
    } else {
      onSelect(selectedTemplate, TEMPLATE_CONFIGS[selectedTemplate])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">テンプレートを選択</h2>

        {/* テンプレート一覧 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {templates.map((template) => (
            <button
              key={template}
              onClick={() => setSelectedTemplate(template)}
              className={`
                p-4 border rounded-lg text-left transition-all
                ${selectedTemplate === template
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="font-medium">{TEMPLATE_LABELS[template]}</div>
              <div className="text-sm text-gray-500">
                {TEMPLATE_DESCRIPTIONS[template]}
              </div>
            </button>
          ))}
        </div>

        {/* カスタムサイズ入力 */}
        {selectedTemplate === 'custom' && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium mb-2">カスタムサイズ (px)</div>
            <div className="flex gap-4">
              <div>
                <label className="text-xs text-gray-500">幅</label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  min={100}
                  max={4096}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">高さ</label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  min={100}
                  max={4096}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* プレビュー */}
        <div className="mb-4 flex justify-center">
          <TemplatePreview
            width={
              selectedTemplate === 'custom'
                ? customWidth
                : TEMPLATE_CONFIGS[selectedTemplate].width
            }
            height={
              selectedTemplate === 'custom'
                ? customHeight
                : TEMPLATE_CONFIGS[selectedTemplate].height
            }
          />
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              キャンセル
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            作成
          </button>
        </div>
      </div>
    </div>
  )
}

// プレビューコンポーネント
function TemplatePreview({ width, height }: { width: number; height: number }) {
  const maxSize = 150
  const aspectRatio = width / height
  const previewWidth = aspectRatio > 1 ? maxSize : maxSize * aspectRatio
  const previewHeight = aspectRatio > 1 ? maxSize / aspectRatio : maxSize

  return (
    <div
      className="border-2 border-gray-300 bg-white shadow-sm"
      style={{
        width: previewWidth,
        height: previewHeight,
      }}
    >
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
        {width} x {height}
      </div>
    </div>
  )
}
```

---

### 7.3 16:9 テンプレート

**サイズ:** 1920 x 1080 px

**用途:** プレゼンテーション、スライドショー

**設定:** TEMPLATE_CONFIGS['16:9'] で定義済み

---

### 7.4 A4縦テンプレート

**サイズ:** 210 x 297 mm → 794 x 1123 px（96 DPI）

**用途:** ドキュメント、レポート、チラシ

**設定:** TEMPLATE_CONFIGS['a4-portrait'] で定義済み

---

### 7.5 A4横テンプレート

**サイズ:** 297 x 210 mm → 1123 x 794 px（96 DPI）

**用途:** 横向きドキュメント、証明書

**設定:** TEMPLATE_CONFIGS['a4-landscape'] で定義済み

---

### 7.6 名刺テンプレート

**サイズ:** 91 x 55 mm → 344 x 208 px（96 DPI）

**用途:** ビジネスカード

**設定:** TEMPLATE_CONFIGS['business-card'] で定義済み

**注意:** Phase 9で塗り足し・トンボ対応を追加予定

---

### 7.7 カスタムサイズ入力（任意）

**目的:** 任意のサイズでキャンバスを作成

**制約:**
- 最小サイズ: 100 x 100 px
- 最大サイズ: 4096 x 4096 px

**実装:** TemplateSelector内のカスタムサイズ入力フォームで対応

---

### 7.8 プロジェクト作成フロー統合

**目的:** Home → TemplateSelector → Editor のフローを構築

**現在のフロー:**
```
Home (認証) → Editor
```

**新しいフロー:**
```
Home (認証) → TemplateSelector → Editor
```

**Home.tsx の修正:**

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSlideStore } from '../stores/slideStore'
import { TemplateSelector } from '../components/templates/TemplateSelector'
import type { TemplateType, TemplateConfig } from '../types'

export function Home() {
  const { user, signIn, signOut } = useAuth()
  const { createProject } = useSlideStore()
  const navigate = useNavigate()
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  const handleCreateProject = (template: TemplateType, config: TemplateConfig) => {
    createProject('新規プロジェクト', template, config)
    setShowTemplateSelector(false)
    navigate('/editor')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {user ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Canvas Studio</h1>
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            新規プロジェクト作成
          </button>
          <button
            onClick={signOut}
            className="mt-4 text-gray-500 hover:text-gray-700"
          >
            ログアウト
          </button>

          {showTemplateSelector && (
            <TemplateSelector
              onSelect={handleCreateProject}
              onCancel={() => setShowTemplateSelector(false)}
            />
          )}
        </>
      ) : (
        <button
          onClick={signIn}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg"
        >
          Googleでログイン
        </button>
      )}
    </div>
  )
}
```

**slideStore.ts の拡張:**

```typescript
import { create } from 'zustand'
import type { Project, Slide, TemplateType, TemplateConfig } from '../types'
import { TEMPLATE_CONFIGS } from '../constants/templates'

interface SlideStore {
  project: Project | null
  slides: Slide[]
  templateConfig: TemplateConfig | null

  // 既存
  setProject: (project: Project) => void
  addSlide: () => void
  updateSlide: (slideId: string, canvasJson: string) => void
  deleteSlide: (slideId: string) => void
  reorderSlides: (fromIndex: number, toIndex: number) => void

  // 新規追加
  createProject: (
    title: string,
    template: TemplateType,
    config?: TemplateConfig
  ) => void
  getTemplateConfig: () => TemplateConfig
}

export const useSlideStore = create<SlideStore>((set, get) => ({
  project: null,
  slides: [],
  templateConfig: null,

  createProject: (title, template, config) => {
    const templateConfig = config || TEMPLATE_CONFIGS[template]
    const newProject: Project = {
      id: crypto.randomUUID(),
      title,
      slides: [],
      template,
      ownerId: '', // 後でuseAuthから設定
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    set({
      project: newProject,
      slides: [],
      templateConfig,
    })
  },

  getTemplateConfig: () => {
    const { project, templateConfig } = get()
    if (templateConfig) return templateConfig
    if (project) return TEMPLATE_CONFIGS[project.template]
    return TEMPLATE_CONFIGS['16:9'] // デフォルト
  },

  // ...既存の実装
}))
```

**useCanvas.ts の動的サイズ対応:**

```typescript
import { useSlideStore } from '../stores/slideStore'

export function useCanvas(canvasId: string) {
  const { getTemplateConfig } = useSlideStore()
  const canvasRef = useRef<fabric.Canvas | null>(null)

  useEffect(() => {
    const canvasElement = document.getElementById(canvasId) as HTMLCanvasElement
    if (!canvasElement) return

    const config = getTemplateConfig()

    const canvas = new fabric.Canvas(canvasElement, {
      width: config.width,
      height: config.height,
      backgroundColor: '#ffffff',
      selection: true,
    })

    canvasRef.current = canvas

    return () => {
      canvas.dispose()
    }
  }, [canvasId, getTemplateConfig])

  // ...
}
```

---

### 7.9 テスト: テンプレート選択・サイズ確認

**テストファイル:** `src/test/templates.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TemplateSelector } from '../components/templates/TemplateSelector'
import {
  TEMPLATE_CONFIGS,
  TEMPLATE_LABELS,
  mmToPixel,
} from '../constants/templates'

describe('Phase 7: テンプレート機能', () => {
  describe('7.1 templates.ts 定数', () => {
    it('should have all template types defined', () => {
      expect(TEMPLATE_CONFIGS['16:9']).toBeDefined()
      expect(TEMPLATE_CONFIGS['a4-portrait']).toBeDefined()
      expect(TEMPLATE_CONFIGS['a4-landscape']).toBeDefined()
      expect(TEMPLATE_CONFIGS['business-card']).toBeDefined()
      expect(TEMPLATE_CONFIGS['custom']).toBeDefined()
    })

    it('should calculate correct pixel sizes for A4', () => {
      // A4: 210 x 297 mm @ 96 DPI
      expect(mmToPixel(210)).toBe(794)
      expect(mmToPixel(297)).toBe(1123)
    })

    it('should calculate correct pixel sizes for business card', () => {
      // 名刺: 91 x 55 mm @ 96 DPI
      expect(mmToPixel(91)).toBe(344)
      expect(mmToPixel(55)).toBe(208)
    })
  })

  describe('7.2 TemplateSelector コンポーネント', () => {
    it('should render all template options', () => {
      const onSelect = vi.fn()
      render(<TemplateSelector onSelect={onSelect} />)

      expect(screen.getByText(TEMPLATE_LABELS['16:9'])).toBeInTheDocument()
      expect(screen.getByText(TEMPLATE_LABELS['a4-portrait'])).toBeInTheDocument()
      expect(screen.getByText(TEMPLATE_LABELS['a4-landscape'])).toBeInTheDocument()
      expect(screen.getByText(TEMPLATE_LABELS['business-card'])).toBeInTheDocument()
    })

    it('should call onSelect with correct template on confirm', () => {
      const onSelect = vi.fn()
      render(<TemplateSelector onSelect={onSelect} />)

      // A4縦を選択
      fireEvent.click(screen.getByText(TEMPLATE_LABELS['a4-portrait']))
      fireEvent.click(screen.getByText('作成'))

      expect(onSelect).toHaveBeenCalledWith(
        'a4-portrait',
        TEMPLATE_CONFIGS['a4-portrait']
      )
    })

    it('should show custom size inputs when custom is selected', () => {
      const onSelect = vi.fn()
      render(<TemplateSelector onSelect={onSelect} />)

      fireEvent.click(screen.getByText(TEMPLATE_LABELS['custom']))

      expect(screen.getByLabelText('幅')).toBeInTheDocument()
      expect(screen.getByLabelText('高さ')).toBeInTheDocument()
    })

    it('should call onCancel when cancel button is clicked', () => {
      const onSelect = vi.fn()
      const onCancel = vi.fn()
      render(<TemplateSelector onSelect={onSelect} onCancel={onCancel} />)

      fireEvent.click(screen.getByText('キャンセル'))

      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe('7.3-7.6 テンプレートサイズ', () => {
    it('16:9 should be 1920x1080', () => {
      const config = TEMPLATE_CONFIGS['16:9']
      expect(config.width).toBe(1920)
      expect(config.height).toBe(1080)
    })

    it('A4 portrait should be 794x1123', () => {
      const config = TEMPLATE_CONFIGS['a4-portrait']
      expect(config.width).toBe(794)
      expect(config.height).toBe(1123)
    })

    it('A4 landscape should be 1123x794', () => {
      const config = TEMPLATE_CONFIGS['a4-landscape']
      expect(config.width).toBe(1123)
      expect(config.height).toBe(794)
    })

    it('business card should be 344x208', () => {
      const config = TEMPLATE_CONFIGS['business-card']
      expect(config.width).toBe(344)
      expect(config.height).toBe(208)
    })
  })
})
```

---

## 実装順序（推奨）

1. **7.1 templates.ts** - 定数ファイル作成
2. **7.2 TemplateSelector** - UIコンポーネント
3. **7.3-7.6** - 各テンプレートのサイズ確認（templates.tsで定義済み）
4. **slideStore拡張** - createProject, getTemplateConfig追加
5. **useCanvas修正** - 動的サイズ対応
6. **7.8 Home.tsx統合** - フロー構築
7. **7.7 カスタムサイズ** - TemplateSelector内で対応
8. **7.9 テスト** - 全機能テスト

---

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/constants/templates.ts` | 新規作成: テンプレート定数 |
| `src/components/templates/TemplateSelector.tsx` | 新規作成: テンプレート選択UI |
| `src/types/index.ts` | 既存: TemplateType, TemplateConfig定義済み |
| `src/stores/slideStore.ts` | 拡張: createProject, getTemplateConfig追加 |
| `src/hooks/useCanvas.ts` | 修正: 動的サイズ対応 |
| `src/pages/Home.tsx` | 修正: TemplateSelector統合 |
| `src/pages/Editor.tsx` | 確認: テンプレートサイズ反映 |

---

## 依存関係

```
7.1 (templates.ts)
    ↓
7.2 (TemplateSelector) ← 7.3-7.6 (各テンプレートサイズ)
    ↓
slideStore拡張 + useCanvas修正
    ↓
7.8 (Home.tsx統合)
    ↓
7.7 (カスタムサイズ - TemplateSelector内)
    ↓
7.9 (テスト)
```

---

## 注意事項

1. **DPI一貫性:** すべてのテンプレートで96 DPIを基準とする
2. **アスペクト比維持:** キャンバスリサイズ時はアスペクト比を維持
3. **既存プロジェクト:** テンプレート未設定の既存プロジェクトはデフォルト（16:9）を適用
4. **パフォーマンス:** 大きなキャンバス（A4等）ではレンダリング負荷に注意
5. **レスポンシブ:** Editorでのキャンバス表示はビューポートに収まるようスケーリング

---

## 検証方法

1. **テンプレート選択:** Home画面で各テンプレートを選択し、Editorに遷移
2. **キャンバスサイズ:** Editorでキャンバスサイズが正しく設定されていることを確認
3. **カスタムサイズ:** 任意のサイズを入力し、反映されることを確認
4. **プレビュー:** TemplateSelector内のプレビューがアスペクト比を正しく表示
5. **永続化:** プロジェクト保存・読み込み時にテンプレート情報が維持される
6. **テスト実行:** `npm test` で全テストパス確認
