# Rust SLA & Scoring Engine

## Overview
This service provides pure functional mathematical computations for travel SLA countdowns and queue ranking.

- **Why it exists:** Provides sub-millisecond execution for batch recalculation across 50,000+ active operations cases.
- **Python Fallback:** When `SLA_ENGINE=python` (default), the reference implementation in `backend/services/sla_engine.py` and `backend/services/routing_engine.py` is invoked directly.
- **Contract:** Defined in `contracts/sla_engine.schema.json`.
- **Verification:** Both the Python reference implementation and the Rust engine must achieve 100% test pass on `contracts/golden_vectors.json`.

*Note: In Milestone 1, this directory holds only the contract and skeleton. No Rust code is compiled in this milestone.*
