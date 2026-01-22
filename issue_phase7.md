# Phase 7: テンプレート機能実装

## 概要

プロジェクト作成時にキャンバスサイズを選択できるテンプレート機能を実装する。

## 実装タスク

### 7.1 templates.ts 定数ファイル

- `src/constants/templates.ts` 新規作成
- TEMPLATE_CONFIGS: 16:9, A4縦/横, 名刺, カスタムの設定
- TEMPLATE_LABELS, TEMPLATE_DESCRIPTIONS

### 7.2 TemplateSelector コンポーネント

- `src/components/templates/TemplateSelector.tsx` 新規作成
- テンプレート選択UI（グリッド表示）
- カスタムサイズ入力
- プレビュー表示

### テンプレートサイズ

- 16:9: 1920 x 1080 px
- A4縦: 794 x 1123 px (210 x 297 mm @ 96DPI)
- A4横: 1123 x 794 px
- 名刺: 344 x 208 px (91 x 55 mm @ 96DPI)

### 7.8 プロジェクト作成フロー統合

- `src/stores/slideStore.ts` に createProject, getTemplateConfig 追加
- `src/hooks/useCanvas.ts` で動的サイズ対応
- Home.tsx に TemplateSelector 統合

## 参考ファイル

- `docs/task_07.md` - 詳細な実装仕様

## 完了条件

- テンプレート選択UIが動作する
- 各テンプレートでキャンバスサイズが正しく設定される
- カスタムサイズ入力が動作する
- テスト作成・成功
- `npm run build` 成功
