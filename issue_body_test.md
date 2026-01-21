## バグ内容

テスト実行時に `TypeError: Cannot read properties of null (reading 'scale')` が発生する。
JSDOM環境でFabric.jsを動かす場合、`canvas` (node-canvas) パッケージが必要だが未インストールである。

## 解決策

`npm install -D canvas` を実行し、環境を整える。
