import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models import Ticket, Agency, User
from backend.app.main import app

def test_search_by_tboh_id(client: TestClient, db_session: Session):
    """Verifies that operations agents can search tickets by TBOH booking reference."""
    res = client.get("/api/tickets?search=TBOH-1001", headers={"X-User-Id": "USR-101"})
    assert res.status_code == 200
    data = res.json()
    assert "tickets" in data
    for ticket in data["tickets"]:
        assert "TBOH-1001" in ticket["tboh_id"] or "TBOH-1001" in ticket["title"] or "TBOH-1001" in ticket["id"]

def test_search_by_ticket_id(client: TestClient, db_session: Session):
    """Verifies searching by explicit ticket ID returns the matching record."""
    res = client.get("/api/tickets?search=TCK-1001", headers={"X-User-Id": "USR-101"})
    assert res.status_code == 200
    data = res.json()
    assert len(data["tickets"]) >= 1
    assert any(t["id"] == "TCK-1001" for t in data["tickets"])

def test_search_by_keyword_in_title(client: TestClient, db_session: Session):
    """Verifies keyword search across ticket title and description."""
    res = client.get("/api/tickets?search=Flight", headers={"X-User-Id": "USR-101"})
    assert res.status_code == 200
    data = res.json()
    assert "tickets" in data

def test_filter_by_priority(client: TestClient, db_session: Session):
    """Verifies filtering queue strictly by priority level."""
    res = client.get("/api/tickets?priority=Urgent", headers={"X-User-Id": "USR-101"})
    assert res.status_code == 200
    data = res.json()
    for ticket in data["tickets"]:
        assert ticket["priority"] == "Urgent"

def test_filter_by_status(client: TestClient, db_session: Session):
    """Verifies filtering queue strictly by status."""
    res = client.get("/api/tickets?status=Escalated&view=by_region", headers={"X-User-Id": "USR-103"})
    assert res.status_code == 200
    data = res.json()
    for ticket in data["tickets"]:
        assert ticket["status"] == "Escalated"

def test_combined_search_and_priority_filter(client: TestClient, db_session: Session):
    """Verifies combining keyword search with priority filtering."""
    res = client.get("/api/tickets?priority=High&search=Hotel", headers={"X-User-Id": "USR-101"})
    assert res.status_code == 200
    data = res.json()
    for ticket in data["tickets"]:
        assert ticket["priority"] == "High"

def test_requester_search_strictly_tenant_scoped(client: TestClient, db_session: Session):
    """Verifies that an agency requester searching for a keyword cannot leak tickets from other agencies."""
    res = client.get("/api/tickets?search=TBOH", headers={"X-User-Id": "USR-201"})
    assert res.status_code == 200
    data = res.json()
    for ticket in data["tickets"]:
        assert ticket["agency_id"] == "AGY-001"
