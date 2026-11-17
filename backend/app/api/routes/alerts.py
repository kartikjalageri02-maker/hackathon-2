from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security_demo import get_current_demo_role, require_role
from app.models.alert import Alert, AlertEvent
from app.schemas.alert import AlertResponse, AlertEventResponse
from app.services.alerts.engine import alert_engine

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertResponse])
def get_alerts(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    machine_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)
    if machine_id:
        query = query.filter(Alert.machine_id == machine_id)

    return query.order_by(Alert.created_at.desc()).all()


@router.post("/{id}/acknowledge", response_model=AlertResponse)
def acknowledge_alert(
    id: str,
    role: str = Depends(require_role(["Operator", "Supervisor"])),
    db: Session = Depends(get_db)
):
    try:
        return alert_engine.acknowledge_alert(id, actor=f"demo_{role.lower()}", db=db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{id}/resolve", response_model=AlertResponse)
def resolve_alert(
    id: str,
    role: str = Depends(require_role(["Supervisor"])),
    db: Session = Depends(get_db)
):
    try:
        return alert_engine.resolve_alert(id, actor=f"demo_{role.lower()}", db=db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{id}/events", response_model=List[AlertEventResponse])
def get_alert_events(id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Alert '{id}' not found.")

    return db.query(AlertEvent).filter(AlertEvent.alert_id == id).order_by(AlertEvent.ts.asc()).all()
