# Task 06〜09 実装調査レポート

調査日: 2026-01-23

---

## 調査概要

Task 06 から Task 09 までのドキュメントと実装されたソースコードを比較し、期待通りに実装されているかを確認しました。

---

## Task 06: 追加機能 (Phase 6)

### 調査結果: **概ね期待通り** (一部未実装あり)

### 6.1 ローカル画像追加機能 ✅

**ドキュメント要件:**
- Toolbar に画像追加ボタン追加
- ファイル入力コンポーネント（非表示）
- FileReader で画像データ読み込み
- `fabric.Image.fromURL()` でキャンバスに追加

**実装状況:**
- `src/hooks/useCanvas.ts` の `addImage()` 関数: **実装済み** (269-289行目)
- `src/components/canvas/Toolbar.tsx` に画像追加ボタン: **実装済み** (32行目, 100-107行目)
- FileReaderを使用してdataURL形式で読み込み: **実装済み**
- `fabric.FabricImage.fromURL()` を使用: **実装済み** (Fabric.js 6.x の正しいAPI)

**差異:**
- ドキュメントでは `fabric.Image.fromURL()` だが、実装では `fabric.FabricImage.fromURL()` を使用 (Fabric.js 6.x の正しいAPI名)
- `saveCanvasToSlide()` の呼び出しがドキュメント例にはあるが、実装ではイベントハンドラ経由で自動保存される設計

---

### 6.2 URL画像追加機能 ⚠️

**ドキュメント要件:**
- URL入力ダイアログ
- CORS対応（crossOrigin設定）
- エラーハンドリング

**実装状況:**
- **未実装** (ドキュメントで「任意」と記載)

---

### 6.3 useClipboard Hook ✅

**ドキュメント要件:**
- `src/hooks/useClipboard.ts` 新規作成
- copy, paste, cut, hasClipboardData インターフェース

**実装状況:**
- `src/hooks/useClipboard.ts`: **実装済み**
- インターフェース: **ドキュメント通り実装**
- シリアライズとオフセットペースト: **実装済み**

**差異:**
- `hasClipboardData` は関数ではなく `clipboardRef.current !== null` で実装されているが、リアクティブではない（refの値が変わっても再レンダリングされない）

---

### 6.4 コピー機能（Ctrl+C）⚠️

**ドキュメント要件:**
- キーボードショートカット（Ctrl+C）対応
- テキスト編集中は無視

**実装状況:**
- `useClipboard` フック内に `copy()` 関数: **実装済み**
- キーボードショートカット: **未確認** (CanvasView.tsx での統合が必要)

---

### 6.5 ペースト機能（Ctrl+V）⚠️

**ドキュメント要件:**
- キーボードショートカット（Ctrl+V）対応
- オフセット（+20px）
- 新しいID割り当て
- Undo/Redo対応

**実装状況:**
- `paste()` 関数: **実装済み**
- オフセット +20px: **実装済み** (44-45行目)
- 新しいID割り当て: **実装済み** (crypto.randomUUID())
- Undo/Redo: **未実装** (ドキュメントに記載あるが、paste内でrecordActionが呼ばれていない)

---

### 6.6 前面に移動機能 ✅

**ドキュメント要件:**
- `canvas.bringToFront()` を使用
- 履歴記録

**実装状況:**
- `src/hooks/useCanvas.ts` の `bringToFront()`: **実装済み** (292-307行目)
- 手動で `canvas.remove()` + `canvas.add()` で最前面に移動

**差異:**
- ドキュメントでは `canvas.bringToFront(active)` を直接使用とあるが、実装では `remove + add` 方式
- 履歴記録（recordAction）: **未実装**

---

### 6.7 背面に移動機能 ⚠️

**ドキュメント要件:**
- `canvas.sendToBack()` を使用
- 履歴記録

**実装状況:**
- `src/hooks/useCanvas.ts` の `sendToBack()`: **実装済み** (310-326行目)

**差異:**
- ドキュメントでは `canvas.sendToBack(active)` を直接使用とあるが、実装では `remove + unshift` 方式
- **注意**: 現在の実装には問題あり - `objects.unshift(active)` はローカル配列を変更するだけで、キャンバスには反映されない
- 履歴記録（recordAction）: **未実装**

---

### 6.8 グループ化機能 ⚠️

**ドキュメント要件:**
- 複数オブジェクトをグループ化
- グループ解除機能

**実装状況:**
- **未実装** (ドキュメントで「任意」と記載)

