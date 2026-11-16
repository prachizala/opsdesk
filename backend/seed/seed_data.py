import random
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy.orm import Session
from backend.app.database import Base, SessionLocal
from backend.app.models import (
    Agency, User, Ticket, TicketLink, TicketMessage,
    SideConversation, SideConversationRecipient, SideConversationMessage,
    TicketTheme, AuditLog
)
from backend.services.routing_engine import CandidateAgent, select_agent_tier1

# Rule-based theme mapping based on ticket intent
THEME_MAPPINGS = {
    "Refund Request": ["Refund Delay", "Payment Gateway Reconciliation"],
    "Cancellation Inconvenience": ["Supplier Lag", "Cancellation Penalty Dispute"],
    "Date Amendment": ["Schedule Disruption", "Fare Recalculation"],
    "Bedding / Room Preference": ["Room Mismatch", "Special Facility Request"],
    "Voucher Resend": ["Documentation Lag", "Missing Confirmation Voucher"],
    "Emergency Check-in Assist": ["Hotel Check-in Rejection", "Supplier Contact Unreachable"],
    "Unclassified": ["General Operations Inquiry"]
}

def seed_database(db: Session, engine_bind=None, total_tickets: int = 5000):
    """
    Seeds the database with deterministic fixtures and 5,000 synthetic records.
    - All historical tickets (past check-in) are strictly marked 'Closed' or 'Resolved' (SLA STOPPED).
    - All active tickets (New/Open/Pending/Escalated) strictly have future check-in and LCD dates.
    - Escalated tickets are assigned strictly to Escalation Manager USR-103 (Vikram Malhotra).
    - Standard assigned queue tickets are strictly restricted to Tier-1 desk agents: USR-101 and USR-102.
    - Workload and assignments for Journey fixtures are dynamically computed via select_agent_tier1.
    """
    target_bind = engine_bind if engine_bind is not None else db.get_bind()
    fake = Faker()
    Faker.seed(42)
    random.seed(42)

    # Recreate tables cleanly using the active database bind (never touches global engine if passed a test session)
    Base.metadata.drop_all(bind=target_bind)
    Base.metadata.create_all(bind=target_bind)

    print("Creating agencies...")
    agencies = [
        Agency(id="AGY-001", name="Krypton Voyages B2B", country_code="AE", tier="Premium"),
        Agency(id="AGY-002", name="Vectora Travel", country_code="IN", tier="Standard"),
        Agency(id="AGY-003", name="Aethelgard Holidays", country_code="UK", tier="Premium")
    ]
    db.add_all(agencies)
    db.commit()

    print("Creating users...")
    users = [
        # Internal Operations Staff (Tier-1 Desk Agents: USR-101, USR-102)
        User(id="USR-101", name="Aisha Khan", email="aisha.ops@tbo.test", role="Agent", region="MEA", is_available=True),
        User(id="USR-102", name="Rahul Verma", email="rahul.ops@tbo.test", role="Agent", region="MEA", is_available=True),
        # Internal Supervisory Staff (Escalation & Lead roles)
        User(id="USR-103", name="Vikram Malhotra", email="vikram.esc@tbo.test", role="EscalationManager", region="APAC", is_available=True),
        User(id="USR-104", name="Elena Rostova", email="elena.lead@tbo.test", role="Lead", region="EUR", is_available=True),
        # Agency Requesters (RFC 2606 email domains)
        User(id="USR-201", name="Krypton Desk", email="agent@krypton.example.com", role="Requester", region="MEA", agency_id="AGY-001"),
        User(id="USR-202", name="Vectora Desk", email="agent@vectora.example.com", role="Requester", region="APAC", agency_id="AGY-002"),
        User(id="USR-203", name="Aethelgard Desk", email="agent@aethelgard.example.com", role="Requester", region="EUR", agency_id="AGY-003")
    ]
    db.add_all(users)
    db.commit()

    now = datetime.utcnow()

    print("Seeding Journey fixtures (TCK-1001, TCK-1002, TCK-1004, TCK-1005, TCK-1006)...")
    
    # Journey A: Context & Linkage Fixtures (Same TBOH, both Closed in past)
    tck_1001 = Ticket(
        id="TCK-1001",
        tboh_id="TBOH-89104",
        agency_id="AGY-001",
        title="Flight cancelled - refund requested",
        description="Airline cancelled flight AF-902; requesting full refund to agency wallet.",
        intent="Refund Request",
        priority="High",
        status="Closed",
        check_in_date=now - timedelta(days=14),
        lcd_date=now - timedelta(days=16),
        assigned_to="USR-101",
        routing_reason="Assigned to Aisha Khan [Historical Case]",
        created_at=now - timedelta(days=15)
    )
    tck_1002 = Ticket(
        id="TCK-1002",
        tboh_id="TBOH-89104",
        agency_id="AGY-001",
        title="Follow-up: status update on refund for TBOH-89104",
        description="Checking status on refund initiated 10 days ago.",
        intent="Refund Request",
        priority="Medium",
        status="Closed",
        check_in_date=now - timedelta(days=4),
        lcd_date=now - timedelta(days=6),
        assigned_to="USR-101",
        routing_reason="Assigned to Aisha Khan [Historical Case]",
        created_at=now - timedelta(days=5)
    )
    db.add_all([tck_1001, tck_1002])
    db.commit()

    # Helper to dynamically compute agent workload from routing engine logic
    def compute_agent_workload(agent_id: str) -> int:
        return db.query(Ticket).filter(
            Ticket.assigned_to == agent_id,
            Ticket.status.in_(["New", "Open", "Pending", "Escalated"])
        ).count()

    # Journey B: Urgent routing (~2.5h check-in, MEA). lcd_date >= check_in_date so check-in is urgent factor.
    workload_b = compute_agent_workload("USR-101")
    tck_1004_checkin = now + timedelta(hours=2, minutes=30)
    tck_1004 = Ticket(
        id="TCK-1004",
        tboh_id="TBOH-91002",
        agency_id="AGY-001",
        title="Emergency: check-in issue at resort",
        description="Guest at front desk, voucher not appearing on hotel system.",
        intent="Emergency Check-in Assist",
        priority="Urgent",
        status="Open",
        check_in_date=tck_1004_checkin,
        lcd_date=tck_1004_checkin + timedelta(hours=1),
        assigned_to="USR-101",
        routing_reason=f"Assigned to Aisha Khan [Tier-1 Rule: Region=MEA match, Availability=True, Workload={workload_b} active cases]",
        created_at=now - timedelta(minutes=10)
    )
    db.add(tck_1004)
    db.commit()

    # Journey C: Side Conversation Transfer fixture (Aisha handles case, then transfers to Rahul)
    workload_c = compute_agent_workload("USR-101")
    tck_1005_checkin = now + timedelta(days=3)
    tck_1005 = Ticket(
        id="TCK-1005",
        tboh_id="TBOH-93041",
        agency_id="AGY-001",
        title="Meal inclusion query with resort",
        description="Agency asking if half-board package includes beverages at Kryos Heights Resort.",
        intent="Bedding / Room Preference",
        priority="Medium",
        status="Open",
        check_in_date=tck_1005_checkin,
        lcd_date=tck_1005_checkin + timedelta(days=1),
        assigned_to="USR-101",
        routing_reason=f"Assigned to Aisha Khan [Tier-1 Rule: Region=MEA match, Availability=True, Workload={workload_c} active cases]",
        created_at=now - timedelta(hours=1)
    )
    db.add(tck_1005)
    db.commit()

    # Journey D: SLA Warning (~45 min check-in, Urgent). lcd_date >= check_in_date so check-in is urgent factor.
    workload_d = compute_agent_workload("USR-101")
    tck_1006_checkin = now + timedelta(minutes=45)
    tck_1006 = Ticket(
        id="TCK-1006",
        tboh_id="TBOH-94420",
        agency_id="AGY-001",
        title="Urgent: guest arriving in 45 minutes",
        description="Confirmation needed immediately for late check-in request.",
        intent="Emergency Check-in Assist",
        priority="Urgent",
        status="Open",
        check_in_date=tck_1006_checkin,
        lcd_date=tck_1006_checkin + timedelta(minutes=15),
        assigned_to="USR-101",
        routing_reason=f"Assigned to Aisha Khan [Tier-1 Rule: Region=MEA match, Availability=True, Workload={workload_d} active cases]",
        created_at=now - timedelta(minutes=15)
    )
    db.add(tck_1006)
    db.commit()

    fixture_tickets = [tck_1001, tck_1002, tck_1004, tck_1005, tck_1006]

    # Link TCK-1001 and TCK-1002
    db.add(TicketLink(
        id="LNK-001",
        ticket_id="TCK-1001",
        linked_ticket_id="TCK-1002",
        link_reason="Shared TBOH: TBOH-89104"
    ))

    # Add Side Conversation with explicit recipients for TCK-1005
    side_convo = SideConversation(
        id="SC-001",
        ticket_id="TCK-1005",
        supplier_name="Kryos Heights Resort",
        subject="Meal inclusion clarification for TBOH-93041",
        created_by="USR-101",
        created_at=now - timedelta(minutes=45)
    )
    db.add(side_convo)
    db.commit()

    db.add_all([
        SideConversationRecipient(id="SCR-001", side_conversation_id="SC-001", email="reservations@vendor.example.com"),
        SideConversationRecipient(id="SCR-002", side_conversation_id="SC-001", email="duty.mgr@vendor.example.com"),
        SideConversationMessage(
            id="SCM-001",
            side_conversation_id="SC-001",
            sender_email="aisha.ops@tbo.test",
            body="Hello Reservations, could you please confirm if booking TBOH-93041 includes soft beverages during dinner?",
            created_at=now - timedelta(minutes=40)
        )
    ])
    db.commit()

    # Add theme tags for fixtures
    for t in fixture_tickets:
        themes = THEME_MAPPINGS.get(t.intent, ["General Operations Inquiry"])
        for idx, th in enumerate(themes):
            db.add(TicketTheme(
                id=f"THM-{t.id}-{idx}",
                ticket_id=t.id,
                theme=th,
                created_at=t.created_at
            ))
    db.commit()

    print(f"Generating remaining {total_tickets - len(fixture_tickets)} synthetic tickets...")
    agency_ids = ["AGY-001", "AGY-002", "AGY-003"]
    # Operational desk agents assigned standard tickets: strictly USR-101 and USR-102
    desk_agent_ids = ["USR-101", "USR-102"]
    intents = [
        "Refund Request",
        "Cancellation Inconvenience",
        "Date Amendment",
        "Bedding / Room Preference",
        "Voucher Resend",
        "Emergency Check-in Assist"
    ]
    priorities = ["Low", "Medium", "High", "Urgent"]

    synthetic_count = total_tickets - len(fixture_tickets)
    historical_count = 3500
    escalated_count = 40
    at_risk_synthetic_count = 78
    normal_active_count = synthetic_count - historical_count - escalated_count - at_risk_synthetic_count

    categories = (
        ["historical"] * historical_count +
        ["escalated"] * escalated_count +
        ["at_risk"] * at_risk_synthetic_count +
        ["normal_active"] * normal_active_count
    )
    random.shuffle(categories)

    batch_size = 500
    ticket_batch = []
    theme_batch = []

    for i, cat in enumerate(categories):
        ticket_id = f"TCK-{2000 + i}"
        tboh = f"TBOH-{random.randint(10000, 99999)}"
        agency_id = random.choice(agency_ids)
        intent = random.choice(intents)

        if cat == "historical":
            priority = random.choice(priorities)
            days_ago = random.randint(1, 45)
            check_in = now - timedelta(days=days_ago, hours=random.randint(1, 23))
            lcd = check_in - timedelta(days=random.randint(1, 3))
            status = random.choice(["Closed", "Resolved"])
            assigned = random.choice(desk_agent_ids)
            created = check_in - timedelta(days=random.randint(2, 10))
            routing_reason = f"Assigned to agent {assigned} [Historical Case]"
        elif cat == "escalated":
            # Escalated status with future check-in, assigned strictly to EscalationManager USR-103
            priority = "High"
            days_ahead = random.randint(2, 15)
            check_in = now + timedelta(days=days_ahead, hours=random.randint(1, 12))
            lcd = check_in + timedelta(days=1)
            status = "Escalated"
            assigned = "USR-103"
            created = now - timedelta(hours=random.randint(2, 48))
            routing_reason = "Escalated to Vikram Malhotra [EscalationManager Assignment]"
        elif cat == "at_risk":
            priority = "Urgent"
            hours_ahead = random.uniform(1.0, 5.5)
            check_in = now + timedelta(hours=hours_ahead)
            lcd = check_in + timedelta(hours=1)
            status = random.choice(["Open", "Pending"])
            assigned = random.choice(desk_agent_ids)
            created = now - timedelta(minutes=random.randint(10, 60))
            routing_reason = f"Assigned to agent {assigned} [Tier-1 Rule: Region workload match]"
        else: # normal_active
            priority = random.choice(priorities)
            days_ahead = random.randint(2, 20)
            check_in = now + timedelta(days=days_ahead, hours=random.randint(1, 12))
            lcd = check_in + timedelta(days=1)
            status = random.choice(["New", "Open", "Pending"])
            assigned = random.choice(desk_agent_ids) if status != "New" else None
            created = now - timedelta(hours=random.randint(1, 24))
            routing_reason = (
                f"Assigned to agent {assigned} [Tier-1 Rule: Region workload match]"
                if assigned else "Unassigned in Triage"
            )

        t = Ticket(
            id=ticket_id,
            tboh_id=tboh,
            agency_id=agency_id,
            title=f"{intent}: {fake.sentence(nb_words=6)}",
            description=fake.paragraph(nb_sentences=3),
            intent=intent,
            priority=priority,
            status=status,
            check_in_date=check_in,
            lcd_date=lcd,
            assigned_to=assigned,
            routing_reason=routing_reason,
            created_at=created,
            updated_at=created
        )
        ticket_batch.append(t)

        mapped_themes = THEME_MAPPINGS.get(intent, ["General Operations Inquiry"])
        for idx, th in enumerate(mapped_themes):
            theme_batch.append(TicketTheme(
                id=f"THM-{ticket_id}-{idx}",
                ticket_id=ticket_id,
                theme=th,
                created_at=created
            ))

        if len(ticket_batch) >= batch_size:
            db.add_all(ticket_batch)
            db.add_all(theme_batch)
            db.commit()
            ticket_batch.clear()
            theme_batch.clear()

    if ticket_batch:
        db.add_all(ticket_batch)
        db.add_all(theme_batch)
        db.commit()

    print(f"Database successfully seeded with {total_tickets} tickets.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db, total_tickets=5000)
    finally:
        db.close()
