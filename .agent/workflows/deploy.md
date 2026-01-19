---
description: Firebase Hostingへのデプロイ手順
---

# デプロイワークフロー

## 前提条件

- Firebase CLI がインストール済み (`npm install -g firebase-tools`)
- `firebase login` で認証済み
- `firebase init hosting` でプロジェクト設定済み

---

## 本番デプロイ

```bash
# 1. mainブランチに切り替え
git checkout main
git pull origin main

# 2. ビルド
// turbo
npm run build

# 3. Firebase デプロイ
firebase deploy --only hosting
```

---

## プレビューデプロイ

開発中の機能をテストする場合:

```bash
# 1. ビルド
// turbo
npm run build

# 2. プレビューチャンネルにデプロイ（7日間有効）
firebase hosting:channel:deploy preview --expires 7d
```

---

## Vercel デプロイ（代替）

Vercelを使う場合:

```bash
# 1. Vercel CLI をインストール
npm install -g vercel

# 2. デプロイ
vercel

# 本番デプロイ
vercel --prod
```

---

## GitHub Pages デプロイ（代替）

```bash
# 1. ビルド
npm run build

# 2. gh-pages ブランチにデプロイ
npx gh-pages -d dist
```

---

## 注意事項

- 本番デプロイ前に必ずビルドが成功することを確認
- 型チェック (`npm run type-check`) も実行推奨
- 環境変数の設定が必要な場合は `.env` を確認
- **mainブランチからのみ本番デプロイを行う**
