# OpsDesk: B2B Travel Operations Case Management Platform

OpsDesk replaces fragmented ticketing in travel operations with context-linked cases organized around travel reality:
- **First-Class TBOH Linkage:** Surfaces prior contacts sharing the same TBO Booking Reference (`TBOH_ID`) without third-party add-ons.
- **Travel-Aware SLA Engine:** Dynamically calculates countdowns based on guest check-in proximity and Last Cancellation Date (LCD).
- **2-Tier Routing Engine:** 
  - Tier 1: Selects available regional agents based on workload.
  - Tier 2: Ranks the operations queue based on check-in urgency and priority.
- **Transfer-Proof Supplier Threads:** Decouples supplier conversation recipients from assigned agents, preserving threads across transfers.
- **Uncapped Ops Data Path:** Eliminates artificial 3,000-row export barriers via direct database streaming.

---

## Modular Architecture & Sidecar Contracts
The system is built as a modular monorepo with Python FastAPI as the core source of truth and decoupled sidecar extensions:

1. **Python FastAPI Backend (`backend/`):**
   - Source of truth for authentication, RBAC, CRUD, routing orchestration, and Gemini 3.5 Flash-Lite intent suggestions.
2. **Go Realtime Gateway (`services/realtime-go/`):**
   - *Why it exists:* Provides high-concurrency Server-Sent Events (SSE) broadcasting from the `events_outbox` table.
   - *Python Fallback:* Client-side SWR polling / FastAPI long-polling (`REALTIME=off`).
3. **Rust SLA & Scoring Engine (`services/engine-rust/`):**
   - *Why it exists:* Zero-allocation, high-throughput batch re-evaluation of travel SLAs across 50,000+ active records.
   - *Python Fallback:* Pure-function reference implementation in `backend/services/sla_engine.py` (`SLA_ENGINE=python`).
4. **Go Export Service (`services/export-go/`):**
   - *Why it exists:* Zero-copy streaming CSV exports for massive historical datasets.
   - *Python Fallback:* FastAPI `StreamingResponse` with generator chunking (`EXPORT=fastapi`).

---

## Monorepo Layout
```text
opsdesk/
├── backend/                  # FastAPI core application, services, tests, and seed generator
├── services/
│   ├── realtime-go/          # Go SSE Realtime Gateway (contracts & skeleton)
│   └── engine-rust/          # Rust SLA & Scoring Engine (contracts & skeleton)
├── contracts/                # Shared JSON Schemas and Golden Vectors
├── docs/                     # Architecture & Design documentation
├── frontend/                 # Next.js 15 UI (Milestone 2+)
├── .env.example              # Environment configuration & feature flags
├── opsdesk.db                # SQLite local database
├── pytest.ini                # Pytest configuration
└── README.md                 # System overview
```
