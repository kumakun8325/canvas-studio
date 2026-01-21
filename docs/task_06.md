# Phase 6: 追加機能 - 実装タスク

## 概要

Phase 6では、キャンバス操作の利便性を向上させる追加機能を実装する。
- 画像追加機能
- クリップボード操作（コピー/ペースト）
- レイヤー操作（前面/背面移動）
- プロパティパネル

## 前提条件

- Phase 1-5 完了済み
- Fabric.js 6.5.4 使用
- Zustand 5.0.0 状態管理
- 既存の useCanvas hook を拡張

---

## タスク一覧

### 6.1 ローカル画像追加機能

**目的:** ローカルファイルから画像をキャンバスに追加

**実装内容:**
1. Toolbar に画像追加ボタン追加
2. ファイル入力コンポーネント（非表示）
3. FileReader で画像データ読み込み
4. `fabric.Image.fromURL()` でキャンバスに追加

**実装場所:**
- `src/hooks/useCanvas.ts` - `addImage()` 関数追加
- `src/components/canvas/Toolbar.tsx` - ボタン追加

**コード例:**
```typescript
const addImage = useCallback((file: File) => {
  const canvas = canvasRef.current
  if (!canvas) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    fabric.Image.fromURL(dataUrl).then((img) => {
      img.set({
        id: crypto.randomUUID(),
        left: 100,
        top: 100,
      })
      img.scaleToWidth(200)
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
      saveCanvasToSlide()
    })
  }
  reader.readAsDataURL(file)
}, [])
```

**UI:**
```tsx
<input
  type="file"
  ref={fileInputRef}
  className="hidden"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0]
    if (file) addImage(file)
  }}
/>
<button onClick={() => fileInputRef.current?.click()}>
  画像追加
</button>
```

**制約:**
- 対応フォーマット: PNG, JPEG, GIF, WebP
- ファイルサイズ上限: 10MB（推奨）

---

### 6.2 URL画像追加機能（任意）

**目的:** URLから画像をキャンバスに追加

**実装内容:**
1. URL入力ダイアログ
2. CORS対応（crossOrigin設定）
3. エラーハンドリング

**コード例:**
```typescript
const addImageFromUrl = useCallback((url: string) => {
  const canvas = canvasRef.current
  if (!canvas) return

  fabric.Image.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
    img.set({
      id: crypto.randomUUID(),
      left: 100,
      top: 100,
    })
    img.scaleToWidth(200)
    canvas.add(img)
    canvas.renderAll()
    saveCanvasToSlide()
  }).catch((err) => {
    console.error('画像読み込みエラー:', err)
    alert('画像を読み込めませんでした')
  })
}, [])
```

---

### 6.3 useClipboard Hook 実装

**目的:** クリップボード操作を統一管理

**実装場所:** `src/hooks/useClipboard.ts`（新規作成）

**インターフェース:**
```typescript
interface ClipboardData {
  objects: object[]  // シリアライズされたオブジェクト
  timestamp: number
}

interface UseClipboardReturn {
  copy: () => void
  paste: () => void
  cut: () => void
  hasClipboardData: boolean
}
```

**実装:**
```typescript
import { useRef, useCallback } from 'react'
import { fabric } from 'fabric'

export function useClipboard(canvasRef: React.RefObject<fabric.Canvas | null>) {
  const clipboardRef = useRef<ClipboardData | null>(null)

  const copy = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length === 0) return

    // オブジェクトをシリアライズして保存
    const serialized = activeObjects.map(obj => obj.toObject(['id']))
    clipboardRef.current = {
      objects: serialized,
      timestamp: Date.now(),
    }
  }, [canvasRef])

  const paste = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !clipboardRef.current) return

    const { objects } = clipboardRef.current

    // オフセットを加えてペースト
    objects.forEach((objData, index) => {
      fabric.util.enlivenObjects([objData]).then(([obj]) => {
        obj.set({
          id: crypto.randomUUID(),
          left: (objData.left || 0) + 20,
          top: (objData.top || 0) + 20,
        })
        canvas.add(obj)
      })
    })

    canvas.renderAll()
  }, [canvasRef])

  const cut = useCallback(() => {
    copy()
    const canvas = canvasRef.current
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    activeObjects.forEach(obj => canvas.remove(obj))
    canvas.discardActiveObject()
    canvas.renderAll()
  }, [copy, canvasRef])

  return {
    copy,
    paste,
    cut,
    hasClipboardData: clipboardRef.current !== null,
  }
}
```

