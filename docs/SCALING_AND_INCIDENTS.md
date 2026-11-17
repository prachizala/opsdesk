# OpsDesk Scaling, Incidents & Failure Modes Runbook

This document details failure modes, surge response procedures, and environment tuning knobs implemented as part of Milestone 4 Load Hardening.

> **DISCLAIMER ON PERFORMANCE MEASUREMENTS:**
> All benchmark figures and latencies documented herein were measured locally on a Windows development machine running Python 3.11 with a single Uvicorn worker process against SQLite in WAL mode. These represent verifiable local baseline results and are **NOT** production SLA commitments.

---

## 1. Failure Modes & Operational Mitigations

| Failure Mode | Symptom | Root Cause | Immediate Mitigation | Long-Term Architecture Fix | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SQLite DB Locking Contention** | HTTP 500 / `sqlite3.OperationalError: database is locked` during concurrent write spikes | Default SQLite `DELETE` journal mode locks entire database on every write; zero wait timeout. | SQLite connection event sets `PRAGMA journal_mode=WAL`, `PRAGMA busy_timeout=5000`, and `PRAGMA synchronous=NORMAL`. | Migrate to managed PostgreSQL 16+ with connection pooler (PgBouncer). | **VERIFIED** (0 lock errors in local benchmark) |
| **Concurrent Operator Ticket Claim Collision** | Two operators claim the same unassigned ticket simultaneously; one agent silently overwrites the other. | Naive write without predicate checking allows the last writer to overwrite assignee without detection. | Atomic conditional SQL update (`WHERE id = ? AND assigned_to IS NULL AND version = ?`). Loser receives HTTP 409 Conflict. | PostgreSQL row-level locking (`SELECT ... FOR UPDATE SKIP LOCKED`). | **VERIFIED** (Atomic update + HTTP 409 implemented and tested) |
| **Stale State Overwrite (Lost Updates)** | Operator modifies a ticket while viewing outdated information; prior updates by other staff are overwritten. | Missing optimistic concurrency checks in status transitions, transfers, and escalations. | Optimistic version checking via `Ticket.version` column. Clients pass expected version; mismatches return HTTP 409 Conflict. | Distributed event log + client re-fetch triggers on 409. | **VERIFIED** (Implemented across status, transfer, escalate endpoints) |
| **Duplicate Ticket Submissions** | Multiple identical tickets created when requester double-clicks submit or network retries occur. | Network timeouts cause clients to replay `POST /api/tickets` requests. | Support for optional `Idempotency-Key` header; cached responses stored in `idempotency_records` table per user. If key is reused with a different request payload, server returns HTTP 409 Conflict. Retention assumption: SQLite indefinite vs production 24h Redis TTL. | Distributed idempotency cache (Redis / DynamoDB) with TTL. | **VERIFIED** (Implemented and tested with SHA-256 payload validation and 409 Conflict) |
| **CSV Export Resource Starvation** | Server RAM exhaustion or worker thread freeze during large data dumps. | Unbounded concurrent execution of heavy database table scans. | Concurrency limiter (`CSV_EXPORT_MAX_CONCURRENCY=2`, returning 503 with `Retry-After: 10`) + generator streaming via `yield_per(500)` + max duration guard (`CSV_EXPORT_MAX_DURATION_SECONDS=30.0s`) with semaphore release in `finally` block. | Dedicated background export worker (Celery/Temporal) writing to S3/GCS presigned URLs. | **VERIFIED** (Concurrency limiter returns 503 on 3rd+ concurrent request; timeout breaks stream with abort row) |
| **AI Intent Classification Hanging** | `POST /api/ai/suggest-intent` experiences multi-second latency or hangs indefinitely during Gemini API hiccups. | External LLM API calls experiencing network stalls or provider rate limits without strict timeout. | Non-blocking thread pool execution capped at `GEMINI_TIMEOUT_SECONDS=3.0` falling back to regex or `fallback_unclassified`, passing timeout directly to SDK client `http_options`. | Asynchronous background classification worker writing intent predictions back to ticket outbox. | **VERIFIED** (Fails over to fallback within 0.1s in unit tests) |
| **Client Frontend Polling Storm (Thundering Herd)** | Backend receives synchronized traffic spikes from hundreds of open browser tabs. | Fixed `setInterval(30000)` without jitter; polling continuing while tabs are in background. | Client-side random jitter (+/- 3s), `visibilitychange` polling pause when hidden, and exponential error backoff (5s to 60s). | Server-Sent Events (SSE) / WebSocket push gateway. | **VERIFIED** (Implemented in Next.js client pages) |
| **In-Process Memory Leak in Rate Limiter** | Dictionary accumulating unlimited IP/user keys over time under distributed scanning. | Unbounded in-memory dictionary storage. | Dual-keying (`user:<X-User-Id>` and `ip:<client_ip>`), bound dictionary size via `RATE_LIMIT_MAX_KEYS=10000` with stale key eviction and LRU pruning. Note on reverse proxies: `request.client.host` represents proxy IP unless trusted proxy CIDR forwarding is configured (status: planned, not built). | Redis sliding window rate limiter. | **VERIFIED** (Implemented and tested with bounded eviction) |
| **Outbox Event Emission Without Delivery** | Events accumulated in `events_outbox` table but external integrations do not receive webhooks. | Outbox worker process not yet implemented in codebase. | Manual polling or direct database read of `events_outbox` table for event audits. | Standalone background Outbox worker daemon reading unconsumed events and publishing to Kafka/RabbitMQ. | **UNVERIFIED / NOT BUILT** (Table exists, consumer not yet built) |

