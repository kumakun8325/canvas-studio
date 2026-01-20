---
description: "Start TDD workflow: RED → GREEN → REFACTOR with 80%+ coverage"
---

# TDD Command

Execute Test-Driven Development workflow using the tdd-guide agent.

## Usage

```
/tdd Implement user authentication
/tdd Add validation for email field
/tdd Fix bug in calculation (write test first)
```

## What This Command Does

1. **Understand the requirement** from the Issue or user input
2. **Define interfaces/types** for the feature
3. **Write failing tests** (RED phase)
4. **Run tests** and verify they FAIL
5. **Implement minimal code** (GREEN phase)
6. **Run tests** and verify they PASS
7. **Refactor** the code (REFACTOR phase)
8. **Check coverage** - must be 80%+

## TDD Cycle

```
┌─────────────────────────────────────────┐
│                                         │
│   RED → GREEN → REFACTOR → REPEAT       │
│                                         │
│   RED:      Write a failing test        │
│   GREEN:    Write minimal code to pass  │
│   REFACTOR: Improve code, keep green    │
│                                         │
└─────────────────────────────────────────┘
```

## When to Use

Use `/tdd` when:

- ✅ Implementing new features
- ✅ Adding new functions/components
- ✅ Fixing bugs (write test that reproduces bug first)
- ✅ Refactoring existing code
- ✅ Building critical business logic

## Coverage Targets

| Metric | Target |
|--------|--------|
| Line | 80%+ |
| Branch | 70%+ |
| Function | 90%+ |

## Best Practices

**DO:**
- ✅ Write the test FIRST, before any implementation
- ✅ Run tests and verify they FAIL before implementing
- ✅ Write minimal code to make tests pass
- ✅ Refactor only after tests are green
- ✅ Add edge cases and error scenarios

**DON'T:**
- ❌ Write implementation before tests
- ❌ Skip running tests after each change
- ❌ Write too much code at once
- ❌ Ignore failing tests
- ❌ Test implementation details (test behavior)

## Integration with Other Commands

1. Use `/plan` first to understand what to build
2. Use `/tdd` to implement with tests
3. Use `/review` to review implementation
4. Use `/finish` to complete the task

## Related

- Agent: `~/.claude/agents/tdd-guide.md`
- Skill: `~/.claude/skills/tdd-workflow/SKILL.md`
- Rules: `~/.claude/rules/testing.md`
