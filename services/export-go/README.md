# Go Export Service

## Overview
This service handles un-capped streaming CSV and Excel exports of historical travel operations records directly from the database cursor.

- **Why it exists:** Provides low-memory streaming exports for large datasets, eliminating arbitrary 3,000-row export limits imposed by legacy SaaS ticketing systems.
- **Python Fallback:** When `EXPORT=fastapi` (default), FastAPI's native `StreamingResponse` with Python chunked generators is used directly.
- **Status:** Skeleton & design documentation for prototype decoupling. No Go toolchain or compilation is required in Milestone 1.