---

## 2. Surge Runbook & Environment Tuning Knobs

In the event of an operational surge (e.g. flight disruptions, weather cancellations), adjust the following environment variables:

### Database & Concurrency Controls

| Variable | Default | Recommended Surge Value | Description |
| :--- | :--- | :--- | :--- |
| `DB_POOL_SIZE` | `10` | `20` - `30` | Number of persistent connections maintained in the SQLAlchemy connection pool. |
| `DB_MAX_OVERFLOW` | `20` | `40` | Maximum number of transient overflow connections allowed above `DB_POOL_SIZE`. |
| `DB_POOL_TIMEOUT` | `30` | `45` | Seconds to wait before timing out on connection pool checkout. |
| `DATABASE_URL` | `sqlite:///...` | `sqlite:///...` (or PostgreSQL in prod) | Database connection string. When pointing to SQLite, WAL mode is applied automatically on connection. |

### Protection & Rate Limiting Controls

| Variable | Default | Recommended Surge Value | Description |
| :--- | :--- | :--- | :--- |
| `RATE_LIMIT_PER_MINUTE` | `120` | `300` (or `60` under DoS) | In-process sliding-window request limit per `X-User-Id` and client IP. Rejections return HTTP 429 Too Many Requests with `Retry-After: 60`. *(Note: For multi-worker clusters, Redis distributed rate limiter is required; in-process limiter protects individual worker).* |
| `RATE_LIMIT_MAX_KEYS` | `10000` | `20000` | In-memory key capacity limit for rate limiting dictionary. Oldest / stale entries are evicted to prevent unbounded memory growth. |
| `CSV_EXPORT_MAX_CONCURRENCY` | `2` | `1` (under memory pressure) | Maximum simultaneous CSV streaming exports. Excess callers receive HTTP 503 Service Unavailable with `Retry-After: 10`. |
| `CSV_EXPORT_MAX_DURATION_SECONDS` | `30.0` | `15.0` | Maximum streaming duration ceiling before export generator aborts with an `# [ABORTED]` row. |
| `GEMINI_TIMEOUT_SECONDS` | `3.0` | `1.5` - `2.0` | Hard timeout ceiling on Gemini classification requests, configured directly in SDK client `http_options`. If exceeded, immediately yields deterministic regex or Unclassified fallback. |

---

## 3. Measured Local Load Benchmark Summary

### A. Baseline (`origin/feat/m3-docs`) vs HEAD (`feat/m4-load-hardening`) Comparison

Measured on Windows 11 development machine (Python 3.11, Uvicorn single worker, temp SQLite DB, `RATE_LIMIT_PER_MINUTE=120`):

| Metric | Scenario 1: Read-Heavy Triage (150 reqs, c=15) | Scenario 2: Mixed R/W (90 reqs, c=10) | Scenario 3: Concurrency Limiter (6 exports + 40 reads) |
| :--- | :--- | :--- | :--- |
| **Baseline (`m3-docs`)** | 100% 200 OK (0x429), p50=407.06ms, max=540.14ms | 100% 200/201 (0x429), p50=12.48ms, max=1029.79ms | 46x 200 OK (0 rejected), p50=1203.10ms, max=6326.45ms (unbounded export latency spike) |
| **HEAD (`m4-load-hardening`)** | 100% 200 OK (0x429), p50=430.88ms, max=538.32ms | 100% 200/201 (0x429), p50=43.94ms, max=726.08ms | 42x 200 OK, 4x 503 rejected, p50=875.44ms, max=3175.68ms (concurrency bounded, max latency cut by ~50%) |

*Note on 0x429 in 150 requests:* With `RATE_LIMIT_PER_MINUTE=120`, the test suite distributes 150 requests across 4 distinct test user IDs (`USR-101`..`104`), each averaging ~37 requests (< 120 limit).

### B. SQLite Write Contention Reproduction (8 Threads, 25 Writes each = 200 writes)