---

### 6.4 コピー機能（Ctrl+C）

**目的:** 選択オブジェクトをクリップボードにコピー

**実装場所:** `src/hooks/useCanvas.ts` または `src/components/canvas/CanvasView.tsx`

**キーボードハンドリング:**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // テキスト編集中は無視
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return

    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault()
      copy()
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [copy])
```

---

### 6.5 ペースト機能（Ctrl+V）

**目的:** クリップボードからオブジェクトを貼り付け

**キーボードハンドリング:**
```typescript
if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
  e.preventDefault()
  paste()
  // 履歴記録
  recordAction({
    type: 'paste',
    description: 'オブジェクトを貼り付け',
    undo: () => { /* 貼り付けたオブジェクトを削除 */ },
    redo: () => { paste() },
  })
}
```

**注意点:**
- ペースト時は元の位置から少しオフセット（+20px）
- 新しいIDを割り当て
- Undo/Redo対応

---

### 6.6 前面に移動機能

**目的:** 選択オブジェクトを最前面に移動

**実装場所:** `src/hooks/useCanvas.ts`

**コード:**
```typescript
const bringToFront = useCallback(() => {
  const canvas = canvasRef.current
  if (!canvas) return

  const active = canvas.getActiveObject()
  if (!active) return

  // 現在の状態を記録
  const prevIndex = canvas.getObjects().indexOf(active)

  canvas.bringToFront(active)
  canvas.renderAll()
  saveCanvasToSlide()

  // 履歴記録
  recordAction({
    type: 'bringToFront',
    description: '前面に移動',
    undo: () => {
      canvas.moveTo(active, prevIndex)
      canvas.renderAll()
    },
    redo: () => {
      canvas.bringToFront(active)
      canvas.renderAll()
    },
  })
}, [])
```

**Fabric.js API:**
- `canvas.bringToFront(obj)` - 最前面
- `canvas.bringForward(obj)` - 1段前面

---

### 6.7 背面に移動機能

**目的:** 選択オブジェクトを最背面に移動

**コード:**
```typescript
const sendToBack = useCallback(() => {
  const canvas = canvasRef.current
  if (!canvas) return

  const active = canvas.getActiveObject()
  if (!active) return

  const prevIndex = canvas.getObjects().indexOf(active)

  canvas.sendToBack(active)
  canvas.renderAll()
  saveCanvasToSlide()

  recordAction({
    type: 'sendToBack',
    description: '背面に移動',
    undo: () => {
      canvas.moveTo(active, prevIndex)
      canvas.renderAll()
    },
    redo: () => {
      canvas.sendToBack(active)
      canvas.renderAll()
    },
  })
}, [])
```

**Fabric.js API:**
- `canvas.sendToBack(obj)` - 最背面
- `canvas.sendBackwards(obj)` - 1段背面

---

### 6.8 グループ化機能（任意）

**目的:** 複数オブジェクトをグループ化

**実装内容:**
1. 複数選択時にグループ化ボタン表示
2. グループ解除機能

**コード:**
```typescript
const groupObjects = useCallback(() => {
  const canvas = canvasRef.current
  if (!canvas) return

  const activeSelection = canvas.getActiveObject()
  if (!(activeSelection instanceof fabric.ActiveSelection)) return

  const group = activeSelection.toGroup()
  group.set({ id: crypto.randomUUID() })
  canvas.renderAll()
  saveCanvasToSlide()
}, [])

