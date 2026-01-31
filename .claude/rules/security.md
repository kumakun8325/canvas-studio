# Security Rules

## Secrets Management

### Never Hardcode

```typescript
// FORBIDDEN
const API_KEY = "sk-1234567890abcdef"
const PASSWORD = "admin123"
const connectionString = "mongodb://user:pass@host:27017"

// REQUIRED
const API_KEY = import.meta.env.VITE_API_KEY
const config = await loadSecureConfig()
```

### Environment Variables

| Environment | File | Git Status |
|-------------|------|------------|
| Development | `.env.local` | Ignored |
| Production | Platform secrets | N/A |
| Example | `.env.example` | Committed (no values) |

### Sensitive Files Checklist

Never commit:
- `.env`, `.env.local`, `.env.production`
- `credentials.json`, `serviceAccount.json`
- Private keys (`*.pem`, `*.key`)
- Firebase config with real values

## Input Validation

### User Input

```typescript
// Always validate at boundaries
function handleUserInput(input: unknown): ValidatedInput {
  // 1. Type check
  if (typeof input !== 'string') {
    throw new ValidationError('Input must be string')
  }

  // 2. Sanitize
  const sanitized = sanitizeHtml(input)

  // 3. Validate constraints
  if (sanitized.length > MAX_LENGTH) {
    throw new ValidationError('Input too long')
  }

  return sanitized as ValidatedInput
}
```

### File Uploads

- Validate file type (not just extension)
- Limit file size
- Scan for malicious content
- Store outside web root

## XSS Prevention

### React Best Practices

```typescript
// SAFE - React escapes by default
<div>{userInput}</div>

// DANGEROUS - Avoid unless absolutely necessary
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// If needed, sanitize first
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### URL Handling

```typescript
// Validate URLs before use
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// Never use javascript: URLs
// Never interpolate user input into URLs without validation
```

## Firebase Security

### Firestore Rules

- Default deny all
- Validate data structure in rules
- Use auth context for access control

### Authentication

```typescript
// Always verify auth state
const user = auth.currentUser
if (!user) {
  throw new AuthError('Not authenticated')
}

// Verify tokens server-side for sensitive operations
```

## Dependencies

### Audit Regularly

```bash
npm audit
npm audit fix
```

### Version Pinning

- Use exact versions for critical dependencies
- Review changelogs before major updates
- Avoid unmaintained packages

## Code Review Checklist

Before merge, verify:

- [ ] No hardcoded secrets
- [ ] User input validated and sanitized
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] Firebase rules updated if data model changed
- [ ] No sensitive data in logs
- [ ] Dependencies audited
