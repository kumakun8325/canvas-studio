---
name: debug
description: "Identify bug causes and suggest fixes. Analyze errors from messages, stack traces, and reproduction steps."
---

# Debug Skill

## Usage

```
Investigate this error:
TypeError: Cannot read property 'map' of undefined
  at Dashboard.tsx:45
```

or

```
Debug this issue:
Nothing happens when clicking the button
```

## Debug Process

### 1. Gather Information

```
📋 Checklist:
- Error message
- Stack trace
- Reproduction steps
- Expected behavior
- Actual behavior
- Related code changes
```

### 2. Hypothesize

```
🔍 Possible causes:
1. [Most likely cause]
2. [Second possibility]
3. [Other possibilities]
```

### 3. Verify and Fix

```
✅ Root cause identified:
[Explanation of cause]

🔧 Fix proposal:
[Specific fix code]
```

## Common Error Patterns

### TypeScript / JavaScript

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot read property 'x' of undefined` | null/undefined access | Optional chaining `?.` |
| `x is not a function` | Type mismatch | typeof check |
| `Maximum call stack exceeded` | Infinite recursion | Check exit condition |
| `Cannot find module` | Path/import error | Verify path |

### React

| Symptom | Cause | Solution |
|---------|-------|----------|
| Infinite loop | useEffect dependencies | Fix dependency array |
| State not updating | Direct mutation | Create new object |
| Event not firing | Binding issue | Use arrow function |
| Child not updating | Missing key | Set unique key |

### Async Operations

| Symptom | Cause | Solution |
|---------|-------|----------|
| Data is undefined | Missing await | Check async/await |
| Race condition | Multiple requests | Use AbortController |
| Memory leak | Missing cleanup | useEffect return |

## Debug Tools

### Browser

```javascript
// Console logging
console.log('value:', value)
console.table(array)
console.trace('call stack')

// Breakpoint
debugger

// Performance measurement
console.time('label')
// ... code
console.timeEnd('label')
```

### React DevTools

```javascript
// Check component re-renders
import { useEffect } from 'react'

useEffect(() => {
  console.log('Component rendered')
})

// Check dependency changes
useEffect(() => {
  console.log('deps changed:', dep1, dep2)
}, [dep1, dep2])
```

### Node.js

```javascript
// Detailed error stack
Error.stackTraceLimit = 50

// Debug mode with env var
DEBUG=app:* node server.js
```

## Output Format

```
# Debug Report

## Error Details
[Error message]

## Analysis

### Investigation
1. [What was investigated]
2. [Where was checked]

### Root Cause
[Identified cause]

## Fix Proposal

### File: `path/to/file.ts` Line XX

**Before:**
```typescript
// Problematic code
```

**After:**
```typescript
// Fixed code
```

### Reason
[Explanation of fix]

---

Apply fix?
```

## Prevention

- [ ] Define strict types
- [ ] Always check for null
- [ ] Implement error handling
- [ ] Write tests
- [ ] Get code review