| SQLite Configuration | Successful Commits | Locked Errors (`sqlite3.OperationalError`) |
| :--- | :--- | :--- |
| `journal_mode=DELETE, busy_timeout=0` | 15 / 200 | **185** locked errors (reproduced) |
| `journal_mode=DELETE, busy_timeout=5000` | 200 / 200 | 0 locked errors |
| `journal_mode=WAL, busy_timeout=5000` | 200 / 200 | 0 locked errors |

### C. Triage Candidate Loading & Scoring Analysis

- **Optimization Evaluated:** Candidate loading with `defer(Ticket.description)` vs full loading.
- **Sorting Requirement:** 100% global sorting parity with `calculate_queue_score_tier2` (verified by `test_triage_queue_score_global_sorting` and `test_unassigned_journey_b_triage_top3`).
- **Benchmark Result:**
  - With `defer(Ticket.description)`: Mean = 5.74ms (min: 4.70ms, max: 22.76ms) across 456 unassigned candidates.
  - Without defer: Mean = 5.63ms (min: 4.54ms, max: 22.30ms).
- **Conclusion:** **No measurable improvement** at demo dataset scale (5,000 total rows / 456 unassigned candidates). In-memory Python scoring is sub-6ms. Slicing candidates in SQL before Python scoring would violate global urgency ordering (an Urgent ticket with a close LCD or check-in could be omitted if filtered by SQL created_at or priority alone). Long-term architecture requires a persisted indexed column or compiled Rust scoring worker for multi-million row scale.

---

## 4. Verification Matrix

| Architecture Component | Status | Verification Mechanism |
| :--- | :--- | :--- |
| **Next.js CVE-2025-66478 Patch** | **VERIFIED** | Upgraded to Next.js 15.5.29; `npm audit` shows 0 critical vulnerabilities. `npm run build` succeeds cleanly. |
| **CSV Formula Injection Sanitization** | **VERIFIED** | Automated test `test_export_csv_formula_injection_escaping` verifies leading `=`, `+`, `-`, `@`, `\t`, `\r` are prefixed with `'`. |
| **SQLite WAL Mode & Lock Prevention** | **VERIFIED** | Automated test `test_sqlite_concurrent_writes_wal_prevents_database_is_locked` verifies 0 lock errors under 8-thread write burst. |
| **Atomic Claim & 409 Race Protection** | **VERIFIED** | Automated test `test_concurrent_ticket_assign_race_and_optimistic_control` verifies atomic update and versioning. |
| **Optimistic Version Checking** | **VERIFIED** | Automated test `test_stale_write_optimistic_concurrency_409` verifies 409 Conflict on stale version for status, transfer, and escalate. |
| **Idempotent Ticket Creation & Hash Validation** | **VERIFIED** | Automated tests `test_idempotent_ticket_creation` and `test_idempotent_ticket_creation_payload_mismatch_409` verify duplicate key returns cached ticket, and payload mismatch returns 409 Conflict. |
| **In-Process Dual-Key Rate Limiter** | **VERIFIED** | Automated tests `test_rate_limiter_middleware_blocks_with_429` and `test_rate_limiter_dual_keying_and_bounded_eviction` verify user/IP dual keying, 429 + `Retry-After: 60`, and memory bounding eviction. |
| **CSV Export Concurrency & Duration Limiter** | **VERIFIED** | Automated tests `test_csv_export_concurrency_limiter_503` and `test_csv_export_max_duration_and_generator_release` verify 503 on saturated semaphore and abort line on timeout. |
| **Gemini AI Call Timeout Fallback** | **VERIFIED** | Automated test `test_gemini_timeout_fallback` verifies fallback to Unclassified within sub-second window and passing timeout directly to SDK client `http_options`. |
| **Readiness Probe (`GET /ready`)** | **VERIFIED** | Automated test `test_readiness_probe_returns_200` verifies `SELECT 1` database health check. |
| **Request Tracing (`X-Request-ID`)** | **VERIFIED** | Automated test `test_request_id_injected_in_response` verifies injection and preservation of request IDs. |
| **Outbox Consumer Daemon** | **UNVERIFIED / NOT BUILT** | The `events_outbox` table records transactional events atomically; no standalone worker process consumes rows currently. |
| **Redis Distributed Rate Limiter** | **UNVERIFIED / PLANNED** | Current rate limiter is in-process per worker; multi-worker deployment requires Redis sliding window. |
| **PostgreSQL Tier-1 Skip Locked** | **UNVERIFIED / PLANNED** | PostgreSQL `SELECT FOR UPDATE SKIP LOCKED` is planned for production migration from SQLite. |
| **Reverse Proxy Trusted CIDR Forwarding** | **UNVERIFIED / PLANNED** | Behind reverse proxies (e.g. Nginx, Cloudflare), `request.client.host` represents the proxy IP unless trusted proxy CIDR forwarding is configured. |
