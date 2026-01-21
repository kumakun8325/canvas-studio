# Canvas Studio - タスク一覧

## Phase 1: プロジェクト初期化

- [ ] 1.1 Vite + React + TypeScript プロジェクト作成
- [ ] 1.2 依存関係インストール（fabric, zustand, firebase）
- [ ] 1.3 Tailwind CSS v4 設定
- [ ] 1.4 ディレクトリ構成作成
- [ ] 1.5 型定義ファイル作成（types/index.ts, fabric.d.ts）

## Phase 2: 基本キャンバス

- [ ] 2.1 slideStore 実装
- [ ] 2.2 editorStore 実装
- [ ] 2.3 useCanvas hook 実装（Fabric.js初期化）
- [ ] 2.4 CanvasView コンポーネント実装
- [ ] 2.5 Toolbar コンポーネント実装（四角形/円/テキスト追加）
- [ ] 2.6 オブジェクト選択・移動・リサイズ
- [ ] 2.7 Deleteキー削除
- [ ] 2.8 Editor ページ統合
- [ ] 2.9 テスト: 基本操作の確認
- [ ] 2.10 直線描画機能 (Line Tool)

## Phase 3: スライド管理

- [ ] 3.1 SlideList コンポーネント実装
- [ ] 3.2 SlideThumb コンポーネント実装（サムネイル生成）
- [ ] 3.3 スライド追加機能
- [ ] 3.4 スライド削除機能
- [ ] 3.5 スライド切り替え機能
- [ ] 3.6 スライドドラッグ並べ替え
- [ ] 3.7 テスト: スライド管理の確認

## Phase 4: Undo/Redo（pdfeditor参考）

- [x] 4.1 historyStore 実装
- [x] 4.2 useHistory hook 実装
- [x] 4.3 オブジェクト操作のUndo対応
- [x] 4.4 スライド操作のUndo対応
- [x] 4.5 Ctrl+Z / Ctrl+Y キーバインド
- [x] 4.6 Undo/Redoボタン追加
- [x] 4.7 テスト: Undo/Redo動作確認
- [x] **Bug Fix**: Issue #35 (Closure Staleness)
- [x] **Bug Fix**: Issue #37 (Logic/Granularity)
- [x] **Bug Fix**: Issue #39 (Test Environment)

## Phase 5: Firebase連携

- [ ] 5.1 Firebase プロジェクト設定
- [ ] 5.2 firebase.ts 初期化ファイル作成
- [ ] 5.3 useAuth hook 実装（Google認証）
- [ ] 5.4 Home ページ（ログイン画面）
- [ ] 5.5 Firestore保存機能
- [ ] 5.6 Firestore読み込み機能
- [ ] 5.7 Firebase Storage 画像アップロード
- [ ] 5.8 自動保存機能（Debounce）
- [ ] 5.9 セキュリティルール設定
- [ ] 5.10 テスト: 認証・保存フロー確認

## Phase 6: 追加機能

- [ ] 6.1 ローカル画像追加機能
- [ ] 6.2 URL画像追加機能（任意）
- [ ] 6.3 useClipboard hook 実装
- [ ] 6.4 コピー機能（Ctrl+C）
- [ ] 6.5 ペースト機能（Ctrl+V）
- [ ] 6.6 前面に移動機能
- [ ] 6.7 背面に移動機能
- [ ] 6.8 グループ化機能（任意）
- [ ] 6.9 PropertyPanel コンポーネント（プロパティ編集）
- [ ] 6.10 テスト: クリップボード・レイヤー操作

## Phase 7: テンプレート

- [ ] 7.1 templates.ts 定数ファイル作成
- [ ] 7.2 TemplateSelector コンポーネント実装
- [ ] 7.3 16:9 テンプレート
- [ ] 7.4 A4縦テンプレート
- [ ] 7.5 A4横テンプレート
- [ ] 7.6 名刺テンプレート
- [ ] 7.7 カスタムサイズ入力（任意）
- [ ] 7.8 プロジェクト作成フロー統合
- [ ] 7.9 テスト: テンプレート選択・サイズ確認

## Phase 8: エクスポート

- [ ] 8.1 exportService 実装（PNG/JPEG）
- [ ] 8.2 ExportDialog コンポーネント
- [ ] 8.3 PNG エクスポート
- [ ] 8.4 JPEG エクスポート
- [ ] 8.5 PDF エクスポート（pdf-lib）
- [ ] 8.6 cmykService 実装（pdfeditor参考）
- [ ] 8.7 CMYKPreview コンポーネント
- [ ] 8.8 CMYK PDF エクスポート
- [ ] 8.9 テスト: エクスポート形式確認

## Phase 9: 名刺用PDF

- [ ] 9.1 businessCardService 実装
- [ ] 9.2 塗り足し（3mm）設定
- [ ] 9.3 トンボ描画機能
- [ ] 9.4 名刺用PDFエクスポート
- [ ] 9.5 印刷用PDF設定UI
- [ ] 9.6 テスト: 名刺PDF出力確認

## Phase 10: 仕上げ・デプロイ

- [ ] 10.1 ダークモード対応
- [ ] 10.2 レスポンシブ対応
- [ ] 10.3 ローディング・エラーハンドリング
- [ ] 10.4 README.md 作成
- [ ] 10.5 ビルド確認
- [ ] 10.6 Firebase Hosting デプロイ

---

## タスク依存関係

```
Phase 1 → Phase 2 → Phase 3 → Phase 4
                 ↓           ↓
              Phase 5 ← ← ← ←
                 ↓
              Phase 6 → Phase 7 → Phase 8 → Phase 9
                                              ↓
                                          Phase 10
```

---

## 優先度

| 優先度 | タスク    | 理由                       |
| ------ | --------- | -------------------------- |
| 高     | Phase 1-3 | 基本機能、動作確認に必須   |
| 高     | Phase 4   | UX向上に必須               |
| 中     | Phase 5   | 認証・保存は後から追加可能 |
| 中     | Phase 6-7 | 追加機能                   |
| 高     | Phase 8-9 | コア機能（エクスポート）   |
| 低     | Phase 10  | 仕上げ                     |

---

## マルチエージェント開発向けタスク分割案

### Worker 1（基盤担当）

- Phase 1: プロジェクト初期化
- Phase 2: 基本キャンバス

### Worker 2（機能担当）

- Phase 3: スライド管理
- Phase 4: Undo/Redo

### Worker 3（バックエンド担当）

- Phase 5: Firebase連携

### Worker 4（エクスポート担当）

- Phase 8: エクスポート
- Phase 9: 名刺用PDF

### GitHub Actions

- Phase 10: デプロイ
- バグ修正対応
