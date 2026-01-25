# CLAUDE.md

## プロジェクト概要

Canvas Studio - Fabric.jsを使用したブラウザベースのデザインアプリケーション

### 技術スタック

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Canvas | Fabric.js 6.x |
| State | Zustand |
| Styling | Tailwind CSS 4 |
| Backend | Firebase |
| Testing | Vitest + Testing Library |

## 開発ワークフロー

このプロジェクトはSDD（仕様駆動開発）+ 2AI分業体制で開発します。

### SDD: 仕様駆動開発

1. `/sdd interview` - 対話的ヒアリング
2. `/sdd req` - 要件定義
3. `/sdd design` - 設計
4. `/sdd tasks` - タスク分解
5. `/sdd impl` - 実装

### 2AI分業

| Role | Tool | Commands |
|------|------|----------|
| **Antigravity** | 調査・設計・検証 | `/plan`, `/verify` |
| **Claude Code** | 実装 | `/start`, `/finish`, `/review` |

### 開発フロー

```
/sdd interview → /sdd req → /sdd design → /plan → /start → /finish → /verify
```

1. Antigravity: `/sdd interview` で対話的ヒアリング
2. Antigravity: `/sdd req` で要件定義を確定
3. Antigravity: `/sdd design` で設計を確定
4. Antigravity: `/plan` でタスク計画・GitHub Issue作成
5. Claude Code: `/start` で実装開始
6. Claude Code: `/finish` で実装完了・PR作成
7. Antigravity: `/verify` で検証・デプロイ

## コーディング規約

### TypeScript

- strict mode有効
- `any`禁止、必ず型定義
- 型は`types/`に集約

### React

- Functional Components + Hooks のみ
- カスタムフックは`hooks/`に配置
- コンポーネントは1ファイル1エクスポート

### 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| 変数・関数 | camelCase | `canvasWidth`, `handleClick` |
| コンポーネント | PascalCase | `ToolBar`, `CanvasEditor` |
| 型・インターフェース | PascalCase | `CanvasObject`, `ExportOptions` |
| 定数 | UPPER_SNAKE_CASE | `DEFAULT_WIDTH`, `MAX_ZOOM` |
| ファイル (コンポーネント) | PascalCase | `ToolBar.tsx` |
| ファイル (その他) | camelCase | `useCanvas.ts`, `exportService.ts` |

### インポート順序

```typescript
// 1. React
import { useState, useEffect } from 'react'

// 2. 外部ライブラリ
import { fabric } from 'fabric'

// 3. 内部モジュール (絶対パス)
import { useCanvasStore } from '@/stores/canvasStore'

// 4. 相対パス
import { Button } from './Button'
```

## ビルド・テスト

```bash
npm install       # 依存インストール
npm run dev       # 開発サーバー起動
npm run build     # プロダクションビルド
npm run test      # テスト実行 (watch mode)
npm run test:run  # テスト実行 (single run)
npm run test:coverage  # カバレッジ付きテスト
npm run lint      # ESLint実行
```

## ディレクトリ構造

```
src/
├── components/   # UIコンポーネント
├── constants/    # 定数定義
├── hooks/        # カスタムフック
├── lib/          # ユーティリティ
├── pages/        # ページコンポーネント
├── services/     # ビジネスロジック
├── stores/       # Zustand stores
├── test/         # テストユーティリティ
└── types/        # 型定義
```

## 重要なファイル

| File | Description |
|------|-------------|
| `.kiro/steering/requirements.md` | 要件定義書 |
| `.kiro/steering/design.md` | 設計書 |
| `.kiro/steering/tasks.md` | タスク管理 |
| `docs/handoff.md` | AI間引き継ぎ |
| `.claude/rules/` | コーディングルール |
| `.claude/memory/` | セッション記憶 |
