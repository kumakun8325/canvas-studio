---
name: refactoring
description: "コードのリファクタリングを提案・実行。関数分割、命名改善、重複排除など。"
---

# リファクタリング スキル

## 使い方

```
このファイルをリファクタリングしてください: src/components/Dashboard.tsx
```

または

```
この関数が長すぎるので分割してください: handleSubmit
```

## リファクタリングパターン

### 1. 関数の抽出（Extract Function）

**Before:**
```typescript
function processOrder(order: Order) {
  // バリデーション（10行）
  if (!order.items.length) throw new Error('Empty order')
  if (!order.customer) throw new Error('No customer')
  // ... more validation
  
  // 計算（10行）
  let total = 0
  for (const item of order.items) {
    total += item.price * item.quantity
  }
  // ... more calculation
  
  // 保存（10行）
  // ...
}
```

**After:**
```typescript
function processOrder(order: Order) {
  validateOrder(order)
  const total = calculateTotal(order)
  await saveOrder(order, total)
}

function validateOrder(order: Order) { /* ... */ }
function calculateTotal(order: Order): number { /* ... */ }
async function saveOrder(order: Order, total: number) { /* ... */ }
```

### 2. 早期リターン（Guard Clause）

**Before:**
```typescript
function getDiscount(user: User) {
  if (user) {
    if (user.isPremium) {
      if (user.years > 5) {
        return 0.3
      } else {
        return 0.2
      }
    } else {
      return 0.1
    }
  }
  return 0
}
```

**After:**
```typescript
function getDiscount(user: User) {
  if (!user) return 0
  if (!user.isPremium) return 0.1
  if (user.years > 5) return 0.3
  return 0.2
}
```

### 3. マジックナンバーの排除

**Before:**
```typescript
if (status === 1) { /* ... */ }
if (retries > 3) { /* ... */ }
```

**After:**
```typescript
const STATUS_ACTIVE = 1
const MAX_RETRIES = 3

if (status === STATUS_ACTIVE) { /* ... */ }
if (retries > MAX_RETRIES) { /* ... */ }
```

### 4. 重複コードの排除（DRY）

**Before:**
```typescript
function createUser(data) {
  const user = { ...data, createdAt: new Date(), updatedAt: new Date() }
  validate(user)
  return db.insert(user)
}

function createProduct(data) {
  const product = { ...data, createdAt: new Date(), updatedAt: new Date() }
  validate(product)
  return db.insert(product)
}
```

**After:**
```typescript
function createEntity<T>(data: T, validate: (entity: T) => void) {
  const entity = { ...data, createdAt: new Date(), updatedAt: new Date() }
  validate(entity)
  return db.insert(entity)
}

const createUser = (data) => createEntity(data, validateUser)
const createProduct = (data) => createEntity(data, validateProduct)
```

### 5. 条件分岐の簡素化

**Before:**
```typescript
let message
if (status === 'success') {
  message = '成功しました'
} else if (status === 'error') {
  message = 'エラーが発生しました'
} else if (status === 'pending') {
  message = '処理中です'
} else {
  message = '不明な状態です'
}
```

**After:**
```typescript
const messages: Record<string, string> = {
  success: '成功しました',
  error: 'エラーが発生しました',
  pending: '処理中です',
}
const message = messages[status] ?? '不明な状態です'
```

## リファクタリングチェックリスト

- [ ] 関数は50行以下か
- [ ] ネストは3レベル以下か
- [ ] 関数のパラメータは4つ以下か
- [ ] 重複コードはないか
- [ ] 命名は意図を表しているか
- [ ] マジックナンバーはないか

## 出力フォーマット

```
# リファクタリング提案

## 問題点

1. `handleSubmit` 関数が80行で長すぎる
2. ネストが4レベル
3. 重複コードあり

## 提案

### 1. 関数を3つに分割
- `validateForm()` - バリデーション
- `submitData()` - API呼び出し
- `handleResponse()` - レスポンス処理

### 2. 早期リターンでネスト削減

変更を適用しますか？
```