---

### 6.9 PropertyPanel コンポーネント ✅

**ドキュメント要件:**
- `src/components/canvas/PropertyPanel.tsx` 新規作成
- 位置、サイズ、回転、塗りつぶし、透明度の編集

**実装状況:**
- `src/components/canvas/PropertyPanel.tsx`: **実装済み**
- 位置 (left, top): **実装済み**
- サイズ (width, height): **実装済み** (scaleXY経由)
- 回転 (angle): **実装済み** (スライダー形式)
- 塗りつぶし (fill): **実装済み** (カラーピッカー + テキスト入力)
- 透明度 (opacity): **実装済み** (スライダー形式)

**差異:**
- stroke, strokeWidth: ドキュメントにあるが実装されていない

---

### 6.10 テスト ✅

**実装状況:**
- `src/test/phase6-clipboard-layer.test.ts`: **実装済み**
- クリップボード操作、レイヤー操作、プロパティパネルのテストが含まれている

---

## Task 07: テンプレート (Phase 7)

### 調査結果: **期待通り実装**

### 7.1 templates.ts 定数ファイル ✅

**ドキュメント要件:**
- `src/constants/templates.ts` 新規作成
- TEMPLATE_CONFIGS, TEMPLATE_LABELS, TEMPLATE_DESCRIPTIONS, TEMPLATE_LIST

**実装状況:**
- すべて **ドキュメント通り実装済み**
- mmToPixel 関数: **実装済み**

---

### 7.2 TemplateSelector コンポーネント ✅

**ドキュメント要件:**
- `src/components/templates/TemplateSelector.tsx` 新規作成
- テンプレート選択UI
- カスタムサイズ入力
- プレビュー表示

**実装状況:**
- **ドキュメント通り実装済み**
- テンプレート一覧表示: ✅
- カスタムサイズ入力フォーム: ✅
- TemplatePreview コンポーネント: ✅

---

### 7.3〜7.6 各テンプレートサイズ ✅

| テンプレート | ドキュメント | 実装 | 結果 |
|------------|------------|------|------|
| 16:9 | 1920 x 1080 px | 1920 x 1080 px | ✅ |
| A4縦 | 794 x 1123 px | 794 x 1123 px | ✅ |
| A4横 | 1123 x 794 px | 1123 x 794 px | ✅ |
| 名刺 | 344 x 208 px | 344 x 208 px | ✅ |
| カスタム | 800 x 600 px | 800 x 600 px | ✅ |

---

### 7.7 カスタムサイズ入力 ✅

**実装状況:**
- 最小100px、最大4096pxの制約: **実装済み** (84-85行目, 95-96行目)

---

### 7.8 プロジェクト作成フロー統合 ⚠️

**ドキュメント要件:**
- Home → TemplateSelector → Editor のフロー

**実装状況:**
- `src/stores/slideStore.ts` に `createProject`, `getTemplateConfig`: **実装済み**
- `src/pages/Home.tsx` には TemplateSelector が統合されていない

**差異:**
- Home.tsx はGoogle認証のみを表示し、TemplateSelector は統合されていない
- テンプレート選択フローが未完成の可能性

---

### 7.9 テスト ✅

**実装状況:**
- `src/test/templates.test.ts`: **実装済み**
- 定数テスト、サイズテスト、mmToPixel計算テストが含まれている

---

## Task 08: エクスポート (Phase 8)

### 調査結果: **概ね期待通り** (一部簡略化)

### 8.1 exportService 実装 ✅

**ドキュメント要件:**
- `src/services/exportService.ts` 新規作成
- exportSlide, downloadBlob, dataURLToBlob

**実装状況:**
- **ドキュメント通り実装済み**

---

### 8.2 ExportDialog コンポーネント ⚠️

**ドキュメント要件:**
- PNG/JPEG/PDF選択
- JPEG品質設定
- PDF出力範囲（現在のスライド/全スライド）
- CMYK変換オプション

**実装状況:**
- PNG/JPEG/PDF選択: ✅
- JPEG品質設定: ✅
- PDF出力範囲: **未実装** (簡略化されている - 「現在のスライドのみ」の説明のみ)
- CMYK変換オプション: **未実装**

---

### 8.3 PNG エクスポート ✅

**実装状況:**
- `exportAsPNG()` 関数: **ドキュメント通り実装済み**

---

### 8.4 JPEG エクスポート ✅

**実装状況:**
- `exportAsJPEG()` 関数: **ドキュメント通り実装済み**
- 品質設定対応: ✅

