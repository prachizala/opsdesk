# Rust SLA & Scoring Engine

## Overview
This service provides pure functional mathematical computations for travel SLA countdowns and queue ranking.

- **Why it exists:** High-throughput batch recalculation of travel SLA timers across large active operations queues (design target: sub-millisecond per batch, benchmark pending).
- **Python Fallback:** When `SLA_ENGINE=python` (default), the reference implementation in `backend/services/sla_engine.py` and `backend/services/routing_engine.py` is invoked directly.
- **Contract:** Defined in `contracts/sla_engine.schema.json`.
- **Verification:** Both the Python reference implementation and the Rust engine must achieve 100% test pass on `contracts/golden_vectors.json`.

*Note: In Milestone 1, this directory holds only the contract and skeleton. No Rust toolchain or build is executed.*
