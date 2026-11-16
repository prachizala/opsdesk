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
| **Duplicate Ticket Submissions** | Multiple identical tickets created when requester double-clicks submit or network retries occur. | Network timeouts cause clients to replay `POST /api/tickets` requests. | Support for optional `Idempotency-Key` header; cached responses stored in `idempotency_records` table per user. | Distributed idempotency cache (Redis / DynamoDB) with TTL. | **VERIFIED** (Implemented and tested with UUID keys) |
| **CSV Export Resource Starvation** | Server RAM exhaustion or worker thread freeze during large data dumps. | Unbounded concurrent execution of heavy database table scans. | Concurrency limiter (`CSV_EXPORT_MAX_CONCURRENCY=2`, returning 503 with `Retry-After: 10`) + generator streaming via `yield_per(500)`. | Dedicated background export worker (Celery/Temporal) writing to S3/GCS presigned URLs. | **VERIFIED** (Concurrency limiter returns 503 on 3rd+ concurrent request) |
| **AI Intent Classification Hanging** | `POST /api/ai/suggest-intent` experiences multi-second latency or hangs indefinitely during Gemini API hiccups. | External LLM API calls experiencing network stalls or provider rate limits without strict timeout. | Non-blocking thread pool execution capped at `GEMINI_TIMEOUT_SECONDS=3.0` falling back to regex or `fallback_unclassified`. | Asynchronous background classification worker writing intent predictions back to ticket outbox. | **VERIFIED** (Fails over to fallback within 0.1s in unit tests) |
| **Client Frontend Polling Storm (Thundering Herd)** | Backend receives synchronized traffic spikes from hundreds of open browser tabs. | Fixed `setInterval(30000)` without jitter; polling continuing while tabs are in background. | Client-side random jitter (+/- 3s), `visibilitychange` polling pause when hidden, and exponential error backoff (5s to 60s). | Server-Sent Events (SSE) / WebSocket push gateway. | **VERIFIED** (Implemented in Next.js client pages) |
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
| `RATE_LIMIT_PER_MINUTE` | `120` | `300` (or `60` under DoS) | In-process sliding-window request limit per `X-User-Id` / IP. Rejections return HTTP 429 Too Many Requests with `Retry-After: 60`. *(Note: For multi-worker clusters, Redis distributed rate limiter is required; in-process limiter protects individual worker).* |
| `CSV_EXPORT_MAX_CONCURRENCY` | `2` | `1` (under memory pressure) | Maximum simultaneous CSV streaming exports. Excess callers receive HTTP 503 Service Unavailable with `Retry-After: 10`. |
| `GEMINI_TIMEOUT_SECONDS` | `3.0` | `1.5` - `2.0` | Hard timeout ceiling on Gemini classification requests. If exceeded, immediately yields deterministic regex or Unclassified fallback. |

---

## 3. Measured Local Load Benchmark Summary

Results from `python scripts/loadtest.py` running against a local test instance with 5,000 seeded tickets:

```text
================================================================================
OPSDESK LOAD & CONCURRENCY BENCHMARK RESULTS
Machine Environment: Windows 11, local Python 3.11, single uvicorn worker
Database: SQLite WAL mode (busy_timeout=5000, synchronous=NORMAL)
DISCLAIMER: Measured on this local machine. These are not production SLA numbers.
================================================================================

--- Scenario 1: Read-Heavy Triage (GET /api/tickets?view=triage) ---
Total Requests:       150 (concurrency: 15)
Status Breakdown:     {200: 150} (100% success)
DB 'locked' errors:   0
Latency min / avg:    532.28 ms / 1224.70 ms
Latency p50:          1239.04 ms
Latency p95:          1626.66 ms
Latency p99:          1731.94 ms
Latency max:          1783.63 ms

--- Scenario 2: Mixed Read/Write Concurrency (POST ticket + POST assign + GET triage) ---
Total Requests:       90 (30 creates, 30 assigns, 30 reads; concurrency: 10)
Status Breakdown:     {200: 60, 201: 30} (100% success)
DB 'locked' errors:   0
Latency min / avg:    17.08 ms / 383.66 ms
Latency p50:          93.41 ms
Latency p95:          1065.09 ms
Latency p99:          1198.45 ms
Latency max:          1253.57 ms

--- Scenario 3: Concurrent CSV Exports + Queue Reads (concurrency limiter testing) ---
Total Requests:       46 (6 simultaneous exports + 40 queue reads)
Status Breakdown:     {200: 42, 503: 4}
DB 'locked' errors:   0
Limiter behavior:     Exactly 2 exports allowed concurrently; 4 excess exports bounded with 503 Service Unavailable.
Latency min / avg:    326.47 ms / 2898.51 ms
Latency p50:          2336.00 ms
Latency p95:          4236.68 ms
Latency p99:          11106.89 ms
================================================================================
```

---

## 4. Verification Matrix

| Architecture Component | Status | Verification Mechanism |
| :--- | :--- | :--- |
| **Next.js CVE-2025-66478 Patch** | **VERIFIED** | Upgraded to Next.js 15.5.29; `npm audit` shows 0 critical vulnerabilities. `npm run build` succeeds cleanly. |
| **CSV Formula Injection Sanitization** | **VERIFIED** | Automated test `test_export_csv_formula_injection_escaping` verifies leading `=`, `+`, `-`, `@`, `\t`, `\r` are prefixed with `'`. |
| **SQLite WAL Mode & Lock Prevention** | **VERIFIED** | Automated test `test_sqlite_concurrent_writes_wal_prevents_database_is_locked` verifies 0 lock errors under 8-thread write burst. |
| **Atomic Claim & 409 Race Protection** | **VERIFIED** | Automated test `test_concurrent_ticket_assign_race_and_optimistic_control` verifies atomic update and versioning. |
| **Optimistic Version Checking** | **VERIFIED** | Automated test `test_stale_write_optimistic_concurrency_409` verifies 409 Conflict on stale version for status, transfer, and escalate. |
| **Idempotent Ticket Creation** | **VERIFIED** | Automated test `test_idempotent_ticket_creation` verifies duplicate `Idempotency-Key` returns original ticket without DB duplication. |
| **In-Process Rate Limiter Middleware** | **VERIFIED** | Automated test `test_rate_limiter_middleware_blocks_with_429` verifies 429 + `Retry-After: 60`. |
| **CSV Export Concurrency Limiter** | **VERIFIED** | Automated test `test_csv_export_concurrency_limiter_503` verifies 503 Service Unavailable on saturated semaphore. |
| **Gemini AI Call Timeout Fallback** | **VERIFIED** | Automated test `test_gemini_timeout_fallback` verifies fallback to Unclassified within sub-second window when LLM stalls. |
| **Readiness Probe (`GET /ready`)** | **VERIFIED** | Automated test `test_readiness_probe_returns_200` verifies `SELECT 1` database health check. |
| **Request Tracing (`X-Request-ID`)** | **VERIFIED** | Automated test `test_request_id_injected_in_response` verifies injection and preservation of request IDs. |
| **Outbox Consumer Daemon** | **UNVERIFIED / NOT BUILT** | The `events_outbox` table records transactional events atomically; no standalone worker process consumes rows currently. |
| **Redis Distributed Rate Limiter** | **UNVERIFIED / PLANNED** | Current rate limiter is in-process per worker; multi-worker deployment requires Redis sliding window. |
| **PostgreSQL Tier-1 Skip Locked** | **UNVERIFIED / PLANNED** | PostgreSQL `SELECT FOR UPDATE SKIP LOCKED` is planned for production migration from SQLite. |
