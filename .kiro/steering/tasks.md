# 📝 タスク管理

> **Project**: Canvas Studio  
> **Last Updated**: 2026-02-01

---

## 現在のフェーズ: 🎨 仕上げ・デプロイ

---

## 📌 現在のスプリント

### Sprint 5: Phase 10 完了とデプロイ準備 (2026-02-01)

- [x] Phase 1-9 全タスク完了
- [ ] Phase 10: 仕上げ・デプロイ
- [x] GitHub Issue/PR クリーンアップ

---

## 🔨 進行中

なし（全フェーズ完了済み）

---

## ✅ 完了タスク

### Phase 1: プロジェクト初期化

- [x] TASK-001: Vite + React + TypeScript プロジェクト作成
- [x] TASK-002: 依存関係インストール（fabric, zustand, firebase）
- [x] TASK-003: Tailwind CSS v4 設定
- [x] TASK-004: ディレクトリ構成作成
- [x] TASK-005: 型定義ファイル作成（types/index.ts, fabric.d.ts）

### Phase 2: 基本キャンバス

- [x] TASK-006: slideStore 実装
- [x] TASK-007: editorStore 実装
- [x] TASK-008: useCanvas hook 実装（Fabric.js初期化）
- [x] TASK-009: CanvasView コンポーネント実装
- [x] TASK-010: Toolbar コンポーネント実装（四角形/円/テキスト追加）
- [x] TASK-011: オブジェクト選択・移動・リサイズ
- [x] TASK-012: Deleteキー削除
- [x] TASK-013: Editor ページ統合
- [x] TASK-014: テスト: 基本操作の確認
- [x] TASK-015: 直線描画機能 (Line Tool)

### Phase 3: スライド管理

- [x] TASK-016: SlideList コンポーネント実装
- [x] TASK-017: SlideThumb コンポーネント実装（サムネイル生成）
- [x] TASK-018: スライド追加機能
- [x] TASK-019: スライド削除機能
- [x] TASK-020: スライド切り替え機能
- [x] TASK-021: スライドドラッグ並べ替え
- [x] TASK-022: テスト: スライド管理の確認

### Phase 4: Undo/Redo

- [x] TASK-023: historyStore 実装
- [x] TASK-024: useHistory hook 実装
- [x] TASK-025: オブジェクト操作のUndo対応
- [x] TASK-026: スライド操作のUndo対応
- [x] TASK-027: Ctrl+Z / Ctrl+Y キーバインド
- [x] TASK-028: Undo/Redoボタン追加
- [x] TASK-029: テスト: Undo/Redo動作確認
- [x] **Bug Fix**: Issue #35 (Closure Staleness)
- [x] **Bug Fix**: Issue #37 (Logic/Granularity)
- [x] **Bug Fix**: Issue #39 (Test Environment)

### Phase 5: Firebase連携

- [x] TASK-030: Firebase プロジェクト設定
- [x] TASK-031: firebase.ts 初期化ファイル作成
- [x] TASK-032: useAuth hook 実装（Google認証）
- [x] TASK-033: Home ページ（ログイン画面）
- [x] TASK-034: Firestore保存機能
- [x] TASK-035: Firestore読み込み機能
- [x] TASK-036: Firebase Storage 画像アップロード
- [x] TASK-037: 自動保存機能（Debounce）
- [x] TASK-038: セキュリティルール設定
- [x] TASK-039: テスト: 認証・保存フロー確認
- [x] **Bug Fix**: Issue #48 (自動保存初期化)

### Phase 6: 追加機能

- [x] TASK-040: ローカル画像追加機能
- [x] TASK-041: useClipboard hook 実装
- [x] TASK-042: コピー機能（Ctrl+C）
- [x] TASK-043: ペースト機能（Ctrl+V）
- [x] TASK-044: 前面に移動機能
- [x] TASK-045: 背面に移動機能
- [x] TASK-046: PropertyPanel コンポーネント（プロパティ編集）
- [x] TASK-047: テスト: クリップボード・レイヤー操作
- [x] **Bug Fix**: Issue #58 (sendToBack バグ修正・履歴記録追加)

