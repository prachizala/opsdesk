# SLA Engine Configuration & Operational Thresholds
# All numeric thresholds below are design assumptions documented for the hackathon prototype.

SLA_THRESHOLDS = {
    # Assumption: Urgent priority tickets get a wider warning buffer (6.0 hours before check-in)
    "AT_RISK_HOURS_URGENT": 6.0,
    
    # Assumption: High priority tickets get a 4.0-hour warning buffer
    "AT_RISK_HOURS_HIGH": 4.0,
    
    # Assumption: Medium/Low priority tickets get a standard 2.0-hour warning buffer
    "AT_RISK_HOURS_DEFAULT": 2.0,
    
    # Assumption: 0.0 hours (check-in time or LCD passed without resolution) marks a BREACH
    "BREACHED_HOURS": 0.0
}

# SLA Status Definitions and Visual Color Codes (Strictly Amber for At-Risk everywhere)
SLA_COLORS = {
    "STOPPED": "Gray",   # Resolved or Closed tickets
    "NORMAL": "Green",   # Healthy window
    "AT_RISK": "Amber",  # Proximity warning (Amber)
    "BREACHED": "Red"    # Breached deadline (Red)
}
