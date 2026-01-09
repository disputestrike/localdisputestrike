# DisputeStrike Security Documentation

## Enterprise Security Implementation

This document outlines the security measures implemented in DisputeStrike to protect user data and ensure compliance with industry standards.

---

## 1. Payment Security (PCI-DSS Compliance)

### Stripe Integration
- **No card data touches our servers** - All payment processing is handled by Stripe
- **Webhook signature verification** - All Stripe webhooks are verified using `stripe.webhooks.constructEvent()`
- **API keys stored in environment variables** - Never hardcoded in source code
- **Test/Live mode separation** - Different keys for development and production

### Compliance Status
✅ PCI-DSS Level 4 compliant (via Stripe)
✅ No storage of card numbers, CVV, or full card data
✅ Secure webhook handling with signature verification

---

## 2. Data Encryption

### Encryption at Rest
- **AES-256-GCM encryption** for sensitive PII data
- **Encrypted fields**: SSN (last 4), Date of Birth, Addresses
- **Encryption key management** via environment variables

### Encryption in Transit
- **TLS 1.3** for all HTTPS connections
- **HSTS enabled** in production (1 year max-age)
- **Secure cookies** with HttpOnly and Secure flags

### Implementation
```typescript
// server/encryption.ts
- encrypt(plaintext) - AES-256-GCM encryption
- decrypt(ciphertext) - Decryption with auth tag verification
- hashSensitiveData(data) - One-way hashing for verification
- maskSensitiveData(data) - Display masking (XXX-XX-1234)
```

---

## 3. Authentication & Authorization

### OAuth 2.0 Implementation
- **Manus OAuth** for user authentication
- **JWT tokens** for session management
- **Token expiration** and refresh handling

### Access Control
- **Protected procedures** - All sensitive endpoints require authentication
- **Admin procedures** - Additional authorization for admin functions
- **User isolation** - Users can only access their own data

---

## 4. Security Headers (OWASP Recommended)

### Helmet.js Configuration
```
Content-Security-Policy: Restricts resource loading
X-Frame-Options: DENY - Prevents clickjacking
X-Content-Type-Options: nosniff - Prevents MIME sniffing
X-XSS-Protection: 1; mode=block - Browser XSS filter
Referrer-Policy: strict-origin-when-cross-origin
HSTS: max-age=31536000; includeSubDomains; preload
```

---

## 5. Rate Limiting

### API Protection
| Endpoint | Window | Max Requests |
|----------|--------|--------------|
| General API | 15 min | 100 |
| Authentication | 1 hour | 10 |
| Payments/Sensitive | 1 hour | 20 |

### DDoS Protection
- Express rate limiting middleware
- Request size limits (50MB max)
- Suspicious request blocking

---

## 6. Input Validation & Sanitization

### Zod Schema Validation
- All API inputs validated with Zod schemas
- Type-safe validation at runtime
- Custom error messages for user feedback

### Sanitization Functions
```typescript
// server/inputValidation.ts
- sanitizeHtml() - Removes HTML tags, prevents XSS
- sanitizeFileName() - Prevents path traversal
- sanitizeSqlInput() - Extra SQL injection protection
- detectInjectionAttempt() - Detects attack patterns
```

### Protected Against
✅ SQL Injection (Drizzle ORM + sanitization)
✅ XSS (HTML sanitization + CSP headers)
✅ CSRF (SameSite cookies + CORS)
✅ Path Traversal (filename sanitization)
✅ Command Injection (input validation)

---

## 7. File Upload Security

### Validation Rules
- **Allowed types**: PDF, JPEG, PNG, GIF, HTML, TXT
- **Max size**: 50MB
- **Filename sanitization**: Removes path traversal characters
- **Content-type verification**: Extension must match MIME type

### Implementation
```typescript
// server/uploadRouter.ts
- File type whitelist validation
- Size limit enforcement
- Extension/MIME type matching
- Upload logging for audit trail
```

---

## 8. Code Protection

### Source Code Security
- **No source maps in production** - Prevents code exposure
- **Environment variables** - All secrets in .env (not committed)
- **.gitignore** - Excludes sensitive files

### What's Protected
- API keys and secrets
- Database credentials
- Encryption keys
- OAuth client secrets

---

## 9. Database Security

### Drizzle ORM Protection
- **Parameterized queries** - Prevents SQL injection
- **Type-safe queries** - Compile-time validation
- **No raw SQL** in application code

### Data Isolation
- User data segregated by user_id
- Foreign key constraints
- Cascading deletes for data cleanup

---

## 10. Logging & Monitoring

### Security Logging
- Suspicious request detection and logging
- Upload attempt logging
- Authentication failure logging
- Payment event logging

### Audit Trail
- Activity log table for user actions
- Timestamp tracking on all records
- IP address logging (where applicable)

---

## Environment Variables Required

```bash
# Encryption (REQUIRED for production)
ENCRYPTION_KEY=<64 hex characters>
HASH_SALT=<random string>

# Stripe (REQUIRED)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Database
DATABASE_URL=mysql://...

# OAuth
JWT_SECRET=<random string>
OAUTH_SERVER_URL=https://...
```

---

## Security Checklist for Deployment

- [ ] Set ENCRYPTION_KEY (64 hex chars)
- [ ] Set HASH_SALT (random string)
- [ ] Configure Stripe live keys
- [ ] Enable HTTPS/TLS
- [ ] Set NODE_ENV=production
- [ ] Disable source maps
- [ ] Configure CORS for production domain
- [ ] Set up monitoring/alerting
- [ ] Enable database backups
- [ ] Review access logs regularly

---

## Compliance Summary

| Standard | Status | Notes |
|----------|--------|-------|
| PCI-DSS | ✅ Compliant | Via Stripe |
| OWASP Top 10 | ✅ Protected | All major vectors covered |
| GDPR | ⚠️ Partial | Data deletion implemented |
| CCPA | ⚠️ Partial | User data export needed |
| SOC 2 | ⚠️ Partial | Audit logging in place |

---

## Reporting Security Issues

If you discover a security vulnerability, please email security@disputestrike.com with:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

We will respond within 48 hours and work to resolve critical issues within 7 days.

---

*Last Updated: January 2026*
*Security Implementation Version: 1.0*
