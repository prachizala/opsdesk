# Security Policy

## 1. Supported Versions

We provide security updates and patches for the following versions of OpsDesk:

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 1.0.x   | :white_check_mark: | Active Development (Milestone 3 Reference Release) |
| < 1.0.0 | :x:                | Deprecated (Pre-release Prototypes) |

---

## 2. Demo Authentication Warning & Production Migration

> [!WARNING]
> **Demo-Only Authentication Notice:**
> The current version of OpsDesk utilizes client-supplied identity (`X-User-Id` header) to facilitate seamless role demonstration across multiple agent profiles (`Agent`, `Lead`, `EscalationManager`, `Requester`), as permitted under the hackathon evaluation specification (*Zendesk-Darwin box Automation.pdf*, Page 6).

### Production Hardening Guidelines
Before deploying OpsDesk to a public or production environment:
1. **Replace Demo Auth:** Replace `get_current_user` in `backend/app/auth.py` with signed cryptographic tokens (OAuth 2.0 / OpenID Connect / JWT bearer tokens).
2. **Database Migration:** Migrate from local SQLite to managed PostgreSQL with row-level tenant security (RLS) and encrypted connections (SSL/TLS).
3. **CORS Restrictions:** Set `ALLOWED_CORS_ORIGINS` to trusted, verified company domains.
4. **Secret Management:** Store all API keys, database credentials, and service tokens in environment variables or an enterprise secret vault (e.g. HashiCorp Vault, AWS Secrets Manager). Never commit `.env` or database files to source control.

---

## 3. Multi-Tenant Agency Isolation

OpsDesk enforces strict multi-agency isolation guarantees:
- **Agency Requesters (`Requester` role):** Restricted strictly to their own agency's tickets (`agency_id`). Any attempt to access, list, or mutate another agency's tickets returns `HTTP 403 Forbidden` or `HTTP 404 Not Found`.
- **Internal Note Privacy:** Internal staff communications (`InternalNote`) and supplier side-threads (`side-threads`) are completely stripped from API responses delivered to `Requester` roles.
- **Queue & Score Privacy:** Triage queue positions, internal priority scores, and routing reasons are withheld from external agency views.

---

## 4. Reporting a Vulnerability

If you discover a security vulnerability or potential privacy breach in OpsDesk:

1. **Do NOT open a public GitHub issue.**
2. Send an email to the security response team at: **security@example.com** (or contact repository maintainers via GitHub private security advisories).
3. Include:
   - Description of the vulnerability and affected endpoint/component.
   - Proof of Concept (PoC) or reproducible steps.
   - Potential impact on tenant isolation or data integrity.
4. We acknowledge receipt within 48 hours and work with you on a coordinated disclosure timeline.
