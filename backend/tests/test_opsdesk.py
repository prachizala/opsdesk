import os
import json
import uuid
import sqlite3
import tempfile
from datetime import datetime, timedelta
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from backend.app.database import Base, get_db
from backend.app.models import (
    Agency, User, Ticket, TicketLink, SideConversation,
    SideConversationRecipient, TicketTheme, EventOutbox, TicketMessage
)
from backend.app.main import app
from backend.services.routing_engine import (
    CandidateAgent,
    select_agent_tier1,
    calculate_queue_score_tier2
)
from backend.services.sla_engine import evaluate_travel_sla
from backend.services.intent_classifier import suggest_ticket_intent
from backend.seed.seed_data import seed_database

# ============================================================================
# 0. TEST DATABASE ISOLATION FIXTURES
# ============================================================================

@pytest.fixture(scope="session")
def test_db_setup():
    """
    Creates an isolated temporary SQLite database for tests.
    Guarantees dev opsdesk.db is NEVER touched, cleared, or altered by test suite.
    """
    temp_dir = tempfile.gettempdir()
    db_file = os.path.join(temp_dir, f"test_opsdesk_{uuid.uuid4().hex[:8]}.db")
    engine = create_engine(f"sqlite:///{db_file}", connect_args={"check_same_thread": False})
    
    # Seed the isolated test database
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestSessionLocal()
    seed_database(session, engine_bind=engine, total_tickets=5000)
    session.close()

    yield engine, TestSessionLocal

    engine.dispose()
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
        except Exception:
            pass

@pytest.fixture(scope="function")
def db_session(test_db_setup):
    """Provides a transactional session on the isolated test database."""
    _, TestSessionLocal = test_db_setup
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture(scope="session")
def client(test_db_setup):
    """Configures FastAPI TestClient overriding get_db with the isolated test DB."""
    engine, TestSessionLocal = test_db_setup

    def override_get_db():
        db = TestSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ============================================================================
# 1. DATABASE ISOLATION VERIFICATION TEST
# ============================================================================

def test_dev_database_isolation():
    """
    PROVE TEST DB ISOLATION:
    Verifies that the development database (opsdesk.db) remains untouched
    with exactly 5,000 seeded tickets while test suite operates in isolation.
    """
    dev_db_path = os.path.join(os.getcwd(), "opsdesk.db")
    assert os.path.exists(dev_db_path), "Development database opsdesk.db must exist"
    conn = sqlite3.connect(dev_db_path)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM tickets")
    dev_count = c.fetchone()[0]
    conn.close()
    assert dev_count == 5000, f"Expected dev DB to hold 5000 tickets, found {dev_count}"


# ============================================================================
# 2. ROUTING ENGINE TESTS
# ============================================================================

def test_routing_region_match():
    """Agent in matching region is selected when available."""
    agents = [
        CandidateAgent(id="USR-1", name="Aisha", region="MEA", is_available=True, active_ticket_count=2),
        CandidateAgent(id="USR-2", name="Rahul", region="APAC", is_available=True, active_ticket_count=0),
    ]
    chosen_id, reason = select_agent_tier1("AE", agents)
    assert chosen_id == "USR-1"
    assert "Region=MEA match" in reason

def test_routing_availability_false():
    """Unavailable agent is strictly filtered out."""
    agents = [
        CandidateAgent(id="USR-1", name="Aisha", region="MEA", is_available=False, active_ticket_count=0),
        CandidateAgent(id="USR-2", name="Farah", region="MEA", is_available=True, active_ticket_count=2),
    ]
    chosen_id, reason = select_agent_tier1("AE", agents)
    assert chosen_id == "USR-2"
    assert "Farah" in reason

