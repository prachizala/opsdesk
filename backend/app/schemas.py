from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class TicketCreateSchema(BaseModel):
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=5)
    tboh_id: str
    priority: str = Field(default="Medium")
    check_in_date: datetime
    lcd_date: datetime
    intent: Optional[str] = None
    agency_id: Optional[str] = None  # Ignored for Requesters, caller agency used instead

class TicketAssignSchema(BaseModel):
    agent_id: str

class TicketStatusUpdateSchema(BaseModel):
    status: str

class TicketEscalateSchema(BaseModel):
    reason: str

class TicketTransferSchema(BaseModel):
    target_agent_id: str
    reason: str

class MessageCreateSchema(BaseModel):
    message_type: str = Field(..., description="'PublicReply' or 'InternalNote'")
    content: str = Field(..., min_length=1)

class SideThreadCreateSchema(BaseModel):
    supplier_name: str
    subject: str
    recipients: List[str]
    initial_message: str

class SideThreadMessageCreateSchema(BaseModel):
    body: str

class IntentSuggestRequestSchema(BaseModel):
    title: str
    description: str

class IntentSuggestResponseSchema(BaseModel):
    intent: str
    source: str
