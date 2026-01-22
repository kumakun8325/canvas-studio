# Phase 6: 追加機能実装

## 概要

キャンバス操作の利便性を向上させる追加機能を実装する。

## 実装タスク

### 6.1 画像追加機能

- `src/hooks/useCanvas.ts` に `addImage()` 関数追加
- `src/components/canvas/Toolbar.tsx` に画像追加ボタン追加
- FileReader で画像データ読み込み → `fabric.Image.fromURL()` でキャンバスに追加

### 6.3-6.5 クリップボード操作

- `src/hooks/useClipboard.ts` 新規作成
- copy/paste/cut 関数実装
- Ctrl+C/V/X キーボードショートカット対応

### 6.6-6.7 レイヤー操作

- `bringToFront()` / `sendToBack()` 関数追加
- Fabric.js の `canvas.bringToFront()` / `canvas.sendToBack()` 使用

### 6.9 PropertyPanel

- `src/components/canvas/PropertyPanel.tsx` 新規作成
- 位置、サイズ、回転、色、透明度の編集UI

## 参考ファイル

- `docs/task_06.md` - 詳細な実装仕様

## 完了条件

- 画像追加機能が動作する
- Ctrl+C/V でコピペが動作する
- 前面/背面移動が動作する
- PropertyPanel で選択オブジェクトのプロパティが編集できる
- テスト作成・成功
- `npm run build` 成功
