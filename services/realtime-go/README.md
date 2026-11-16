# Go Realtime Gateway Service (SSE)

## Overview
This service consumes events from the `events_outbox` table and broadcasts them to connected browsers via Server-Sent Events (SSE).

- **Why it exists:** Extremely low memory and CPU footprint for maintaining thousands of concurrent persistent SSE connections.
- **Python Fallback:** When `REALTIME=off`, clients fall back to interval-based SWR polling against FastAPI `/api/tickets`.
- **Contract:** Defined in `contracts/events.schema.json`.
- **Tenant Isolation:** Enforces role and agency scoping. Events with `visibility='internal'` are stripped before dispatching to agency requester clients.

*Note: In Milestone 1, this directory holds only the contract and skeleton. No Go code is compiled in this milestone.*
