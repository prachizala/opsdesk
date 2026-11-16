"""
OpsDesk Synthetic Load & Concurrency Benchmark
Measures latency (p50, p95, p99), HTTP status distribution, and DB locking under load.
Runs against a running OpsDesk server (pointed to a temporary copy of the database).

NOTE: These figures are measured on this specific development machine
(Windows, single uvicorn worker, SQLite in WAL mode with busy_timeout=5000).
They are NOT production SLA guarantees.
"""

import sys
import time
import uuid
import asyncio
import argparse
from typing import List, Dict, Any
from datetime import datetime, timedelta

try:
    import httpx
except ImportError:
    try:
        import httpx2 as httpx
    except ImportError:
        print("httpx is required.")
        sys.exit(1)


def percentile(data: List[float], p: float) -> float:
    if not data:
        return 0.0
    sorted_data = sorted(data)
    k = (len(sorted_data) - 1) * (p / 100.0)
    f = int(k)
    c = min(f + 1, len(sorted_data) - 1)
    d = k - f
    return sorted_data[f] + d * (sorted_data[c] - sorted_data[f])


class BenchmarkRunner:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    async def scenario_read_heavy(self, total_requests: int = 200, concurrency: int = 20) -> Dict[str, Any]:
        """Scenario 1: Read-heavy burst of GET /api/tickets?view=triage."""
        latencies: List[float] = []
        statuses: Dict[int, int] = {}
        locked_errors = 0
        sem = asyncio.Semaphore(concurrency)

        async with httpx.AsyncClient(base_url=self.base_url, timeout=30.0) as client:
            async def single_read(idx: int):
                nonlocal locked_errors
                async with sem:
                    user_id = ["USR-101", "USR-102", "USR-103", "USR-104"][idx % 4]
                    t0 = time.perf_counter()
                    try:
                        resp = await client.get("/api/tickets?view=triage&limit=20", headers={"X-User-Id": user_id})
                        elapsed = (time.perf_counter() - t0) * 1000.0
                        latencies.append(elapsed)
                        statuses[resp.status_code] = statuses.get(resp.status_code, 0) + 1
                        if "database is locked" in resp.text.lower():
                            locked_errors += 1
                    except Exception as e:
                        elapsed = (time.perf_counter() - t0) * 1000.0
                        latencies.append(elapsed)
                        statuses[599] = statuses.get(599, 0) + 1
                        if "locked" in str(e).lower():
                            locked_errors += 1

            tasks = [single_read(i) for i in range(total_requests)]
            await asyncio.gather(*tasks)

        return {
            "name": "Scenario 1: Read-Heavy Triage (GET /api/tickets?view=triage)",
            "total": total_requests,
            "concurrency": concurrency,
            "latencies": latencies,
            "statuses": statuses,
            "locked_errors": locked_errors,
        }

    async def scenario_mixed_read_write(self, iterations: int = 40, concurrency: int = 10) -> Dict[str, Any]:
        """Scenario 2: Concurrent mix of reads, ticket creation, and assignment."""
        latencies: List[float] = []
        statuses: Dict[int, int] = {}
        locked_errors = 0
        sem = asyncio.Semaphore(concurrency)

        async with httpx.AsyncClient(base_url=self.base_url, timeout=30.0) as client:
            async def write_read_cycle(idx: int):
                nonlocal locked_errors
                async with sem:
                    user_id = ["USR-101", "USR-102", "USR-103", "USR-104"][idx % 4]
                    tboh = f"TBOH-LOAD-{uuid.uuid4().hex[:8]}"

                    # 1. Create Ticket
                    t0 = time.perf_counter()
                    create_payload = {
                        "agency_id": "AGY-001",
                        "tboh_id": tboh,
                        "title": f"Load Test Ticket {idx}",
                        "description": "Load test description testing concurrency and DB locks",
                        "priority": "Medium",
                        "check_in_date": (datetime.utcnow() + timedelta(days=7)).isoformat(),
                        "lcd_date": (datetime.utcnow() + timedelta(days=6)).isoformat(),
                        "first_message": "Automated load bench message"
                    }
                    try:
                        resp_create = await client.post(
                            "/api/tickets",
                            json=create_payload,
                            headers={"X-User-Id": "USR-201", "Idempotency-Key": str(uuid.uuid4())}
                        )
                        elapsed = (time.perf_counter() - t0) * 1000.0
                        latencies.append(elapsed)
                        statuses[resp_create.status_code] = statuses.get(resp_create.status_code, 0) + 1
                        if "database is locked" in resp_create.text.lower():
                            locked_errors += 1
                        created_id = resp_create.json().get("id") if resp_create.status_code == 201 else None
                    except Exception as e:
                        elapsed = (time.perf_counter() - t0) * 1000.0
                        latencies.append(elapsed)
                        statuses[599] = statuses.get(599, 0) + 1
                        created_id = None
                        if "locked" in str(e).lower():
                            locked_errors += 1

                    # 2. Assign Ticket (if created)
                    if created_id:
                        t0 = time.perf_counter()
                        try:
                            resp_assign = await client.post(
                                f"/api/tickets/{created_id}/assign",
                                json={"agent_id": "USR-101"},
                                headers={"X-User-Id": "USR-101"}
                            )
                            elapsed = (time.perf_counter() - t0) * 1000.0
                            latencies.append(elapsed)
                            statuses[resp_assign.status_code] = statuses.get(resp_assign.status_code, 0) + 1
                            if "database is locked" in resp_assign.text.lower():
                                locked_errors += 1
                        except Exception as e:
                            elapsed = (time.perf_counter() - t0) * 1000.0
                            latencies.append(elapsed)
                            statuses[599] = statuses.get(599, 0) + 1
                            if "locked" in str(e).lower():
                                locked_errors += 1

                    # 3. Read Queue
                    t0 = time.perf_counter()
                    try:
                        resp_read = await client.get("/api/tickets?view=triage&limit=15", headers={"X-User-Id": user_id})
                        elapsed = (time.perf_counter() - t0) * 1000.0
                        latencies.append(elapsed)
                        statuses[resp_read.status_code] = statuses.get(resp_read.status_code, 0) + 1
                        if "database is locked" in resp_read.text.lower():
                            locked_errors += 1
                    except Exception as e:
                        elapsed = (time.perf_counter() - t0) * 1000.0
                        latencies.append(elapsed)
                        statuses[599] = statuses.get(599, 0) + 1
                        if "locked" in str(e).lower():
                            locked_errors += 1

            tasks = [write_read_cycle(i) for i in range(iterations)]
            await asyncio.gather(*tasks)

        return {
            "name": "Scenario 2: Mixed Read/Write Concurrency (POST ticket + POST assign + GET triage)",
            "total": len(latencies),
            "concurrency": concurrency,
            "latencies": latencies,
            "statuses": statuses,
            "locked_errors": locked_errors,
        }

    async def scenario_export_and_reads(self, export_count: int = 6, read_count: int = 50) -> Dict[str, Any]:
        """Scenario 3: Concurrent CSV export requests alongside queue reads to test export semaphore and saturation."""
        latencies: List[float] = []
        statuses: Dict[int, int] = {}
        locked_errors = 0

        async with httpx.AsyncClient(base_url=self.base_url, timeout=30.0) as client:
            async def fire_export(idx: int):
                nonlocal locked_errors
                t0 = time.perf_counter()
                try:
                    resp = await client.get("/api/export/tickets.csv", headers={"X-User-Id": "USR-104"})
                    elapsed = (time.perf_counter() - t0) * 1000.0
                    latencies.append(elapsed)
                    statuses[resp.status_code] = statuses.get(resp.status_code, 0) + 1
                    if "database is locked" in resp.text.lower():
                        locked_errors += 1
                except Exception as e:
                    elapsed = (time.perf_counter() - t0) * 1000.0
                    latencies.append(elapsed)
                    statuses[599] = statuses.get(599, 0) + 1
                    if "locked" in str(e).lower():
                        locked_errors += 1

            async def fire_read(idx: int):
                nonlocal locked_errors
                t0 = time.perf_counter()
                try:
                    user_id = ["USR-101", "USR-102", "USR-103", "USR-104"][idx % 4]
                    resp = await client.get("/api/tickets?view=triage&limit=20", headers={"X-User-Id": user_id})
                    elapsed = (time.perf_counter() - t0) * 1000.0
                    latencies.append(elapsed)
                    statuses[resp.status_code] = statuses.get(resp.status_code, 0) + 1
                    if "database is locked" in resp.text.lower():
                        locked_errors += 1
                except Exception as e:
                    elapsed = (time.perf_counter() - t0) * 1000.0
                    latencies.append(elapsed)
                    statuses[599] = statuses.get(599, 0) + 1
                    if "locked" in str(e).lower():
                        locked_errors += 1

            tasks = [fire_export(i) for i in range(export_count)] + [fire_read(i) for i in range(read_count)]
            await asyncio.gather(*tasks)

        return {
            "name": "Scenario 3: Concurrent CSV Exports + Queue Reads (concurrency limiter testing)",
            "total": len(latencies),
            "concurrency": export_count + read_count,
            "latencies": latencies,
            "statuses": statuses,
            "locked_errors": locked_errors,
        }


