---
name: docstring
description: "関数・クラス・モジュールにドキュメント（docstring/JSDoc/TSDoc）を自動生成。"
---

# ドキュメント生成 スキル

## 使い方

```
このファイルにドキュメントを追加してください: src/utils/helpers.ts
```

または

```
この関数のJSDocを書いてください: calculateTotal
```

## 対応フォーマット

| 言語 | フォーマット | 例 |
|------|-------------|-----|
| TypeScript | TSDoc/JSDoc | `/** @param ... */` |
| JavaScript | JSDoc | `/** @param ... */` |
| Python | Google/NumPy docstring | `"""..."""` |
| Rust | rustdoc | `/// ...` |

## TSDoc/JSDoc テンプレート

### 関数

```typescript
/**
 * 合計金額を計算する
 * 
 * @param items - 商品リスト
 * @param taxRate - 税率（デフォルト: 0.1）
 * @returns 税込み合計金額
 * @throws {Error} itemsが空の場合
 * 
 * @example
 * ```typescript
 * const total = calculateTotal([{ price: 100 }, { price: 200 }])
 * // => 330
 * ```
 */
function calculateTotal(items: Item[], taxRate = 0.1): number {
  // ...
}
```

### クラス

```typescript
/**
 * ユーザー認証を管理するサービス
 * 
 * @example
 * ```typescript
 * const auth = new AuthService()
 * await auth.login('user@example.com', 'password')
 * ```
 */
class AuthService {
  /**
   * ユーザーをログインさせる
   * 
   * @param email - メールアドレス
   * @param password - パスワード
   * @returns 認証トークン
   * @throws {AuthError} 認証失敗時
   */
  async login(email: string, password: string): Promise<string> {
    // ...
  }
}
```

### React コンポーネント

```typescript
/**
 * ボタンコンポーネント
 * 
 * @param props - コンポーネントのプロパティ
 * @param props.variant - ボタンのスタイル（'primary' | 'secondary'）
 * @param props.disabled - 無効状態
 * @param props.onClick - クリックハンドラ
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={() => console.log('clicked')}>
 *   送信
 * </Button>
 * ```
 */
export function Button({ variant, disabled, onClick, children }: ButtonProps) {
  // ...
}
```

## Python docstring テンプレート（Google Style）

```python
def calculate_total(items: list[Item], tax_rate: float = 0.1) -> float:
    """合計金額を計算する

    Args:
        items: 商品リスト
        tax_rate: 税率（デフォルト: 0.1）

    Returns:
        税込み合計金額

    Raises:
        ValueError: itemsが空の場合

    Example:
        >>> calculate_total([Item(price=100), Item(price=200)])
        330.0
    """
    pass
```

## ドキュメント生成ルール

1. **何をするか**を最初の1行で説明
2. **パラメータ**の型と説明を記載
3. **戻り値**の型と説明を記載
4. **例外**がある場合は記載
5. **使用例**を含める（複雑な場合）

## 出力フォーマット

```
# ドキュメント追加

以下のファイルにドキュメントを追加しました:

## 変更内容

- `functionA`: パラメータと戻り値のドキュメントを追加
- `ClassB`: クラスと全メソッドのドキュメントを追加

変更を適用しますか？
```
