# Phase 8: エクスポート機能実装

## 概要

キャンバスの内容を各種形式でエクスポートする機能を実装する。

## 実装タスク

### 8.1 exportService 実装

- `src/services/exportService.ts` 新規作成
- PNG/JPEG/PDF エクスポート
- dataURLToBlob, downloadBlob 関数

### 8.2 ExportDialog コンポーネント

- `src/components/export/ExportDialog.tsx` 新規作成
- フォーマット選択（PNG/JPEG/PDF）
- JPEG品質設定
- PDF出力範囲（現在/全スライド）

### 8.3-8.4 PNG/JPEG エクスポート

- `canvas.toDataURL()` 使用
- PNG: ロスレス、透明対応
- JPEG: 品質設定可能（0-100%）

### 8.5 PDF エクスポート（pdf-lib）

- pdf-lib で複数ページPDF生成
- 各スライドを画像として埋め込み

### 8.6-8.8 CMYK対応

- `src/services/cmykService.ts` 新規作成
- RGB → CMYK 変換
- CMYKPreview コンポーネント

## 参考ファイル

- `docs/task_08.md` - 詳細な実装仕様

## 完了条件

- PNG/JPEG/PDF エクスポートが動作する
- ExportDialog UIが動作する
- CMYK変換が動作する
- テスト作成・成功
- `npm run build` 成功