---

### 8.5 PDF エクスポート ✅

**実装状況:**
- `exportAsPDF()` 関数: **ドキュメント通り実装済み**
- pdf-lib を使用: ✅

---

### 8.6 cmykService 実装 ✅

**ドキュメント要件:**
- `src/services/cmykService.ts` 新規作成
- rgbToCmyk, cmykToRgb, hexToRgb, rgbToHex, formatCmyk

**実装状況:**
- **ドキュメント通り実装済み**

---

### 8.7 CMYKPreview コンポーネント ✅

**ドキュメント要件:**
- `src/components/export/CMYKPreview.tsx` 新規作成

**実装状況:**
- **ドキュメント通り実装済み**

---

### 8.8 CMYK PDF エクスポート ⚠️

**ドキュメント要件:**
- 画像レベルでのCMYK変換

**実装状況:**
- **未実装** (cmykService は存在するが、exportServiceとの統合がない)

---

### 8.9 テスト ✅

**実装状況:**
- `src/test/phase8-export.test.ts`: **実装済み** (詳細なテストケースを含む)

---

## Task 09: 名刺用PDF (Phase 9)

### 調査結果: **期待通り実装**

### 9.1 businessCardService 実装 ✅

**ドキュメント要件:**
- `src/services/businessCardService.ts` 新規作成
- BUSINESS_CARD 定数
- mmToPixel, mmToPoints, calculateCanvasSize, generateBusinessCardPDF

**実装状況:**
- **ドキュメント通り実装済み**
- 入力値検証（bleed < 0 でエラー）も追加されている

---

### 9.2 塗り足し（3mm）設定 ✅

**ドキュメント要件:**
- 2mm, 3mm, 5mm 選択可能

**実装状況:**
- PrintSettingsPanel に塗り足し選択UI: **実装済み** (31-41行目)

---

### 9.3 トンボ描画機能 ✅

**ドキュメント要件:**
- 4隅にトンボを描画

**実装状況:**
- `drawTrimMarks()` 関数: **ドキュメント通り実装済み** (100-171行目)
- 左上、右上、左下、右下の4隅に水平線と垂直線を描画

---

### 9.4 名刺用PDFエクスポート ✅

**ドキュメント要件:**
- generateBusinessCardPDF 関数
- PDFメタデータ設定

**実装状況:**
- **ドキュメント通り実装済み**
- タイトル、Producer、Creator、作成日のメタデータ設定: ✅

---

### 9.5 印刷用PDF設定UI ✅

**ドキュメント要件:**
- `src/components/export/PrintSettingsPanel.tsx` 新規作成
- 塗り足し、トンボ、レジストレーションマーク、CMYK、DPI設定
- BleedPreview コンポーネント

**実装状況:**
- **ドキュメント通り実装済み**
- BleedPreview にトンボ表示も含まれている

---

### 9.6 テスト ✅

**実装状況:**
- `src/test/businessCard.test.ts`: **実装済み**
- 定数テスト、計算テスト、PDF生成テスト、トンボテストが含まれている

---

## 総合評価

| Task | 評価 | 備考 |
|------|-----|------|
| Task 06 | ⚠️ 80% | 任意機能が未実装、sendToBackに実装上の問題あり、履歴記録が未実装 |
| Task 07 | ✅ 90% | Home.tsx へのTemplateSelector統合が未完成 |
| Task 08 | ⚠️ 75% | ExportDialogの全スライドエクスポート、CMYK PDF変換が未実装 |
| Task 09 | ✅ 95% | ほぼ完璧に実装されている |

---

## 推奨アクション

### 優先度: 高
1. **Task 06 sendToBack の修正**: `objects.unshift(active)` はキャンバスに反映されない。Fabric.js の正しいAPIを使用するか、適切な方法で再実装が必要

### 優先度: 中
2. **Task 06 履歴記録の追加**: レイヤー操作（bringToFront, sendToBack）にrecordActionを追加
3. **Task 07 Home.tsx統合**: TemplateSelector をHome.tsx に統合してプロジェクト作成フローを完成
4. **Task 08 CMYK PDFエクスポート**: cmykServiceとexportServiceの統合

### 優先度: 低
5. **Task 06 URL画像追加機能**: 任意機能だが、あると便利
6. **Task 06 グループ化機能**: 任意機能だが、あると便利
7. **Task 08 全スライドPDFエクスポート**: 複数ページPDF出力機能
