# Canvas Studio

Fabric.js を使用したブラウザベースのデザインアプリケーション。Canva ライクなスライド/デザインエディタを Web アプリとして提供します。

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | React 19 + TypeScript |
| ビルドツール | Vite |
| キャンバス | Fabric.js 6.x |
| 状態管理 | Zustand 5 |
| スタイリング | Tailwind CSS 4 |
| バックエンド | Firebase (Auth / Firestore / Storage) |
| テスト | Vitest + Testing Library |
| PDF生成 | pdf-lib |

## 主な機能

### Phase 1: 基本キャンバス
- 白紙キャンバスの表示
- 図形追加（四角形・円）
- テキスト追加
- オブジェクトの選択・移動・リサイズ・削除

### Phase 2: スライド管理
- スライド一覧・サムネイル表示
- スライドの追加・削除・切り替え
- ドラッグによる並べ替え

### Phase 3: Undo/Redo
- Ctrl+Z / Ctrl+Y によるUndo/Redo
- オブジェクト操作・スライド操作の履歴管理

### Phase 4: Firebase連携
- Google アカウントログイン
- プロジェクトの保存・読み込み（Firestore）
- 画像アップロード（Firebase Storage）
- 自動保存

### Phase 5: 追加機能
- 画像のキャンバス追加
- コピー＆ペースト（Ctrl+C / Ctrl+V）
- オブジェクトの前面・背面移動
- グループ化・グループ解除

### Phase 6: テンプレート
- 16:9（1920x1080）プレゼン用
- A4 縦/横（300dpi）
- 名刺サイズ（91x55mm）
- カスタムサイズ

### Phase 7: エクスポート
- PNG / JPEG / PDF エクスポート
- CMYK変換PDF
- 名刺用PDF（トンボ・塗り足し対応）

## セットアップ

```bash
# 依存インストール
npm install

# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build
```

## 開発コマンド

```bash
npm run dev           # 開発サーバー起動
npm run build         # プロダクションビルド
npm run lint          # ESLint実行
npm run test          # テスト実行 (watch mode)
npm run test:run      # テスト実行 (single run)
npm run test:coverage # カバレッジ付きテスト
```

## ディレクトリ構造

```
src/
├── components/       # UIコンポーネント
│   ├── canvas/       #   キャンバス関連 (CanvasView, Toolbar, PropertyPanel)
│   ├── slides/       #   スライド関連 (SlideList, SlideThumb)
│   ├── export/       #   エクスポート関連 (ExportDialog, CMYKPreview)
│   ├── templates/    #   テンプレート選択
│   └── ui/           #   共通UI (Button, Modal, Toast)
├── hooks/            # カスタムフック (useCanvas, useAuth, useHistory 等)
├── stores/           # Zustand stores (slideStore, editorStore, historyStore)
├── services/         # ビジネスロジック (exportService, cmykService 等)
├── types/            # 型定義
├── lib/              # ユーティリティ (Firebase設定 等)
├── pages/            # ページコンポーネント (Editor, Home)
├── constants/        # 定数定義 (テンプレート設定 等)
└── test/             # テストユーティリティ
```

## アーキテクチャ

```
┌─────────────────────────────────────────────────┐
│                  React App                       │
├─────────┬──────────────┬────────────────────────┤
│ Toolbar │  SlideList   │      CanvasView        │
│         │  (Sidebar)   │      (Fabric.js)       │
├─────────┴──────────────┴────────────────────────┤
│               Zustand Stores                     │
│  slideStore  │  editorStore  │  historyStore     │
├──────────────┴───────────────┴──────────────────┤
│               Custom Hooks                       │
│  useCanvas  │  useAuth  │  useExport  │ ...      │
├─────────────┴───────────┴─────────────┴─────────┤
│             Firebase Services                    │
│  Auth  │  Firestore  │  Storage                  │
└────────┴─────────────┴──────────────────────────┘
```

## 開発ワークフロー

SDD（仕様駆動開発）+ マルチAI分業体制で開発しています。

| Phase | 内容 | モデル |
|-------|------|--------|
| 設計 | 要件定義・アーキテクチャ | Opus / GPT-5.2-Codex / Sonnet |
| 実装 | `/dispatch` による並列実装 | GLM-4.7 (GitHub Actions) |
| レビュー | 自動コードレビュー | GPT-5.2-Codex (GitHub Actions) |
| 最終確認 | マージ判断 | Sonnet |

詳細は [CLAUDE.md](./CLAUDE.md) を参照してください。

## 関連ドキュメント

| ファイル | 内容 |
|----------|------|
| `.kiro/steering/requirements.md` | 要件定義書 |
| `.kiro/steering/design.md` | 設計書 |
| `.kiro/steering/tasks.md` | タスク管理 |
| `docs/handoff.md` | AI間引き継ぎドキュメント |
| `CLAUDE.md` | Claude Code設定・開発ワークフロー |

## ライセンス

MIT License
