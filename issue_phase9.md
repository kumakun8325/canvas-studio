# Phase 9: 名刺用PDF機能実装

## 概要

印刷入稿用の名刺PDFエクスポート機能を実装する。

## 前提条件

- Phase 7（テンプレート）完了
- Phase 8（エクスポート）完了

## 実装タスク

### 9.1 businessCardService 実装

- `src/services/businessCardService.ts` 新規作成
- 定数: BUSINESS_CARD (91x55mm, 塗り足し3mm)
- mmToPixel, mmToPoints 変換関数
- PrintSettings インターフェース

### 9.2 塗り足し設定

- 2mm / 3mm / 5mm 選択
- 塗り足し込みサイズ計算

### 9.3 トンボ描画機能

- drawTrimMarks 関数
- 4コーナーにトンボ線描画

### 9.4 名刺用PDFエクスポート

- generateBusinessCardPDF 関数
- トンボ領域込みのページサイズ
- 画像埋め込み

### 9.5 印刷用PDF設定UI

- `src/components/export/PrintSettingsPanel.tsx` 新規作成
- 塗り足し、トンボ、CMYK、DPI設定
- ブリードプレビュー

## 参考ファイル

- `docs/task_09.md` - 詳細な実装仕様

## 完了条件

- 名刺PDFが塗り足し付きで出力される
- トンボが正しく描画される
- 印刷設定UIが動作する
- テスト作成・成功
- `npm run build` 成功