### Phase 7: テンプレート

- [x] TASK-048: templates.ts 定数ファイル作成
- [x] TASK-049: TemplateSelector コンポーネント実装
- [x] TASK-050: 16:9 テンプレート
- [x] TASK-051: A4縦テンプレート
- [x] TASK-052: A4横テンプレート
- [x] TASK-053: 名刺テンプレート
- [x] TASK-054: プロジェクト作成フロー統合
- [x] TASK-055: テスト: テンプレート選択・サイズ確認
- [x] **Bug Fix**: Issue #74 (スライドパネル幅)
- [x] **Bug Fix**: Issue #75 (レイヤー操作ボタンUI)

### Phase 8: エクスポート

- [x] TASK-056: exportService 実装（PNG/JPEG）
- [x] TASK-057: ExportDialog コンポーネント
- [x] TASK-058: PNG エクスポート
- [x] TASK-059: JPEG エクスポート
- [x] TASK-060: PDF エクスポート（pdf-lib）
- [x] TASK-061: cmykService 実装
- [x] TASK-062: CMYKPreview コンポーネント
- [x] TASK-063: CMYK PDF エクスポート
- [x] TASK-064: テスト: エクスポート形式確認
- [x] **Bug Fix**: Issue #87 (ファイル入力リセット)

### Phase 9: 名刺用PDF

- [x] TASK-065: businessCardService 実装
- [x] TASK-066: 塗り足し（3mm）設定
- [x] TASK-067: トンボ描画機能
- [x] TASK-068: 名刺用PDFエクスポート
- [x] TASK-069: 印刷用PDF設定UI
- [x] TASK-070: テスト: 名刺PDF出力確認

### Phase 10: 仕上げ・デプロイ（進行中）

- [x] TASK-071: Home.tsx に TemplateSelector 統合
- [x] TASK-072: プロジェクト選択フロー実装
- [x] TASK-073: ホームに戻る機能実装
- [ ] TASK-074: ダークモード対応
- [ ] TASK-075: レスポンシブ対応
- [ ] TASK-076: ローディング・エラーハンドリング
- [ ] TASK-077: README.md 作成
- [ ] TASK-078: ビルド確認
- [ ] TASK-079: Firebase Hosting デプロイ

---

## 🔮 将来のアイデア

### 機能追加候補

- [ ] **AI-001**: AIデザインアシスタント - Vercel AI SDK統合
  - 自然言語でのキャンバス操作（「青いグラデーションの背景を追加」）
  - デザイン提案・批評機能
  - バッチ処理（「全テキストのフォントを変更」）
  - SVGパス生成（「猫のシルエットを描いて」）
  - 参考: https://ai-sdk.dev/docs/introduction

### 技術的改善

- [ ] ユニットテスト追加
- [ ] E2Eテスト
- [ ] パフォーマンス最適化
- [ ] **AI-002**: Vercel AI SDK基盤構築
  - GLM-4.7 / OpenAI / Claude切り替え対応
  - ストリーミングチャットUI
  - Firebase Functionsでバックエンド
  - 参考: GitHub Copilot SDK (BYOK) も将来検討

---

## 📋 タスクの追加方法

新しいタスクを追加する場合:

1. 該当セクションにタスクを追加
2. 優先度に応じて並び替え
3. 着手時に「進行中」セクションに移動
4. 完了したら「完了タスク」セクションに移動

### タスクフォーマット

```markdown
- [ ] **TASK-XXX**: タスク名 - 簡潔な説明
```

---

## 🏷️ 優先度ガイド

| 優先度 | 基準 |
|--------|------|
| 🔥 高 | MVP必須 / バグ修正 |
| 📌 中 | α版で必要 |
| 💭 低 | β版以降 / あれば嬉しい |

---

*このファイルはプロジェクトのTODOリストとして使用します。*
