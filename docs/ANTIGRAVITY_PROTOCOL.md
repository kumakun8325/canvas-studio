# Antigravity PM Protocol

This document defines the automated development workflow where Antigravity acts as the Project Manager and Claude acts as the Lead Engineer.

## Roles & Responsibilities

### 1. User (Client)

- Provides high-level objectives and feature requests.
- Performs final verification (especially localhost UI checks).
- Does NOT intervene in the development loop unless requested.

### 2. Antigravity (Project Manager / Director)

- **Breakdown**: Converts user requests into specific GitHub Issues.
- **Trigger**: Activates Claude via GitHub Comments (`@claude`).
- **Monitor**: Polls GitHub Actions status autonomously (`gh run watch`).
- **Decision**:
  - If CI passes: Verifies code/logs, merges PRs.
  - If CI fails: Analyzes logs, provides fix instructions to Claude via comments.
- **Escalation**: Only requests User intervention for visual/localhost checks.

### 3. Claude Code (Lead Engineer / QA)

- **Role**: Coder, Refactorer, Reviewer.
- **Workflow**:
  1.  **TDD**: Write failing tests first.
  2.  **Implement**: Make tests pass.
  3.  **Refactor**: Clean up code.
  4.  **Self-Review**: Verify quality before PR.
- **Protocol**: Strictly follows `.claude/skills/` guidelines.

---

## The Autopilot Loop

Antigravity executes the following loop upon receiving a task:

1.  **Initialize**:
    - Update `task.md`.
    - Create/Update GitHub Issue.

2.  **Assign**:
    - Post comment to Issue:
      ```markdown
      @claude
      [Task Description]
      [Constraints]
      ```

3.  **Monitor (Polling)**:
    - Execute `gh run watch` to wait for completion.
    - **Do NOT stop and ask user**. Wait for the specific Run ID.

4.  **Evaluate**:
    - **Success**:
      - `git fetch` & `git checkout` the PR branch.
      - Verify file structure and basic logic.
      - (Optional) Request User for UI check (`notify_user`).
      - Merge PR (`gh pr merge`).
    - **Failure**:
      - Read logs (`gh run view --log`).
      - Identify error (compile error, test fail, etc.).
      - Post comment to Issue with fix instructions.
      - **Return to Step 3**.

5.  **Complete**:
    - Update `task.md`.
    - Report to User.

## Configuration

This workflow depends on:

- `.github/workflows/claude-responder.yml` (QA Protocol implemented)
- `.claude/skills/` (tdd-workflow, refactoring, code-review)
