# Branch Protection Rules Setup Guide
#
# Configuration is done through GitHub UI.
# This file documents the setup procedure.

## Setup Procedure

1. **Repository Settings → Branches → Add branch protection rule**

2. **Branch name pattern**: `main`

3. **Check the following**:

   - [x] **Require a pull request before merging**
     - [x] Require approvals (1+ recommended)
     - [x] Dismiss stale pull request approvals when new commits are pushed
   
   - [x] **Require status checks to pass before merging**
     - [x] Require branches to be up to date before merging
     - Status checks to require:
       - `Analyze (javascript-typescript)` (CodeQL)
       - `test` (if available)
       - `build` (if available)
   
   - [x] **Require conversation resolution before merging**
   
   - [x] **Do not allow bypassing the above settings**

4. Click **Create**

---

## GitHub CLI Setup (Optional)

```bash
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Analyze (javascript-typescript)"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}'
```

---

## Recommended Rules

| Setting | Recommended | Reason |
|---------|-------------|--------|
| Require approvals | 1 | At least one review |
| Require status checks | ON | CI must pass |
| Require up to date | ON | Update before merge |
| Include administrators | ON | No exceptions |
