from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.machine import Machine
from app.models.component import Component, MaintenanceRecord
from app.schemas.resource import ComponentResponse, MaintenanceRecordResponse
from app.services.lifecycle.lifecycle import lifecycle_service

router = APIRouter(tags=["Maintenance"])


@router.get("/machines/{id}/components", response_model=list[ComponentResponse])
def get_machine_components(id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == id).first()
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{id}' not found."
        )

    return lifecycle_service.evaluate_machine_components(id, db)


@router.get("/machines/{id}/maintenance/history", response_model=list[MaintenanceRecordResponse])
def get_machine_maintenance_history(id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == id).first()
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{id}' not found."
        )

    records = db.query(MaintenanceRecord).filter(
        MaintenanceRecord.machine_id == id
    ).order_by(MaintenanceRecord.performed_on.desc()).all()

    return records


@router.get("/maintenance/overview")
def get_maintenance_overview(db: Session = Depends(get_db)):
    components = db.query(Component).all()
    today = date.today()

    due_for_replacement = [
        c.name for c in components if (c.scheduled_replacement_on - today).days <= 30
    ]
    overdue_inspections = [
        c.name for c in components if (today - c.last_inspected_on).days > c.inspection_interval_days
    ]

    return {
        "total_tracked_components": len(components),
        "due_for_replacement_count": len(due_for_replacement),
        "due_for_replacement_components": due_for_replacement,
        "overdue_inspections_count": len(overdue_inspections),
        "overdue_inspections_components": overdue_inspections
    }
