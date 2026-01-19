---
description: Specification-Driven Development (SDD) workflow. Progress project via requirements.md → design.md → tasks.md flow
---

# /sdd Workflow (Specification-Driven Development)

## Overview
Specification-Driven Development advances projects through three key documents:

1. **requirements.md** - Requirements definition (What / Why)
2. **design.md** - Design document (How)
3. **tasks.md** - Task management (Progress tracking)

### SDD Core Philosophy
- **Specs are SSoT (Single Source of Truth)**: All implementation is based on specs
- **Specs emerge from dialogue**: Deep questions reveal hidden requirements
- **Specs are executable**: Structured format AI can understand
- **Specs are verifiable**: Compliance verified through tests
- **Specs are guardrails**: Prevent AI from going off track

References:
- SDD Basics: https://zenn.dev/beagle/articles/fd60745bc54de1
- Interactive Interviews: https://zenn.dev/kenfdev/articles/ba5507f7532418

---

## Workflow

### Phase 1: Project Initialization (/sdd init)
1. Verify project directory
2. Create the following files:
   - `requirements.md` - Requirements template
   - `design.md` - Design template
   - `tasks.md` - Task management template
   - `test-spec.md` - Test spec template
3. Prompt user to "Edit requirements.md and fill in project goals/requirements"

### Phase 1.5: Interactive Interview (/sdd interview)
Deep-dive into initial specs to clarify hidden requirements, constraints, and assumptions:
1. Load initial `requirements.md` (brief specs are OK)
2. Generate deep questions from these perspectives:
   - **Technical**: Architecture, tech stack, performance requirements
   - **UI/UX**: User experience, accessibility, responsive design
   - **Concerns**: Security, privacy, scalability
   - **Trade-offs**: Dev speed vs quality, simplicity vs features
   - **Business**: Revenue model, target users, competitive analysis
3. Exclude surface-level/obvious questions, extract essential ones only (15-40 questions)
4. Present question list by category via `notify_user`
5. Update `requirements.md` based on user answers
6. Ask follow-up questions if unclear points remain
7. Proceed to Phase 2 when all assumptions/requirements/decisions are clear

### Phase 2: Requirements Definition (/sdd req)
1. Load `requirements.md`
2. Organize and add requirements based on user input
3. Clarify functional and non-functional requirements
4. **Specify acceptance criteria**
5. Confirm "Proceed to design.md creation?"

### Phase 3: Design (/sdd design)
1. Reference `requirements.md`
2. Load `design.md`
3. Design architecture, tech choices, and structure based on requirements
4. **Define test strategy (unit/integration/E2E scope)**
5. Confirm "Proceed to tasks.md decomposition?"

### Phase 4: Task Breakdown (/sdd tasks)
1. Reference `requirements.md` and `design.md`
2. Load `tasks.md`
3. Decompose design into implementation tasks
4. **Include test tasks for each item**
5. Set priority and dependencies for each task
6. Prompt "Choose the first task to start"

### Phase 5: Implementation (/sdd impl)
1. Get next task from `tasks.md`
2. Implement while referencing `design.md`
3. **Create test code alongside implementation**
4. Update `tasks.md` after completion
5. Confirm "Proceed to next task?"

### Phase 6: Status Check (/sdd status)
1. Load `requirements.md`, `design.md`, `tasks.md`
2. Display progress summary:
   - Requirements fulfillment status
   - Design completeness
   - Task completion rate
   - **Test coverage status**
3. Suggest next actions

### Phase 7: Spec Sync (/sdd sync)
When code was directly modified, sync with specs:
1. Check changed code
2. Identify affected spec documents
3. Update specs and note change reasons
4. Sync test specs as well

### Phase 8: Spec Review (/sdd review)
Evaluate externally created specs (phone notes, etc.):
1. Load `requirements.md` or input text
2. Evaluate from these perspectives:
   - **Technical feasibility**: Can selected tech implement this?
   - **Scope clarity**: Any ambiguous requirements?
   - **Consistency**: Any contradicting requirements?
   - **Risks**: Security, performance, scalability
   - **Gaps**: Any overlooked requirements?
3. Output evaluation results:
   - ✅ Good points
   - ⚠️ Improvement suggestions
   - ❓ Points needing clarification
4. Update `requirements.md` as needed

### Phase 9: Kickstart (/sdd kickstart)
Shortcut to run interview → req → design in sequence:
1. Run `/sdd interview` → User confirmation
2. Run `/sdd req` → User confirmation
3. Run `/sdd design` → User confirmation
4. After all phases complete, suggest transition to `/plan`

> **Note**: User confirmation is required between phases,
> so this is "guided sequential execution" not fully automatic

---

## Command Reference

| Command | Description |
|---------|-------------|
| `/sdd init` | Project initialization (create templates) |
| `/sdd interview` | Interactive interview (deep questions) |
| `/sdd req` | Edit/verify requirements |
| `/sdd design` | Edit/verify design document |
| `/sdd tasks` | Task breakdown/updates |
| `/sdd impl` | Implement next task |
| `/sdd status` | Check progress status |
| `/sdd sync` | Sync specs with code |
| `/sdd review` | **Evaluate existing spec validity** |
| `/sdd kickstart` | **Run interview→req→design sequentially** |

---

## File Structure

```
project/
├── docs/
│   ├── requirements.md   # Requirements (SSoT)
│   ├── design.md         # Design document
│   ├── tasks.md          # Task management
│   └── test-spec.md      # Test spec
├── src/                  # Source code
└── tests/                # Test code
```

---

## Bidirectional Sync Rules

### Basic Principles
- **Specs → Code** is the default (code expresses specs)
- When code is directly modified, always reflect in specs

### Flow When Code is Directly Modified
1. Record change reason (emergency bug fix, etc.)
2. Run `/sdd sync`
3. Update affected specs
4. Update and run tests

### Prohibited Actions
- Changing code without updating specs
- Leaving spec-code divergence unaddressed

---

## How to Write Test Specs

```markdown
## Test Case: [Feature Name]

### Normal Cases
| ID | Input | Expected Result |
|----|-------|-----------------|
| TC-001 | [Input] | [Expected result] |

### Error Cases
| ID | Input | Expected Result |
|----|-------|-----------------|
| TC-002 | [Invalid input] | [Error message] |

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

---

## Notes

- Always reference previous documents at each phase
- If requirements change, update requirements.md and verify impact
- Always update tasks.md when task completes
- **Always maintain spec-code sync**
- **Treat tests as part of specs**

// turbo-all
