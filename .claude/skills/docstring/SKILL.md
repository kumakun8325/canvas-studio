---
name: docstring
description: "Auto-generate documentation (docstring/JSDoc/TSDoc) for functions, classes, and modules."
---

# Documentation Generation Skill

## Usage

```
Add documentation to this file: src/utils/helpers.ts
```

or

```
Write JSDoc for this function: calculateTotal
```

## Supported Formats

| Language | Format | Example |
|----------|--------|---------|
| TypeScript | TSDoc/JSDoc | `/** @param ... */` |
| JavaScript | JSDoc | `/** @param ... */` |
| Python | Google/NumPy docstring | `"""..."""` |
| Rust | rustdoc | `/// ...` |

## TSDoc/JSDoc Templates

### Function

```typescript
/**
 * Calculate total amount
 * 
 * @param items - List of items
 * @param taxRate - Tax rate (default: 0.1)
 * @returns Total amount including tax
 * @throws {Error} When items is empty
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

### Class

```typescript
/**
 * Service for managing user authentication
 * 
 * @example
 * ```typescript
 * const auth = new AuthService()
 * await auth.login('user@example.com', 'password')
 * ```
 */
class AuthService {
  /**
   * Log in a user
   * 
   * @param email - Email address
   * @param password - Password
   * @returns Authentication token
   * @throws {AuthError} On authentication failure
   */
  async login(email: string, password: string): Promise<string> {
    // ...
  }
}
```

### React Component

```typescript
/**
 * Button component
 * 
 * @param props - Component properties
 * @param props.variant - Button style ('primary' | 'secondary')
 * @param props.disabled - Disabled state
 * @param props.onClick - Click handler
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={() => console.log('clicked')}>
 *   Submit
 * </Button>
 * ```
 */
export function Button({ variant, disabled, onClick, children }: ButtonProps) {
  // ...
}
```

## Python docstring Template (Google Style)

```python
def calculate_total(items: list[Item], tax_rate: float = 0.1) -> float:
    """Calculate total amount

    Args:
        items: List of items
        tax_rate: Tax rate (default: 0.1)

    Returns:
        Total amount including tax

    Raises:
        ValueError: When items is empty

    Example:
        >>> calculate_total([Item(price=100), Item(price=200)])
        330.0
    """
    pass
```

## Documentation Rules

1. **What it does** in the first line
2. **Parameters** with type and description
3. **Return value** with type and description
4. **Exceptions** if any
5. **Usage example** (for complex cases)

## Output Format

```
# Documentation Added

Added documentation to the following file:

## Changes

- `functionA`: Added parameter and return value docs
- `ClassB`: Added class and all method docs

Apply changes?
```
