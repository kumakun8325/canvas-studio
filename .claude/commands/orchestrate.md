# Orchestrate Command

Run sequential agent workflows for complex tasks.

## Usage

`/orchestrate [workflow-type] [description]`

## Workflow Types

### Feature (Default)
Full feature implementation workflow.

```
planner -> tdd-guide -> code-reviewer -> security-reviewer
```

### Bugfix
Bug investigation and fix workflow.

```
explorer -> tdd-guide -> code-reviewer
```

### Refactor
Safe refactoring workflow.

```
architect -> code-reviewer -> tdd-guide
```

### Security
Security-focused review workflow.

```
security-reviewer -> code-reviewer -> architect
```

### Custom
Define your own agent sequence.

```
/orchestrate custom "agent1,agent2,agent3" "task description"
```

## How It Works

1. Parse workflow type and task description
2. For each agent in the workflow:
   - Invoke agent with context from previous agent
   - Capture agent output
   - Create handoff document for next agent
3. Aggregate results into final report

## Handoff Document Format

Each agent passes to the next:

```markdown
## Handoff: [from-agent] -> [to-agent]

### Context
[What was the task]

### Findings
[What the agent discovered/did]

### Files Modified
- file1.ts: [changes]
- file2.ts: [changes]

### Open Questions
- [Question 1]
- [Question 2]

### Recommendations for Next Agent
- [Recommendation 1]
- [Recommendation 2]
```

## Final Report

```
ORCHESTRATION COMPLETE
======================
Workflow: [type]
Task: [description]
Duration: [time]

AGENT SUMMARIES
---------------
[planner]: [summary]
[tdd-guide]: [summary]
[code-reviewer]: [summary]
[security-reviewer]: [summary]

FILES CHANGED
-------------
- file1.ts
- file2.ts

TEST RESULTS
------------
[pass/fail summary]

SECURITY STATUS
---------------
[clean/issues found]

RECOMMENDATION
--------------
[SHIP / NEEDS WORK / BLOCKED]
```

## Tips

- Use for complex features that need multiple perspectives
- Always include code-review before merge
- Use security workflow for auth, payments, PII
- Keep handoffs focused and concise
- Run /verify between agents if needed

## Arguments

$ARGUMENTS:
- `feature <desc>` - Full feature workflow
- `bugfix <desc>` - Bug fix workflow
- `refactor <desc>` - Refactoring workflow
- `security <desc>` - Security review workflow
- `custom "<agents>" "<desc>"` - Custom workflow