def test_routing_empty_pool_fallback():
    """When target regional desk has zero available agents, fallback to available agent from another desk."""
    agents = [
        CandidateAgent(id="USR-1", name="Aisha", region="MEA", is_available=False, active_ticket_count=0),
        CandidateAgent(id="USR-2", name="Vikram", region="APAC", is_available=True, active_ticket_count=1),
    ]
    chosen_id, reason = select_agent_tier1("AE", agents)
    assert chosen_id == "USR-2"
    assert "Tier-1 Fallback" in reason

def test_routing_workload_tie_breaking():
    """When regional agents have equal workloads, tie is broken deterministically by ID."""
    agents = [
        CandidateAgent(id="USR-B", name="Bob", region="MEA", is_available=True, active_ticket_count=1),
        CandidateAgent(id="USR-A", name="Alice", region="MEA", is_available=True, active_ticket_count=1),
    ]
    chosen_id, reason = select_agent_tier1("AE", agents)
    assert chosen_id == "USR-A"

def test_routing_tier2_queue_score():
    """Tier 2 calculates higher score for urgent cases with near check-in."""
    now = datetime.utcnow()
    score_urgent_imminent = calculate_queue_score_tier2(
        priority="Urgent",
        check_in_date=now + timedelta(hours=1),
        now=now
    )
    score_low_distant = calculate_queue_score_tier2(
        priority="Low",
        check_in_date=now + timedelta(days=5),
        now=now
    )
    assert score_urgent_imminent > score_low_distant
    assert score_urgent_imminent == 3000.0


# ============================================================================
# 3. SLA ENGINE TESTS
# ============================================================================

def test_sla_stopped_on_closed_or_resolved():
    """Resolved and Closed tickets stop the SLA clock with Gray badge."""
    now = datetime.utcnow()
    past_date = now - timedelta(days=2)
    
    res_closed = evaluate_travel_sla(
        status="Closed",
        check_in_date=past_date,
        lcd_date=past_date,
        priority="Urgent",
        now=now
    )
    assert res_closed["status"] == "STOPPED"
    assert res_closed["color"] == "Gray"
    assert res_closed["hours_remaining"] is None

    res_resolved = evaluate_travel_sla(
        status="Resolved",
        check_in_date=past_date,
        lcd_date=past_date,
        priority="Medium",
        now=now
    )
    assert res_resolved["status"] == "STOPPED"
    assert res_resolved["color"] == "Gray"

def test_sla_breached_when_past_checkin():
    """Active ticket with past check-in/LCD is BREACHED (Red)."""
    now = datetime.utcnow()
    past_date = now - timedelta(hours=1)
    
    res = evaluate_travel_sla(
        status="Open",
        check_in_date=past_date,
        lcd_date=past_date,
        priority="High",
        now=now
    )
    assert res["status"] == "BREACHED"
    assert res["color"] == "Red"
    assert res["hours_remaining"] < 0

def test_sla_at_risk_amber():
    """Active ticket within warning window is AT_RISK (Amber)."""
    now = datetime.utcnow()
    near_date = now + timedelta(hours=1.5)
    
    res = evaluate_travel_sla(
        status="Open",
        check_in_date=near_date,
        lcd_date=near_date,
        priority="Medium",
        now=now
    )
    assert res["status"] == "AT_RISK"
    assert res["color"] == "Amber"
    assert 0 < res["hours_remaining"] <= 2.0

def test_sla_priority_modifies_threshold():
    """5.0 hours remaining is AT_RISK for Urgent (threshold=6h), but NORMAL for Medium (threshold=2h)."""
    now = datetime.utcnow()
    date_5h = now + timedelta(hours=5.0)
    
    res_urgent = evaluate_travel_sla(
        status="Open",
        check_in_date=date_5h,
        lcd_date=date_5h,
        priority="Urgent",
        now=now
    )
    assert res_urgent["status"] == "AT_RISK"
    assert res_urgent["color"] == "Amber"

    res_medium = evaluate_travel_sla(
        status="Open",
        check_in_date=date_5h,
        lcd_date=date_5h,
        priority="Medium",
        now=now
    )
    assert res_medium["status"] == "NORMAL"
    assert res_medium["color"] == "Green"