def print_report(results: List[Dict[str, Any]]):
    print("=" * 80)
    print("OPSDESK LOAD & CONCURRENCY BENCHMARK RESULTS")
    print("Machine Environment: Windows 11, local Python 3.11, single uvicorn worker")
    print("Database: SQLite WAL mode (busy_timeout=5000, synchronous=NORMAL)")
    print("DISCLAIMER: Measured on this local machine. These are not production SLA numbers.")
    print("=" * 80)

    for r in results:
        lats = r["latencies"]
        p50 = percentile(lats, 50)
        p95 = percentile(lats, 95)
        p99 = percentile(lats, 99)
        avg = sum(lats) / len(lats) if lats else 0.0
        min_lat = min(lats) if lats else 0.0
        max_lat = max(lats) if lats else 0.0

        print(f"\n--- {r['name']} ---")
        print(f"Total Requests:       {r['total']}")
        print(f"Status Breakdown:     {dict(sorted(r['statuses'].items()))}")
        print(f"DB 'locked' errors:   {r['locked_errors']}")
        print(f"Latency min / avg:    {min_lat:.2f} ms / {avg:.2f} ms")
        print(f"Latency p50:          {p50:.2f} ms")
        print(f"Latency p95:          {p95:.2f} ms")
        print(f"Latency p99:          {p99:.2f} ms")
        print(f"Latency max:          {max_lat:.2f} ms")
    print("\n" + "=" * 80)


