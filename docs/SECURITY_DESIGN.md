# Security Design

## 1. Goals

- Ensure only authenticated users access protected APIs.  
- Enforce **role-based access control (RBAC)** per route.  
- Protect credentials at rest and in transit.  
- Document current behavior and planned controls from the requirements PDF (2FA, CAPTCHA, lockout, password reset).

---

## 2. Password storage

**Algorithm:** bcrypt (via `bcryptjs`).

**Process (register):**

1. Generate salt (`genSalt(10)`).  
2. Hash plaintext password.  
3. Persist only the hash in `users.password`.

**Login:** `bcrypt.compare(plaintext, storedHash)` — constant-time comparison provided by the library.

**Policy recommendations (to add in app or SRS):** minimum length, complexity, breach check (optional).

---

## 3. JWT authentication

**Library:** `jsonwebtoken`.

**Issuance:** On successful register or login, server signs a payload:

```json
{ "id": "<userObjectId>", "role": "<role>", "name": "<name>" }
```

**Options:** `expiresIn: '30d'` (current). Shorter access tokens + refresh tokens are a common hardening step.

**Verification:** `authMiddleware` reads `Authorization: Bearer <token>`, verifies with `process.env.JWT_SECRET`, attaches decoded claims to `req.user`.

**Threat notes:**

- Long-lived tokens in `localStorage` are vulnerable to XSS; mitigations: CSP, sanitization, or httpOnly cookies for tokens.  
- **HTTPS** is required in production so tokens are not sent in clear text.

---

## 4. Session handling

The API is **stateless**: no server-side session store for JWT today.

**Logout (client):** Remove token from storage (no server invalidation unless blocklist/refresh rotation is added).

**Planned:** Refresh tokens, Redis denylist on logout, or short-lived access + silent refresh.

---

## 5. Role-based access control

Middleware `protect(['admin'])` (etc.) ensures `req.user.role` is in the allowed list; otherwise **403 Forbidden**.

**Planned (PDF):** When admin changes a user’s role, notify user and **invalidate or refresh** old tokens so privileges update without stale JWT claims.

---

## 6. Account lockout (planned)

**Intent:** After N failed logins, temporarily lock account or require CAPTCHA.

**Design sketch:**

- Increment `failedLoginCount` on failed attempt; reset on success.  
- If count ≥ threshold, set `lockedUntil` or require CAPTCHA token on next attempt.  
- Store counters in Mongo or Redis (Redis preferred for brute-force bursts).

---

## 7. CAPTCHA (planned)

Integrate provider (e.g. reCAPTCHA v3, hCaptcha) on login/register or after failures.

**Flow:** Client obtains token → sends with login → server verifies with provider API → proceed or reject.

---

## 8. Two-factor authentication (2FA) (planned)

**Typical TOTP flow:**

1. User enables 2FA; server generates secret, shows QR for authenticator app.  
2. User confirms with one-time code; `twoFactorEnabled` set true.  
3. Login: after password check, require TOTP; optional backup codes stored hashed.

**Storage:** Encrypt `twoFactorSecret` at rest; never return secret after enrollment.

---

## 9. Password reset (planned)

1. `POST /forgot-password` with email → generate cryptographically random token, hash and store with expiry, send link or code via email.  
2. `POST /reset-password` with token + new password → validate expiry, update hash, invalidate token.

---

## 10. HTTPS and transport security

- Terminate TLS at load balancer, reverse proxy (nginx), or PaaS (Azure App Service, Render, etc.).  
- Enforce `Strict-Transport-Security` header in production.

---

## 11. Common attack mitigations

| Threat | Mitigation |
|--------|------------|
| Injection | Parameterized Mongoose queries; validate inputs |
| XSS | Escape output in UI; CSP; avoid inline scripts where possible |
| CSRF | If using cookies, SameSite + CSRF tokens; Bearer in header reduces CSRF for API-only clients |
| Brute force | Rate limiting + lockout (planned) |
| Broken auth | Strong JWT secret, HTTPS, short-lived tokens (evolution) |

---

## 12. Secrets management

- `JWT_SECRET`, `MONGO_URI`, mail/SMS keys in environment variables.  
- Never commit `.env`; use `.env.example` with placeholder keys only.
