from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AlertResponse(BaseModel):
    id: str
    machine_id: str
    root_cause_machine_id: str
    severity: str
    title: str
    reason: str
    risk_score: float
    status: str
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AlertEventResponse(BaseModel):
    id: int
    alert_id: str
    ts: datetime
    event: str
    from_severity: Optional[str] = None
    to_severity: str
    actor: str
    note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
