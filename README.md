# OpsDesk: B2B Travel Operations Case Management Platform

OpsDesk replaces fragmented ticketing in travel operations with context-linked cases organized around travel reality:
- **First-Class TBOH Linkage:** Surfaces prior contacts sharing the same TBO Booking Reference (`TBOH_ID`) without third-party add-ons.
- **Travel-Aware SLA Engine:** Dynamically calculates countdowns based on guest check-in proximity and Last Cancellation Date (LCD).
- **2-Tier Routing Engine:** 
  - Tier 1: Selects available regional agents based on workload.
  - Tier 2: Ranks the operations queue based on check-in urgency and priority.
- **Transfer-Proof Supplier Threads:** Decouples supplier conversation recipients from assigned agents, preserving threads across transfers.
- **Uncapped Ops Data Path:** Eliminates artificial 3,000-row export barriers via direct database streaming.

> **Note on Demo Fixtures:** In demo fixtures TCK-1004 and TCK-1006, the Last Cancellation Date (LCD) is intentionally placed equal to or after the check-in date so that guest check-in proximity directly acts as the controlling urgency factor.

---

## MVP Implementation Status (TBO Problem Statement Alignment)
The implementation directly maps to the requirements specified in the problem statement (*Zendesk-Darwin box Automation.pdf*, pages 1–7):

| Feature / MVP | Problem Statement Requirement | Status | Implementation Details |
|---|---|---|---|
| **MVP-1: TBOH Linkage & 360 View** | First-class booking reference grouping without Zendesk add-on fee | **Backend implemented, UI pending** | `TicketLink` model, `GET /api/tickets/{id}/links`, `POST /api/tickets/{id}/links`, and `view=linked` view. Next.js 15 UI pending Milestone 2+. |
| **MVP-2: Travel-Aware SLA Engine** | Dynamic countdown based on check-in proximity and LCD date | **Backend implemented, UI pending** | `backend/services/sla_engine.py`, verified against `contracts/golden_vectors.json`. Visual SLA countdown badge UI pending. |
| **MVP-3: 2-Tier Routing Engine** | Tier-1 regional desk assignment + Tier-2 dynamic queue priority | **Backend implemented, UI pending** | `backend/services/routing_engine.py`, MEA/APAC/EUR desks, priority weights. Queue dashboard UI pending. |
| **MVP-4: Transfer-Proof Supplier Threads** | Side conversation threads preserved across agent handoffs | **Backend implemented, UI pending** | `POST /api/tickets/{id}/transfer`, side conversation recipients decoupled from `assigned_to`. Thread viewer UI pending. |
| **MVP-5: Proactive Insights & Clustering** | Root cause clustering across tickets sharing suppliers/hotels | **Pending** | Scheduled for Milestone 3 (clustering pipeline & automated theme detection). |
| **MVP-6: Uncapped Operations Export** | Streaming export overcoming artificial 3,000-row tool barriers | **Pending** | Export endpoint and Go streaming daemon scheduled for Milestone 3 (no export endpoint in Milestone 2). |
| **MVP-7: AI Intent Classifier** | Intent extraction and smart triage suggestions | **Backend implemented, UI pending** | `backend/services/intent_classifier.py` (regex rules + optional Gemini API fallback). Agent triage composer UI pending. |

---

## Datetime & Timezone Decision
The backend consistently utilizes naive UTC datetimes (`datetime.utcnow()`) across SQLite persistence, Pydantic schemas, routing calculations, and SLA evaluation. 
- In development (SQLite), datetimes are stored as ISO 8601 strings in UTC.
- In production (PostgreSQL), columns use `TIMESTAMP WITHOUT TIME ZONE` stored strictly in UTC to prevent daylight savings anomalies and database server timezone drift.
- Client applications (Next.js 15 frontend) receive ISO 8601 UTC strings and format them into local agency or agent timezones at presentation time.

---

## Modular Architecture & Sidecar Contracts
The system is built as a modular monorepo with Python FastAPI as the core source of truth and decoupled sidecar extensions:

1. **Python FastAPI Backend (`backend/`):**
   - Source of truth for authentication, RBAC, CRUD, routing orchestration, and intent suggestions via Gemini (model target: Gemini 3.5 Flash-Lite [UNVERIFIED model name, availability date unverified; fallback: gemini-2.5-flash]).
2. **Go Realtime Gateway (`services/realtime-go/`):**
   - *Why it exists:* Provides high-concurrency Server-Sent Events (SSE) broadcasting from the `events_outbox` table (design target, benchmark pending).
   - *Python Fallback:* Client-side SWR polling / FastAPI long-polling (`REALTIME=off`).
3. **Rust SLA & Scoring Engine (`services/engine-rust/`):**
   - *Why it exists:* High-throughput batch re-evaluation of travel SLAs across active records (design target: sub-millisecond execution, benchmark pending).
   - *Python Fallback:* Pure-function reference implementation in `backend/services/sla_engine.py` (`SLA_ENGINE=python`).
4. **Go Export Service (`services/export-go/`):**
   - *Why it exists:* Low-memory streaming CSV exports for historical operations datasets (design target, benchmark pending).
   - *Python Fallback:* FastAPI `StreamingResponse` with generator chunking (`EXPORT=fastapi`).

---

## Monorepo Layout
```text
opsdesk/
├── backend/                  # FastAPI core application, services, tests, and seed generator
├── services/
│   ├── realtime-go/          # Go SSE Realtime Gateway (contracts & skeleton)
│   ├── engine-rust/          # Rust SLA & Scoring Engine (contracts & skeleton)
│   └── export-go/            # Go CSV Export Service (contracts & skeleton)
├── contracts/                # Shared JSON Schemas and Golden Vectors
├── docs/                     # Architecture & Design documentation
├── frontend/                 # Next.js 15 UI (Milestone 2+)
├── .env.example              # Environment configuration & feature flags
├── opsdesk.db                # SQLite local database (untracked, .gitignore)
├── pytest.ini                # Pytest configuration
└── README.md                 # System overview
```