async def main():
    parser = argparse.ArgumentParser(description="Run OpsDesk synthetic load test")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000", help="Base URL of OpsDesk API")
    args = parser.parse_args()

    runner = BenchmarkRunner(base_url=args.base_url)

    # Verify server is alive
    async with httpx.AsyncClient(base_url=args.base_url, timeout=5.0) as client:
        try:
            r = await client.get("/ready")
            if r.status_code != 200:
                r = await client.get("/health")
        except Exception:
            try:
                r = await client.get("/health")
            except Exception as e:
                print(f"Error connecting to server at {args.base_url}: {e}")
                sys.exit(1)

    import os
    rate_limit_env = os.environ.get("RATE_LIMIT_PER_MINUTE", "120 (default)")
    print(f"Target server {args.base_url} is ready.")
    print(f"RATE_LIMIT_PER_MINUTE environment setting: {rate_limit_env}")
    print("Starting benchmark scenarios...")

    s1 = await runner.scenario_read_heavy(total_requests=150, concurrency=15)
    s2 = await runner.scenario_mixed_read_write(iterations=30, concurrency=10)
    s3 = await runner.scenario_export_and_reads(export_count=6, read_count=40)

    print_report([s1, s2, s3])


if __name__ == "__main__":
    asyncio.run(main())