# ============================================================================
# 4. GOLDEN VECTORS COMPLIANCE TEST (CONTRACTS VERIFICATION)
# ============================================================================

def test_contracts_golden_vectors():
    """
    Verifies that the Python reference implementations match 100% of the
    golden vector test cases defined in contracts/golden_vectors.json.
    """
    golden_path = os.path.join(os.getcwd(), "contracts", "golden_vectors.json")
    with open(golden_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. Verify all SLA cases
    assert len(data["sla_cases"]) >= 20
    for case in data["sla_cases"]:
        inp = case["input"]
        exp = case["expected_output"]
        now = datetime.fromisoformat(inp["now"].replace("Z", ""))
        cid = datetime.fromisoformat(inp["check_in_date"].replace("Z", ""))
        lcd = datetime.fromisoformat(inp["lcd_date"].replace("Z", ""))
        
        act = evaluate_travel_sla(
            status=inp["status"],
            check_in_date=cid,
            lcd_date=lcd,
            priority=inp["priority"],
            now=now
        )
        assert act["status"] == exp["status"], f"Case {case['case_id']} status mismatch: {act['status']} != {exp['status']}"
        assert act["color"] == exp["color"], f"Case {case['case_id']} color mismatch: {act['color']} != {exp['color']}"
        assert act["badge"] == exp["badge"], f"Case {case['case_id']} badge mismatch: {act['badge']} != {exp['badge']}"
        if exp["hours_remaining"] is not None:
            assert abs(act["hours_remaining"] - exp["hours_remaining"]) < 0.01

    # 2. Verify all Queue Score cases
    assert len(data["queue_score_cases"]) >= 10
    for case in data["queue_score_cases"]:
        inp = case["input"]
        exp = case["expected_output"]
        now = datetime.fromisoformat(inp["now"].replace("Z", ""))
        cid = datetime.fromisoformat(inp["check_in_date"].replace("Z", ""))
        
        score = calculate_queue_score_tier2(
            priority=inp["priority"],
            check_in_date=cid,
            now=now
        )
        assert score == exp["score"], f"Queue case {case['case_id']} mismatch: {score} != {exp['score']}"


# ============================================================================
# 5. INTENT CLASSIFIER REGEX & PRECEDENCE TESTS
# ============================================================================

def test_intent_regex_refunded_inflection():
    intent, source = suggest_ticket_intent("Ticket Update", "Customer was refunded already by supplier.")
    assert intent == "Refund Request"
    assert source == "regex_rule"

def test_intent_regex_cancelled_inflection():
    intent, source = suggest_ticket_intent("Notice", "Flight was cancelled due to fog.")
    assert intent == "Cancellation Inconvenience"
    assert source == "regex_rule"

def test_intent_regex_rescheduled_inflection():
    intent, source = suggest_ticket_intent("Change request", "Please reschedule the room check-in to tomorrow.")
    assert intent == "Date Amendment"
    assert source == "regex_rule"

def test_intent_regex_kingsize_bed():
    intent, source = suggest_ticket_intent("Guest preference", "Need a king-size bed on high floor.")
    assert intent == "Bedding / Room Preference"
    assert source == "regex_rule"

def test_intent_regex_voucher():
    intent, source = suggest_ticket_intent("Documents", "Please resend the voucher copy for voucher vouchers.")
    assert intent == "Voucher Resend"
    assert source == "regex_rule"

def test_intent_both_match_precedence():
    """When both refund and cancel appear, Refund Request takes precedence."""
    intent, source = suggest_ticket_intent(
        "Refund for cancelled booking",
        "Our booking was cancelled, need refund immediately."
    )
    assert intent == "Refund Request"
    assert source == "regex_rule"

def test_intent_no_match_unclassified_fallback():
    """Unmatched text falls back to Unclassified when no Gemini key is provided."""
    os.environ["GEMINI_API_KEY"] = ""
    intent, source = suggest_ticket_intent("General inquiry", "Hello, hope you are doing well today.")
    assert intent == "Unclassified"
    assert source == "fallback_unclassified"


# ============================================================================
# 6. SEED DATA GENERATOR TESTS (RUN ON ISOLATED TEST DB)
# ============================================================================

def test_seed_row_count(db_session: Session):
    count = db_session.query(Ticket).count()
    assert count == 5000

def test_seed_zero_open_tickets_with_past_checkin(db_session: Session):
    """CRITICAL RULE: No active ticket (New, Open, Pending, Escalated) can have check-in in the past."""
    now = datetime.utcnow()
    active_statuses = ["New", "Open", "Pending", "Escalated"]
    past_active_count = db_session.query(Ticket).filter(
        Ticket.status.in_(active_statuses),
        Ticket.check_in_date < now
    ).count()
    assert past_active_count == 0

def test_seed_escalated_assigned_to_vikram(db_session: Session):
    """Verify exactly 40 tickets are seeded with Escalated status and assigned to USR-103."""
    escalated_tickets = db_session.query(Ticket).filter(Ticket.status == "Escalated").all()
    assert len(escalated_tickets) == 40
    for t in escalated_tickets:
        assert t.assigned_to == "USR-103"
        assert t.check_in_date > datetime.utcnow()

def test_seed_non_escalated_assigned_pool(db_session: Session):
    """Verify standard assigned tickets are strictly assigned to Tier-1 desk agents USR-101 and USR-102."""
    assigned_users = db_session.query(Ticket.assigned_to).filter(
        Ticket.assigned_to.isnot(None),
        Ticket.status != "Escalated"
    ).distinct().all()
    assigned_ids = {u[0] for u in assigned_users}
    assert assigned_ids.issubset({"USR-101", "USR-102"})

def test_seed_tboh_fixtures(db_session: Session):
    """Verify specific journey fixtures exist and are configured correctly."""
    # TCK-1001 & TCK-1002 share TBOH-89104 and are Closed
    t1001 = db_session.query(Ticket).filter(Ticket.id == "TCK-1001").first()
    t1002 = db_session.query(Ticket).filter(Ticket.id == "TCK-1002").first()
    assert t1001 is not None and t1002 is not None
    assert t1001.tboh_id == "TBOH-89104"
    assert t1002.tboh_id == "TBOH-89104"
    assert t1001.status == "Closed"
    assert t1002.status == "Closed"

    # TCK-1004: Urgent, MEA, ~2.5h in future. lcd_date >= check_in_date so check-in is urgent factor.
    t1004 = db_session.query(Ticket).filter(Ticket.id == "TCK-1004").first()
    assert t1004 is not None
    assert t1004.priority == "Urgent"
    assert t1004.status == "Open"
    assert t1004.check_in_date > datetime.utcnow()
    assert t1004.lcd_date >= t1004.check_in_date
    assert "active cases" in t1004.routing_reason

    # TCK-1005: Side thread with recipient
    t1005 = db_session.query(Ticket).filter(Ticket.id == "TCK-1005").first()
    assert t1005 is not None
    assert len(t1005.side_conversations) > 0
    sc = t1005.side_conversations[0]
    assert len(sc.recipients) > 0
    assert sc.recipients[0].email == "reservations@vendor.example.com"

    # TCK-1006: Urgent, ~45m in future. lcd_date >= check_in_date so check-in is urgent factor.
    t1006 = db_session.query(Ticket).filter(Ticket.id == "TCK-1006").first()
    assert t1006 is not None
    assert t1006.priority == "Urgent"
    assert t1006.status == "Open"
    assert t1006.check_in_date > datetime.utcnow()
    assert t1006.lcd_date >= t1006.check_in_date
    assert "active cases" in t1006.routing_reason


# ============================================================================
# 7. FASTAPI ENDPOINTS & ROLE MATRIX TESTS (MILESTONE 2)
# ============================================================================

def test_auth_missing_header_401(client: TestClient):
    """Missing X-User-Id header returns 401 Unauthorized."""
    resp = client.get("/api/tickets")
    assert resp.status_code == 401
    assert "Missing X-User-Id" in resp.json()["detail"]

def test_auth_unknown_user_401(client: TestClient):
    """Non-existent X-User-Id returns 401 Unauthorized."""
    resp = client.get("/api/tickets", headers={"X-User-Id": "USR-GHOST"})
    assert resp.status_code == 401
    assert "not found" in resp.json()["detail"]

def test_requester_cannot_access_other_agency_ticket_403(client: TestClient):
    """
    CRITICAL MULTI-TENANT TEST:
    USR-202 belongs to AGY-002 (Vectora Travel).
    TCK-1004 belongs to AGY-001 (Krypton Voyages).
    Accessing TCK-1004 must return 403 Forbidden.
    """
    resp = client.get("/api/tickets/TCK-1004", headers={"X-User-Id": "USR-202"})
    assert resp.status_code == 403
    assert "Forbidden" in resp.json()["detail"]

def test_requester_sees_only_own_agency_in_list(client: TestClient):
    """
    Requesters list endpoint strictly limits results to their own agency.
    """
    resp = client.get("/api/tickets", headers={"X-User-Id": "USR-201"})
    assert resp.status_code == 200
    data = resp.json()
    for t in data["tickets"]:
        assert t["agency_id"] == "AGY-001"

def test_requester_client_sent_agency_id_is_ignored(client: TestClient):
    """
    Security check: Even if a requester sends agency_id='AGY-003' in the POST body,
    the server ignores it and assigns their authentic agency_id ('AGY-001').
    """
    now = datetime.utcnow()
    payload = {
        "title": "Spoof Agency Attempt",
        "description": "Attempting to create ticket for AGY-003",
        "tboh_id": "TBOH-88221",
        "priority": "Medium",
        "check_in_date": (now + timedelta(days=5)).isoformat(),
        "lcd_date": (now + timedelta(days=5)).isoformat(),
        "agency_id": "AGY-003"  # Attacker attempt
    }
    resp = client.post("/api/tickets", json=payload, headers={"X-User-Id": "USR-201"})
    assert resp.status_code == 201
    created = resp.json()
    assert created["agency_id"] == "AGY-001"  # Overridden by server-side DB session

def test_requester_cannot_see_internal_notes(client: TestClient, db_session: Session):
    """
    Requesters viewing their own ticket detail must NEVER see InternalNote messages.
    Internal staff CAN see InternalNote messages.
    """
    # 1. Post an InternalNote as Aisha (USR-101) on TCK-1004
    note_resp = client.post(
        "/api/tickets/TCK-1004/messages",
        json={"message_type": "InternalNote", "content": "Sensitive hotel dispute note"},
        headers={"X-User-Id": "USR-101"}
    )
    assert note_resp.status_code == 201
    assert note_resp.json()["visibility"] == "internal"

    # 2. Requester (USR-201) fetches ticket TCK-1004
    req_resp = client.get("/api/tickets/TCK-1004", headers={"X-User-Id": "USR-201"})
    assert req_resp.status_code == 200
    for msg in req_resp.json()["messages"]:
        assert msg["message_type"] != "InternalNote"
        assert "Sensitive hotel dispute note" not in msg["content"]

    # 3. Agent (USR-101) fetches ticket TCK-1004 and CAN see the note
    agent_resp = client.get("/api/tickets/TCK-1004", headers={"X-User-Id": "USR-101"})
    assert agent_resp.status_code == 200
    contents = [m["content"] for m in agent_resp.json()["messages"]]
    assert "Sensitive hotel dispute note" in contents

def test_requester_cannot_post_internal_note_403(client: TestClient):
    """Requesters posting message_type='InternalNote' receive 403 Forbidden."""
    resp = client.post(
        "/api/tickets/TCK-1004/messages",
        json={"message_type": "InternalNote", "content": "Illegitimate note attempt"},
        headers={"X-User-Id": "USR-201"}
    )
    assert resp.status_code == 403

def test_requester_cannot_access_side_threads_403(client: TestClient):
    """Requesters attempting to view or create side conversations receive 403 Forbidden."""
    get_resp = client.get("/api/tickets/TCK-1005/side-threads", headers={"X-User-Id": "USR-201"})
    assert get_resp.status_code == 403

    post_resp = client.post(
        "/api/tickets/TCK-1005/side-threads",
        json={
            "supplier_name": "Supplier Direct",
            "subject": "Direct supplier question",
            "recipients": ["vendor@example.com"],
            "initial_message": "Hello"
        },
        headers={"X-User-Id": "USR-201"}
    )
    assert post_resp.status_code == 403

def test_ticket_transfer_preserves_side_conversation_recipients(client: TestClient):
    """
    MVP-4 CORE TEST:
    Transferring a ticket from Aisha (USR-101) to Rahul (USR-102) preserves
    all supplier side conversation recipients without wiping or overwriting them.
    """
    # Check TCK-1005 initial recipients
    detail_before = client.get("/api/tickets/TCK-1005", headers={"X-User-Id": "USR-101"}).json()
    recipients_before = detail_before["side_conversations"][0]["recipients"]
    assert "reservations@vendor.example.com" in recipients_before

    # Perform transfer to USR-102
    transfer_resp = client.post(
        "/api/tickets/TCK-1005/transfer",
        json={"target_agent_id": "USR-102", "reason": "Shift handover to Rahul Verma"},
        headers={"X-User-Id": "USR-101"}
    )
    assert transfer_resp.status_code == 200
    assert transfer_resp.json()["assigned_to"] == "USR-102"
    assert transfer_resp.json()["total_recipients_preserved"] >= 2

    # Verify recipients after transfer
    detail_after = client.get("/api/tickets/TCK-1005", headers={"X-User-Id": "USR-102"}).json()
    assert detail_after["assigned_to"] == "USR-102"
    recipients_after = detail_after["side_conversations"][0]["recipients"]
    assert recipients_after == recipients_before

def test_ticket_escalate_assigns_to_vikram_and_writes_outbox(client: TestClient, db_session: Session):
    """
    Escalating a ticket updates status to 'Escalated', reassigns to USR-103 (Vikram Malhotra),
    and records an event in events_outbox.
    """
    resp = client.post(
        "/api/tickets/TCK-1004/escalate",
        json={"reason": "Guest at front desk threatening cancellation; urgent managerial intervention required."},
        headers={"X-User-Id": "USR-101"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["new_status"] == "Escalated"
    assert data["assigned_to"] == "USR-103"

    # Verify outbox entry
    outbox = db_session.query(EventOutbox).filter(
        EventOutbox.ticket_id == "TCK-1004",
        EventOutbox.event_type == "ticket.escalated"
    ).first()
    assert outbox is not None
    assert outbox.visibility == "public"
    payload = json.loads(outbox.payload_json)
    assert payload["assigned_to"] == "USR-103"

def test_invalid_status_transition_returns_409(client: TestClient):
    """
    Attempting an illegal transition in the status graph (e.g. Closed -> Escalated)
    returns 409 Conflict.
    """
    resp = client.post(
        "/api/tickets/TCK-1001/status",
        json={"status": "Escalated"},
        headers={"X-User-Id": "USR-101"}
    )
    assert resp.status_code == 409
    assert "Invalid status transition" in resp.json()["detail"]

def test_suggest_intent_endpoint(client: TestClient):
    """POST /api/ai/suggest-intent returns rule-classified category."""
    resp = client.post(
        "/api/ai/suggest-intent",
        json={"title": "Voucher Resend Request", "description": "Please resend confirmation voucher immediately."},
        headers={"X-User-Id": "USR-101"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["intent"] == "Voucher Resend"
    assert data["source"] == "regex_rule"
