---
name: code-review
description: "Run code review. Check quality, performance, and security of specified file."
---

# Code Review Skill

## Usage

```
Review this file: src/components/Button.tsx
```

or

```
Review the changes (git diff)
```

## Review Criteria

### 1. Code Quality
- [ ] Functions follow single responsibility principle
- [ ] Appropriate naming (variables, functions, classes)
- [ ] No magic numbers
- [ ] No duplicate code
- [ ] Proper error handling

### 2. Performance
- [ ] No unnecessary re-renders (React)
- [ ] Proper memoization (useMemo, useCallback)
- [ ] No heavy computation blocking main thread
- [ ] Using appropriate data structures

### 3. Security
- [ ] No XSS vulnerabilities
- [ ] No SQL injection risks
- [ ] No hardcoded sensitive data
- [ ] Proper input validation

### 4. Maintainability
- [ ] Testable structure
- [ ] Adequate documentation/comments
- [ ] Clear dependencies

## Output Format

### Template A (Issues Found)

```
# Code Review

## 🚨 Critical Issues (N items)

### 1. [Issue Summary]
File: `path/to/file.ts` Line XX
```code
Problematic code
```

**Fix:**
```code
Fixed code
```

---

## 💡 Suggestions (M items)

### 1. [Suggestion Summary]
File: `path/to/file.ts` Line XX

**Suggestion:**
[Improvement details]

---

Apply fixes?
```

### Template B (No Issues)

```
# Code Review

✅ No issues found.
```

## Review Process

1. Open target file
2. Check each criteria
3. Classify issues by severity
4. Provide fix suggestions
5. Confirm with user
