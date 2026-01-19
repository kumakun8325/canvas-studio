# CLAUDE.md

## プロジェクト概要

{{PROJECT_NAME}} - {{DESCRIPTION}}

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

- [規約を記載]

## ビルド・テスト

```bash
npm install
npm run dev
npm run build
npm run test
```

## 重要なファイル

| File | Description |
|------|-------------|
| `.kiro/steering/requirements.md` | 要件定義書 |
| `.kiro/steering/design.md` | 設計書 |
| `.kiro/steering/tasks.md` | タスク管理 |
| `docs/handoff.md` | AI間引き継ぎ |
