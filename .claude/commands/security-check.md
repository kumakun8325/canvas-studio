# /security-check - セキュリティ監査

コードベースのセキュリティ問題を検出するコマンド。

## 実行内容

### 1. 依存関係の監査

```bash
npm audit
```

### 2. シークレット検出

検索パターン：
- API keys: `(api[_-]?key|apikey)\s*[:=]\s*['"][^'"]+`
- Passwords: `(password|passwd|pwd)\s*[:=]\s*['"][^'"]+`
- Tokens: `(token|secret|credential)\s*[:=]\s*['"][^'"]+`
- Connection strings: `(mongodb|postgres|mysql):\/\/[^'"]+`

### 3. 危険なパターン検出

- `dangerouslySetInnerHTML` の使用
- `eval()` の使用
- 未検証のユーザー入力
- ハードコードされたURL（本番環境）

### 4. Firebase セキュリティ

- Firestore ルールの確認
- 認証状態チェックの有無
- クライアントサイドでの権限チェック

## 出力フォーマット

```markdown
## Security Audit Report

### Dependencies
- Vulnerabilities: 2 high, 3 moderate
- Run `npm audit fix` to resolve

### Secrets Detected 🔴
| File | Line | Type | Status |
|------|------|------|--------|
| config.ts | 12 | API Key | EXPOSED |

### Dangerous Patterns ⚠️
1. `dangerouslySetInnerHTML` in Component.tsx:45
   - Risk: XSS if input not sanitized
   - Recommendation: Use DOMPurify

2. Unvalidated input in form.ts:23
   - Risk: Injection
   - Recommendation: Add validation

### Firebase Security
- [ ] Firestore rules reviewed
- [ ] Auth state checked before operations
- [ ] Admin SDK not exposed client-side

### Recommendations
1. [優先度順の対策リスト]
```

## 定期実行推奨

- PR作成前
- 依存関係更新後
- 認証/認可ロジック変更後
