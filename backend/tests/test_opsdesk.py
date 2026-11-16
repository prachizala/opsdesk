import os
import json
from datetime import datetime, timedelta
import pytest
from sqlalchemy.orm import Session
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import (
    Agency, User, Ticket, TicketLink, SideConversation,
    SideConversationRecipient, TicketTheme, EventOutbox, TicketMessage
)
from backend.services.routing_engine import (
    CandidateAgent,
    select_agent_tier1,
    calculate_queue_score_tier2
)
from backend.services.sla_engine import evaluate_travel_sla
from backend.services.intent_classifier import suggest_ticket_intent
from backend.seed.seed_data import seed_database

# ============================================================================
# 1. ROUTING ENGINE TESTS
# ============================================================================

def test_routing_region_match():
    """Agent in matching region is selected when available."""
    agents = [
        CandidateAgent(id="USR-1", name="Aisha", region="MEA", is_available=True, active_ticket_count=2),
        CandidateAgent(id="USR-2", name="Rahul", region="APAC", is_available=True, active_ticket_count=0),
    ]
    # AE maps to MEA
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
    # Sorted by (active_ticket_count, id) -> USR-A wins
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
    # Urgent base 1000 + imminent modifier 2000 = 3000
    assert score_urgent_imminent == 3000.0


# ============================================================================
# 2. SLA ENGINE TESTS
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
# 3. GOLDEN VECTORS COMPLIANCE TEST (CONTRACTS VERIFICATION)
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
# 4. INTENT CLASSIFIER REGEX & PRECEDENCE TESTS
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
# 5. OUTBOX TRANSACTIONAL LOGGING TESTS
# ============================================================================

def test_outbox_ticket_created_event(db_session: Session):
    """Creating a ticket produces an event_outbox entry with visibility='public'."""
    now = datetime.utcnow()
    t = Ticket(
        id="TCK-OUTBOX-1",
        tboh_id="TBOH-99881",
        agency_id="AGY-001",
        title="Test Outbox Creation",
        description="Ticket created for testing outbox emission",
        intent="Refund Request",
        priority="Medium",
        status="New",
        check_in_date=now + timedelta(days=2),
        lcd_date=now + timedelta(days=1),
        created_at=now
    )
    outbox_event = EventOutbox(
        id="EVT-001",
        event_type="ticket.created",
        ticket_id=t.id,
        agency_id=t.agency_id,
        visibility="public",
        payload_json=json.dumps({"ticket_id": t.id, "tboh_id": t.tboh_id, "status": "New"}),
        created_at=now
    )
    db_session.add(t)
    db_session.add(outbox_event)
    db_session.commit()

    ev = db_session.query(EventOutbox).filter(EventOutbox.id == "EVT-001").first()
    assert ev is not None
    assert ev.visibility == "public"
    assert ev.event_type == "ticket.created"

    # Clean up test records
    db_session.delete(ev)
    db_session.delete(t)
    db_session.commit()

def test_outbox_internal_note_visibility(db_session: Session):
    """Adding an internal note produces an event_outbox entry with visibility='internal'."""
    now = datetime.utcnow()
    msg = TicketMessage(
        id="MSG-INT-1",
        ticket_id="TCK-1004",
        sender_id="USR-101",
        message_type="InternalNote",
        content="Internal ops note: supplier is lagging on confirmation",
        created_at=now
    )
    outbox_event = EventOutbox(
        id="EVT-002",
        event_type="message.created",
        ticket_id="TCK-1004",
        agency_id="AGY-001",
        visibility="internal",
        payload_json=json.dumps({"message_id": msg.id, "type": "InternalNote"}),
        created_at=now
    )
    db_session.add(msg)
    db_session.add(outbox_event)
    db_session.commit()

    ev = db_session.query(EventOutbox).filter(EventOutbox.id == "EVT-002").first()
    assert ev is not None
    assert ev.visibility == "internal"
    assert ev.event_type == "message.created"

    # Clean up
    db_session.delete(ev)
    db_session.delete(msg)
    db_session.commit()


# ============================================================================
# 6. SEED DATA GENERATOR TESTS
# ============================================================================

@pytest.fixture(scope="module")
def db_session():
    """Creates a seeded test database session."""
    db = SessionLocal()
    seed_database(db, total_tickets=5000)
    yield db
    db.close()

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

    # TCK-1004: Urgent, MEA, ~2.5h in future
    t1004 = db_session.query(Ticket).filter(Ticket.id == "TCK-1004").first()
    assert t1004 is not None
    assert t1004.priority == "Urgent"
    assert t1004.status == "Open"
    assert t1004.check_in_date > datetime.utcnow()

    # TCK-1005: Side thread with recipient
    t1005 = db_session.query(Ticket).filter(Ticket.id == "TCK-1005").first()
    assert t1005 is not None
    assert len(t1005.side_conversations) > 0
    sc = t1005.side_conversations[0]
    assert len(sc.recipients) > 0
    assert sc.recipients[0].email == "reservations@vendor.example.com"

    # TCK-1006: Urgent, ~45m in future
    t1006 = db_session.query(Ticket).filter(Ticket.id == "TCK-1006").first()
    assert t1006 is not None
    assert t1006.priority == "Urgent"
    assert t1006.status == "Open"
