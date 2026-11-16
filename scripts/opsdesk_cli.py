#!/usr/bin/env python3
"""
OpsDesk Operations CLI
Interactive terminal diagnostics and queue inspection utility for operations leads and developers.

Usage:
    python scripts/opsdesk_cli.py queue [--view triage|my_queue|linked] [--limit 10]
    python scripts/opsdesk_cli.py inspect <TCK-ID>
    python scripts/opsdesk_cli.py themes [--days 7]
    python scripts/opsdesk_cli.py export [--output backup.csv]
"""

import sys
import os
import argparse
import urllib.request
import urllib.parse
import urllib.error
import json

DEFAULT_HOST = os.getenv("OPSDESK_API_URL", "http://127.0.0.1:8000")
DEFAULT_USER = os.getenv("OPSDESK_USER_ID", "USR-104")  # Elena Rostova (Lead)

def make_request(path: str, user_id: str = DEFAULT_USER) -> dict:
    url = f"{DEFAULT_HOST}{path}"
    req = urllib.request.Request(url, headers={"X-User-Id": user_id, "User-Agent": "OpsDesk-CLI/1.0"})
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_detail = e.read().decode("utf-8")
        print(f"\033[91m[Error {e.code}]\033[0m {error_detail}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"\033[91m[Connection Error]\033[0m Could not connect to {url}: {e.reason}")
        print("Ensure the FastAPI backend is running: uvicorn backend.app.main:app --port 8000")
        sys.exit(1)

def cmd_queue(args):
    path = f"/api/tickets?view={args.view}&limit={args.limit}"
    if args.search:
        path += f"&search={urllib.parse.quote(args.search)}"
    if args.priority:
        path += f"&priority={urllib.parse.quote(args.priority)}"

    data = make_request(path)
    tickets = data.get("tickets", [])
    total = data.get("total", len(tickets))

    print(f"\n\033[1;36m=== OpsDesk Queue: {args.view.upper()} (Total: {total}) ===\033[0m\n")
    print(f"{'TICKET ID':<12} {'TBOH REF':<12} {'PRIORITY':<9} {'STATUS':<10} {'SLA STATUS':<12} {'REMAINING':<10} {'TITLE'}")
    print("-" * 90)

    for t in tickets:
        sla = t.get("sla", {})
        color_code = "\033[0m"
        if sla.get("status") == "BREACHED":
            color_code = "\033[91m"
        elif sla.get("status") == "AT_RISK":
            color_code = "\033[93m"
        elif sla.get("status") == "NORMAL":
            color_code = "\033[92m"

        hrs = f"{sla.get('hours_remaining', 0):.1f}h" if sla.get("hours_remaining") is not None else "Stopped"
        print(f"{t['id']:<12} {t['tboh_id']:<12} {t['priority']:<9} {t['status']:<10} {color_code}{sla.get('status', 'N/A'):<12}\033[0m {hrs:<10} {t['title'][:32]}")
    print()

def cmd_inspect(args):
    ticket_id = args.ticket_id.upper()
    data = make_request(f"/api/tickets/{ticket_id}")

    print(f"\n\033[1;36m=== Case 360 Deep Inspection: {data['id']} ===\033[0m")
    print(f"Title:        {data['title']}")
    print(f"Booking REF:  {data['tboh_id']}")
    print(f"Agency ID:    {data['agency_id']}")
    print(f"Status:       {data['status']} | Priority: {data['priority']} | Intent: {data.get('intent', 'N/A')}")
    print(f"Assigned To:  {data.get('assigned_to') or 'Unassigned'}")
    print(f"Routing Rule: {data.get('routing_reason') or 'None'}")
    
    sla = data.get("sla", {})
    print(f"Travel SLA:   {sla.get('badge', 'N/A')} ({sla.get('status', 'N/A')})")
    print(f"Check-In:     {data.get('check_in_date')}")
    print(f"LCD Date:     {data.get('lcd_date') or 'None'}")
    print(f"Linked Cases: {', '.join(data.get('linked_ticket_ids', [])) or 'None (Isolated booking)'}")
    print(f"Side Threads: {len(data.get('side_conversations', []))} active supplier conversations")
    print()

def cmd_themes(args):
    data = make_request(f"/api/insights/themes?days={args.days}")
    themes = data.get("themes", [])

    print(f"\n\033[1;36m=== Top Root Cause Themes ({args.days}-Day Window) ===\033[0m\n")
    print(f"Total Tagged Records: {data.get('total_tagged_records', 0)}\n")
    print(f"{'PERCENT':<10} {'COUNT':<8} {'THEME':<30} {'SAMPLE TICKETS'}")
    print("-" * 75)

    for th in themes:
        samples = ", ".join(th.get("sample_ticket_ids", []))
        print(f"{th.get('percentage', 0):>5.1f}%    {th.get('count', 0):<8} {th.get('theme', 'N/A'):<30} {samples}")
    print()

def main():
    parser = argparse.ArgumentParser(description="OpsDesk Terminal Diagnostics & Operations Tool")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Queue command
    p_queue = subparsers.add_parser("queue", help="Inspect operations queue")
    p_queue.add_argument("--view", default="triage", choices=["triage", "my_queue", "by_region", "by_intent", "linked"])
    p_queue.add_argument("--limit", type=int, default=15)
    p_queue.add_argument("--search", default=None)
    p_queue.add_argument("--priority", default=None)
    p_queue.set_defaults(func=cmd_queue)

    # Inspect command
    p_inspect = subparsers.add_parser("inspect", help="Inspect detailed 360 view of a case")
    p_inspect.add_argument("ticket_id", help="Ticket ID (e.g. TCK-1001)")
    p_inspect.set_defaults(func=cmd_inspect)

    # Themes command
    p_themes = subparsers.add_parser("themes", help="Inspect root cause themes")
    p_themes.add_argument("--days", type=int, default=7)
    p_themes.set_defaults(func=cmd_themes)

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()
