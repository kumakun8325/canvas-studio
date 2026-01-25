# Git Rules

## Commit Message Format

```
<type>: <subject>

<body (optional)>

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactoring (no behavior change) |
| `test` | Adding/updating tests |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `chore` | Build, config, dependencies |
| `perf` | Performance improvement |

### Subject Guidelines

- Use imperative mood: "add" not "added" or "adds"
- No period at the end
- Max 50 characters
- Lowercase first letter

### Examples

```
feat: add export to PDF functionality

fix: correct canvas zoom calculation on resize

refactor: extract canvas utilities to separate module

test: add unit tests for exportService
```

## Branch Naming

```
<type>/<issue-number>-<short-description>
```

### Examples

```
feat/42-pdf-export
fix/123-zoom-bug
refactor/89-canvas-utils
```

## Pull Request Guidelines

### Title

Same format as commit message subject:
```
feat: add export to PDF functionality
```

### Description Template

```markdown
## Summary
- Brief description of changes
- Why these changes were made

## Test plan
- [ ] Unit tests pass
- [ ] Manual testing steps

## Related
- Closes #42
```

## Workflow

1. Create branch from `main`
2. Make atomic commits (one logical change per commit)
3. Push and create PR
4. Request review
5. Squash merge to main

## Protected Patterns

### Never Do

- Force push to `main`
- Commit directly to `main`
- Commit sensitive data (.env, credentials)
- Commit large binaries

### Always Do

- Pull before push
- Run tests before commit
- Review diff before commit
