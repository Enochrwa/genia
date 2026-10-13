# Security Baseline

- HTTPS only, HSTS; secure httpOnly cookies; CSRF protection.
- Passwords/PINs hashed with argon2id (+ pepper from secret manager).
- Rate limiting and bot protection on OTP, login, game and withdrawal endpoints.
- RBAC: USER, SUPPORT, QUESTION_MANAGER, FINANCE, ADMIN, SUPER_ADMIN; least privilege; mandatory 2FA for staff; immutable admin audit log.
- Input validation (zod), parameterised queries, output encoding.
- Dependency, container and secret scanning in CI (gitleaks, Dependabot, Trivy).
- Encryption at rest and in transit; field-level encryption for KYC and sensitive data.
- Secrets in a managed vault; rotation schedule; no secrets in repo or logs.
- Backups: automated, encrypted, restore tested quarterly.
- Pen test before launch and yearly.
- Incident response plan, on-call rota, public status page.
- Security headers: CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
