# Rust SLA & Scoring Engine

## Overview
This service provides pure functional mathematical computations for travel SLA countdowns and queue ranking.

- **Why it exists:** High-throughput batch recalculation of travel SLA timers across large active operations queues (design target: low latency per batch, benchmark pending / not measured).
- **Implementation Status:** `SLA_ENGINE` is RESERVED, not read by code; the Python reference implementation in `backend/services/sla_engine.py` and `backend/services/routing_engine.py` is the only active implementation.
- **Contract:** Defined in `contracts/sla_engine.schema.json`.
- **Verification:** Both the Python reference implementation and the Rust engine must achieve 100% test pass on `contracts/golden_vectors.json`.

*Note: In Milestone 1, this directory holds only the contract and skeleton. No Rust toolchain or build is executed.*