const ungroupObjects = useCallback(() => {
  const canvas = canvasRef.current
  if (!canvas) return

  const active = canvas.getActiveObject()
  if (!(active instanceof fabric.Group)) return

  active.toActiveSelection()
  canvas.renderAll()
  saveCanvasToSlide()
}, [])
```

---

### 6.9 PropertyPanel コンポーネント

**目的:** 選択オブジェクトのプロパティを編集

**実装場所:** `src/components/canvas/PropertyPanel.tsx`（新規作成）

**表示プロパティ:**
| プロパティ | 型 | 説明 |
|-----------|------|------|
| left | number | X座標 |
| top | number | Y座標 |
| width | number | 幅 |
| height | number | 高さ |
| angle | number | 回転角度 |
| fill | string | 塗りつぶし色 |
| stroke | string | 線の色 |
| strokeWidth | number | 線の太さ |
| opacity | number | 透明度 (0-1) |

**コンポーネント構造:**
```tsx
interface PropertyPanelProps {
  canvas: fabric.Canvas | null
}

export function PropertyPanel({ canvas }: PropertyPanelProps) {
  const { selectedObjectIds } = useEditorStore()
  const [properties, setProperties] = useState<ObjectProperties | null>(null)

  useEffect(() => {
    if (!canvas || selectedObjectIds.length === 0) {
      setProperties(null)
      return
    }

    const obj = canvas.getActiveObject()
    if (!obj) return

    setProperties({
      left: Math.round(obj.left || 0),
      top: Math.round(obj.top || 0),
      width: Math.round(obj.width || 0),
      height: Math.round(obj.height || 0),
      angle: Math.round(obj.angle || 0),
      fill: obj.fill as string,
      opacity: obj.opacity || 1,
    })
  }, [canvas, selectedObjectIds])

  const updateProperty = (key: string, value: any) => {
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (!obj) return

    obj.set({ [key]: value })
    canvas.renderAll()
  }

  if (!properties) {
    return <div className="p-4 text-gray-500">オブジェクトを選択してください</div>
  }

  return (
    <div className="w-64 p-4 border-l bg-white">
      <h3 className="font-bold mb-4">プロパティ</h3>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600">位置</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={properties.left}
              onChange={(e) => updateProperty('left', Number(e.target.value))}
              className="w-20 border rounded px-2 py-1"
            />
            <input
              type="number"
              value={properties.top}
              onChange={(e) => updateProperty('top', Number(e.target.value))}
              className="w-20 border rounded px-2 py-1"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">サイズ</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={properties.width}
              onChange={(e) => updateProperty('width', Number(e.target.value))}
              className="w-20 border rounded px-2 py-1"
            />
            <input
              type="number"
              value={properties.height}
              onChange={(e) => updateProperty('height', Number(e.target.value))}
              className="w-20 border rounded px-2 py-1"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">回転</label>
          <input
            type="number"
            value={properties.angle}
            onChange={(e) => updateProperty('angle', Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">塗りつぶし</label>
          <input
            type="color"
            value={properties.fill || '#000000'}
            onChange={(e) => updateProperty('fill', e.target.value)}
            className="w-full h-8 border rounded"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">透明度</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={properties.opacity}
            onChange={(e) => updateProperty('opacity', Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
```

**Editor.tsxへの統合:**
```tsx
<div className="flex-1 flex">
  <SlideList />
  <CanvasView canvasActions={canvasActions} />
  <PropertyPanel canvas={canvasRef.current} />
</div>
```

---

### 6.10 テスト: クリップボード・レイヤー操作

**テストファイル:** `src/test/phase6-clipboard-layer.test.tsx`

**テストケース:**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Canvas, Rect } from 'fabric'

describe('Phase 6: クリップボード・レイヤー操作', () => {
  let canvas: Canvas

  beforeEach(() => {
    const element = document.createElement('canvas')
    canvas = new Canvas(element, { width: 800, height: 600 })
  })

  afterEach(() => {
    canvas.dispose()
  })

  describe('6.1 画像追加', () => {
    it('should add image to canvas', async () => {
      // FileReaderのモックが必要
    })
  })

  describe('6.3-6.5 クリップボード操作', () => {
    it('should copy selected object', () => {
      const rect = new Rect({ left: 100, top: 100, width: 50, height: 50 })
      canvas.add(rect)
      canvas.setActiveObject(rect)

      // copy() 実行
      // clipboardRef に保存されることを確認
    })

    it('should paste copied object with offset', () => {
      // paste() 実行
      // 元の位置から +20px オフセットで追加されることを確認
    })

    it('should cut selected object', () => {
      // cut() 実行
      // オブジェクトが削除され、clipboardRef に保存されることを確認
    })
  })

  describe('6.6-6.7 レイヤー操作', () => {
    it('should bring object to front', () => {
      const rect1 = new Rect({ left: 0, top: 0 })
      const rect2 = new Rect({ left: 50, top: 50 })
      canvas.add(rect1, rect2)

      canvas.setActiveObject(rect1)
      canvas.bringToFront(rect1)

      const objects = canvas.getObjects()
      expect(objects[objects.length - 1]).toBe(rect1)
    })

    it('should send object to back', () => {
      const rect1 = new Rect({ left: 0, top: 0 })
      const rect2 = new Rect({ left: 50, top: 50 })
      canvas.add(rect1, rect2)

      canvas.setActiveObject(rect2)
      canvas.sendToBack(rect2)

      const objects = canvas.getObjects()
      expect(objects[0]).toBe(rect2)
    })
  })

  describe('6.8 グループ化', () => {
    it('should group multiple objects', () => {
      // 複数オブジェクト選択 → グループ化
    })

    it('should ungroup grouped objects', () => {
      // グループ解除
    })
  })
})
```

---

## 実装順序（推奨）

1. **6.3 useClipboard Hook** - 他機能の基礎
2. **6.4, 6.5 コピー/ペースト** - useClipboard使用
3. **6.1 ローカル画像追加** - 基本機能
4. **6.6, 6.7 レイヤー操作** - Fabric.js API直接使用
5. **6.9 PropertyPanel** - UI実装
6. **6.2 URL画像追加（任意）** - 画像機能拡張
7. **6.8 グループ化（任意）** - 複雑な機能
8. **6.10 テスト** - 全機能テスト

---

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/hooks/useCanvas.ts` | Canvas操作（拡張対象） |
| `src/hooks/useClipboard.ts` | 新規作成 |
| `src/stores/editorStore.ts` | UI状態管理 |
| `src/stores/historyStore.ts` | Undo/Redo |
| `src/components/canvas/Toolbar.tsx` | ボタン追加 |
| `src/components/canvas/PropertyPanel.tsx` | 新規作成 |
| `src/pages/Editor.tsx` | レイアウト統合 |
| `src/types/index.ts` | 型定義追加 |

---

## 型定義追加（types/index.ts）

```typescript
// クリップボードデータ
export interface ClipboardData {
  objects: object[]
  timestamp: number
}

// プロパティパネル用
export interface ObjectProperties {
  left: number
  top: number
  width: number
  height: number
  angle: number
  fill: string
  stroke?: string
  strokeWidth?: number
  opacity: number
}
```

---

## 注意事項

1. **Undo/Redo対応:** すべての操作で履歴記録を忘れない
2. **テキスト編集中の除外:** Ctrl+C/V はテキスト編集中は無視
3. **ID管理:** ペースト時は新しいIDを割り当て
4. **CORS:** URL画像追加時は `crossOrigin: 'anonymous'` 必須
5. **メモリ管理:** 大きな画像はリサイズを検討

---

## 検証方法

1. **画像追加:** ローカルファイルをドラッグ&ドロップまたはボタンから追加
2. **コピペ:** オブジェクト選択 → Ctrl+C → Ctrl+V でオフセット配置確認
3. **レイヤー:** 複数オブジェクト重なり時に前面/背面移動確認
4. **PropertyPanel:** 選択オブジェクトのプロパティ変更がリアルタイム反映
5. **Undo/Redo:** 各操作後に Ctrl+Z / Ctrl+Y で復元確認
6. **テスト実行:** `npm test` で全テストパス確認
