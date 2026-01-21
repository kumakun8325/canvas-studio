@claude

## バグ報告

ログイン後、プロジェクトが作成・読み込みされないため、自動保存が動作しません。

### 現象

- ログインは成功する
- ツールバーに保存ステータスが表示されない
- ブラウザをリロードすると描画内容が消える

### 原因

- useAutoSave(project) で project が null のため、自動保存が無効
- ログイン後にプロジェクトを作成/読み込みする処理がない

## 修正要件

### 1. Editor.tsx の修正

ログイン後、以下のフローを実装:

1. Firestoreから既存プロジェクトを取得 (listProjects)
2. プロジェクトがあれば最新のものをロード
3. なければ新規プロジェクトを作成 (createNewProject)

### 2. スライドストアとの連携

- ロードしたプロジェクトを slideStore.setProject() で設定
- スライドデータも同時に復元

### 参考ファイル

- src/pages/Editor.tsx
- src/services/projectService.ts (listProjects, createNewProject, loadProject)
- src/stores/slideStore.ts (setProject)
- src/hooks/useAuth.ts (user取得用)

## 完了条件

- ログイン後、自動的にプロジェクトが作成/読み込みされる
- ツールバーに保存ステータスが表示される
- リロード後も描画内容が保持される
- npm run build, npm run test が成功
