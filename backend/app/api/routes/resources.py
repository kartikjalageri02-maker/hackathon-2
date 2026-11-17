from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security_demo import require_role
from app.models.resource import SparePart, Technician, MaintenanceTask
from app.schemas.resource import (
    SparePartResponse,
    TechnicianResponse,
    RecommendationResponse,
)
from app.services.resources.recommender import recommender_service

router = APIRouter(tags=["Resources"])


@router.get("/resources/spare-parts", response_model=List[SparePartResponse])
def get_spare_parts(db: Session = Depends(get_db)):
    return db.query(SparePart).all()


@router.get("/resources/technicians", response_model=List[TechnicianResponse])
def get_technicians(db: Session = Depends(get_db)):
    techs = db.query(Technician).all()
    results = []
    for t in techs:
        quals = [
            {"machine_id": q.machine_id, "machine_type": q.machine_type, "level": q.level}
            for q in t.qualifications
        ]
        results.append(
            TechnicianResponse(
                id=t.id,
                name=t.name,
                specialisation=t.specialisation,
                availability=t.availability,
                shift=t.shift,
                current_task_id=t.current_task_id,
                qualifications=quals
            )
        )
    return results


@router.get("/maintenance/tasks")
def get_maintenance_tasks(db: Session = Depends(get_db)):
    return db.query(MaintenanceTask).order_by(MaintenanceTask.created_at.desc()).all()


@router.get("/recommendations", response_model=List[RecommendationResponse])
def get_recommendations(
    machine_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return recommender_service.get_recommendations(machine_id, db)


@router.post("/recommendations/{id}/approve")
def approve_recommendation(
    id: str,
    role: str = Depends(require_role(["Supervisor"])),
    db: Session = Depends(get_db)
):
    # Find matching proposed recommendation
    recs = recommender_service.get_recommendations(None, db)
    rec = next((r for r in recs if r["id"] == id), None)
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recommendation '{id}' not found or already approved."
        )

    # Create MaintenanceTask
    task_id = f"TSK_{int(datetime.now(timezone.utc).timestamp())}"
    task = MaintenanceTask(
        id=task_id,
        machine_id=rec["machine_id"],
        component_id=rec.get("component_id"),
        priority=rec["priority"],
        part_id=rec["assigned_part"]["id"] if rec.get("assigned_part") else None,
        technician_id=rec["assigned_technician"]["id"] if rec.get("assigned_technician") else None,
        status="approved",
        rationale=rec["why"]
    )
    db.add(task)

    # Reserve part if in stock
    if rec.get("assigned_part") and rec["assigned_part"]["quantity"] > 0:
        sp = db.query(SparePart).filter(SparePart.id == rec["assigned_part"]["id"]).first()
        if sp and sp.quantity > 0:
            sp.quantity -= 1

    # Update technician current task
    if rec.get("assigned_technician"):
        tech = db.query(Technician).filter(Technician.id == rec["assigned_technician"]["id"]).first()
        if tech:
            tech.availability = "On Duty"
            tech.current_task_id = task_id

    db.commit()
    db.refresh(task)

    return {
        "status": "approved",
        "task_id": task.id,
        "machine_id": task.machine_id,
        "priority": task.priority,
        "assigned_technician": rec.get("assigned_technician", {}).get("name"),
        "assigned_part": rec.get("assigned_part", {}).get("name")
    }
