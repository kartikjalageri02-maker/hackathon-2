from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.db import get_db
from app.models.machine import Machine, MachineThreshold
from app.models.analysis import AnalysisSnapshot
from app.models.component import Component
from app.models.alert import Alert
from app.schemas.machine import MachineSummary, MachineDetail
from app.schemas.sensor import SensorThresholdResponse

router = APIRouter(prefix="/machines", tags=["Machines"])


@router.get("", response_model=list[MachineSummary])
def list_machines(db: Session = Depends(get_db)):
    machines = db.query(Machine).all()

    # Get latest snapshot per machine
    subq = db.query(
        AnalysisSnapshot.machine_id,
        func.max(AnalysisSnapshot.id).label("max_id")
    ).group_by(AnalysisSnapshot.machine_id).subquery()

    latest_snaps = {
        s.machine_id: s for s in db.query(AnalysisSnapshot).join(
            subq, AnalysisSnapshot.id == subq.c.max_id
        ).all()
    }

    result = []
    for m in machines:
        snap = latest_snaps.get(m.id)
        result.append(
            MachineSummary(
                id=m.id,
                name=m.name,
                type=m.type,
                role_in_line=m.role_in_line,
                nominal_throughput_uph=m.nominal_throughput_uph,
                criticality_weight=m.criticality_weight,
                model_url=m.model_url,
                health_score=round(snap.health_score, 1) if snap else 100.0,
                risk_score=round(snap.risk_score, 1) if snap else 0.0,
                severity=snap.severity if snap else "Normal"
            )
        )
    return result


@router.get("/{id}", response_model=MachineDetail)
def get_machine(id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == id).first()
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{id}' not found."
        )

    # Latest snapshot
    snap = db.query(AnalysisSnapshot).filter(
        AnalysisSnapshot.machine_id == id
    ).order_by(AnalysisSnapshot.id.desc()).first()

    # Component count
    comp_count = db.query(Component).filter(Component.machine_id == id).count()

    # Active alerts
    alert_count = db.query(Alert).filter(
        Alert.machine_id == id,
        Alert.status == "active"
    ).count()

    return MachineDetail(
        id=machine.id,
        name=machine.name,
        type=machine.type,
        role_in_line=machine.role_in_line,
        nominal_throughput_uph=machine.nominal_throughput_uph,
        criticality_weight=machine.criticality_weight,
        model_url=machine.model_url,
        pos_x=machine.pos_x,
        pos_y=machine.pos_y,
        pos_z=machine.pos_z,
        rot_y=machine.rot_y,
        health_score=round(snap.health_score, 1) if snap else 100.0,
        risk_score=round(snap.risk_score, 1) if snap else 0.0,
        severity=snap.severity if snap else "Normal",
        components_count=comp_count,
        active_alerts_count=alert_count,
        created_at=machine.created_at
    )


@router.get("/{id}/thresholds", response_model=list[SensorThresholdResponse])
def get_machine_thresholds(id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == id).first()
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{id}' not found."
        )

    thresholds = db.query(MachineThreshold).filter(
        MachineThreshold.machine_id == id
    ).all()
    return thresholds
