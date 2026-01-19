---
name: refactoring
description: "Suggest and execute code refactoring. Function extraction, naming improvements, duplicate removal, etc."
---

# Refactoring Skill

## Usage

```
Refactor this file: src/components/Dashboard.tsx
```

or

```
This function is too long, please split it: handleSubmit
```

## Refactoring Patterns

### 1. Extract Function

**Before:**
```typescript
function processOrder(order: Order) {
  // Validation (10 lines)
  if (!order.items.length) throw new Error('Empty order')
  if (!order.customer) throw new Error('No customer')
  // ... more validation
  
  // Calculation (10 lines)
  let total = 0
  for (const item of order.items) {
    total += item.price * item.quantity
  }
  // ... more calculation
  
  // Save (10 lines)
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

### 2. Guard Clause (Early Return)

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

### 3. Eliminate Magic Numbers

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

### 4. Remove Duplicate Code (DRY)

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

### 5. Simplify Conditionals

**Before:**
```typescript
let message
if (status === 'success') {
  message = 'Success'
} else if (status === 'error') {
  message = 'An error occurred'
} else if (status === 'pending') {
  message = 'Processing'
} else {
  message = 'Unknown status'
}
```

**After:**
```typescript
const messages: Record<string, string> = {
  success: 'Success',
  error: 'An error occurred',
  pending: 'Processing',
}
const message = messages[status] ?? 'Unknown status'
```

## Refactoring Checklist

- [ ] Functions are under 50 lines
- [ ] Nesting is 3 levels or less
- [ ] Function parameters are 4 or fewer
- [ ] No duplicate code
- [ ] Names express intent
- [ ] No magic numbers

## Output Format

```
# Refactoring Proposal

## Issues Found

1. `handleSubmit` function is 80 lines - too long
2. 4 levels of nesting
3. Duplicate code found

## Proposals

### 1. Split function into 3
- `validateForm()` - Validation
- `submitData()` - API call
- `handleResponse()` - Response handling

### 2. Reduce nesting with early returns

Apply changes?
```
