# OpsDesk Architecture Specification

## 1. System Overview & Core Principle
OpsDesk is designed as a hybrid modular monorepo tailored for high-volume B2B travel operations.
The architecture enforces a strict single source of truth while supporting scalable, decoupled sidecars.

### Core Components & Responsibilities

1. **Python FastAPI Backend (Single Source of Truth):**
   - Handles authentication, RBAC authorization, and multi-agency isolation.
   - Core relational data persistence (Tickets, Agencies, Links, Themes, Side Conversations).
   - Routing orchestration and intent auto-suggestion via Gemini (model target: Gemini 3.5 Flash-Lite [UNVERIFIED model name, availability date unverified; fallback: gemini-2.5-flash]).
   - Writes transactional state changes and outbox events to `events_outbox`.
   - Active by default.

2. **Go Realtime Gateway (SSE Sidecar):**
   - **Why it exists:** Provides lightweight, high-concurrency Server-Sent Events (SSE) connections to operations agent browsers (design target: hundreds of concurrent connections, benchmark pending).
   - **How it works:** Reads committed events from `events_outbox` table and broadcasts them to connected browsers.
   - **Security:** Enforces agency and role filtering (e.g. Agency Requesters only receive `public` visibility events for their own agency; internal notes are withheld).
   - **Python Fallback:** SWR client polling / FastAPI long-polling when `REALTIME=off`.

3. **Rust SLA & Scoring Engine:**
   - **Why it exists:** High-throughput batch re-evaluation of travel countdown timers and queue priority scores across active records (design target: sub-millisecond execution, benchmark pending).
   - **How it works:** Pure functional calculations matching the shared contract in `contracts/sla_engine.schema.json` and validated against `contracts/golden_vectors.json`.
   - **Python Fallback:** `backend/services/sla_engine.py` and `backend/services/routing_engine.py` when `SLA_ENGINE=python`.

4. **Go Export Service:**
   - **Why it exists:** Handles high-throughput, un-capped CSV exports (e.g. 10,000 to 50,000+ rows) without memory spikes (design target: streaming cursor, benchmark pending).
   - **How it works:** Streams records directly from the database cursor into chunked HTTP responses.
   - **Python Fallback:** FastAPI `StreamingResponse` using Python generators when `EXPORT=fastapi`.

---

## 2. Configuration & Feature Flags
All decoupled sidecars are toggled via environment variables:

| Variable | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| `SLA_ENGINE` | `python` \| `rust` | `python` | Toggle between Python reference implementation and Rust engine. |
| `REALTIME` | `off` \| `on` | `off` | When `off`, UI uses polling. When `on`, connects to Go SSE gateway. |
| `EXPORT` | `fastapi` \| `go` | `fastapi` | Toggle between FastAPI `StreamingResponse` and Go export service. |

---

## 3. Transactional Outbox Pattern (`events_outbox`)
Every state mutation (ticket created, assigned, note added, SLA breached) atomically writes a row to `events_outbox` within the same database transaction.

- **Schema:**
  - `id`: Unique event identifier (UUID)
  - `event_type`: Event category (e.g., `ticket.created`, `ticket.updated`, `message.created`)
  - `ticket_id`: Associated ticket
  - `agency_id`: Associated agency for tenant scoping
  - `visibility`: `'public'` (visible to agency requester) or `'internal'` (visible only to internal staff)
  - `payload_json`: Full event payload
  - `created_at`: Event generation timestamp
  - `delivered_at`: Timestamp when processed by realtime dispatcher (NULL if pending)
