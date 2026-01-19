# GitHub Project 連携ガイド

Issue作成時に自動でProjectに追加し、進捗を一元管理します。

---

## 🚀 クイックセットアップ

### 1. GitHub Projectを作成

1. GitHub → Projects → New project
2. **Board** テンプレートを選択
3. 以下の列を作成:
   - 📋 **Backlog** - 未着手
   - 🔍 **Planning** - Antigravity設計中
   - 🛠️ **In Progress** - Claude Code実装中
   - 👀 **Review** - 検証待ち
   - ✅ **Done** - 完了

### 2. Project URLを取得

Project ページのURLをコピー:
```
https://github.com/users/YOUR_USERNAME/projects/1
```

### 3. Personal Access Token (PAT) を作成

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. **Generate new token**
3. 権限:
   - **Repository access**: 対象リポジトリを選択
   - **Permissions**:
     - Issues: Read and write
     - Pull requests: Read and write
     - Projects: Read and write
4. トークンをコピー

### 4. リポジトリに設定を追加

**Settings → Secrets and variables → Actions**

**Secrets:**
| 名前 | 値 |
|------|-----|
| `ADD_TO_PROJECT_PAT` | 作成したPAT |

**Variables:**
| 名前 | 値 |
|------|-----|
| `PROJECT_URL` | プロジェクトURL |

---

## 📋 使い方

### 自動連携

| トリガー | アクション |
|----------|-----------|
| Issue作成 | 自動でProjectに追加 |
| Issue にラベル追加 | ステータス更新 |
| PR作成 | 自動でProjectに追加 |
| PRマージ | Issueに `done` ラベル |

### ラベルとステータスの対応

| ラベル | Projectステータス |
|--------|------------------|
| `planning` | Planning |
| `in-progress` | In Progress |
| `ready-for-review` | Review |
| `done` | Done |

---

## 🔄 ワークフローとの連携

```
/plan
  ↓ Issue作成 → 自動でProjectに追加（Backlog）
  ↓ ラベル: planning → Planning列に移動

/start
  ↓ ラベル: in-progress → In Progress列に移動

/finish
  ↓ PR作成 → 自動でProjectに追加
  ↓ ラベル: ready-for-review → Review列に移動

/verify (PASS)
  ↓ PRマージ → ラベル: done → Done列に移動
```

---

## 📊 Projectビューの活用

### カンバンビュー
- ドラッグ&ドロップでステータス変更
- 担当者でフィルタリング

### テーブルビュー
- カスタムフィールド追加（優先度、見積もりなど）
- ソート/グループ化

### タイムラインビュー
- スプリント計画
- 期限管理

---

## ⚠️ 注意事項

- PAT の有効期限を確認（90日など）
- Projectは公開/非公開を選択可能
- 複数リポジトリを1つのProjectで管理可能
