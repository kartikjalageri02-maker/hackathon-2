from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.db import get_db
from app.models.machine import Machine
from app.models.analysis import AnalysisSnapshot
from app.models.alert import Alert
from app.schemas.machine import FactoryLayoutResponse, MachineLayoutItem, MachinePosition, MachineDimensions, FactorySummaryResponse

router = APIRouter(prefix="/factory", tags=["Factory"])


@router.get("/layout", response_model=FactoryLayoutResponse)
def get_factory_layout(db: Session = Depends(get_db)):
    machines = db.query(Machine).all()
    layout_items = []

    # Nominal dimensions for procedural or 3D models
    dims = {
        "milling_centre": MachineDimensions(width=2.4, height=2.2, depth=2.0),
        "conveyor": MachineDimensions(width=4.8, height=1.0, depth=1.2),
        "packaging": MachineDimensions(width=2.6, height=2.0, depth=1.8),
    }

    for m in machines:
        layout_items.append(
            MachineLayoutItem(
                id=m.id,
                name=m.name,
                type=m.type,
                model_url=m.model_url,
                position=MachinePosition(x=m.pos_x, y=m.pos_y, z=m.pos_z),
                rotation=MachinePosition(x=0.0, y=m.rot_y, z=0.0),
                dimensions=dims.get(m.type, MachineDimensions(width=2.0, height=2.0, depth=2.0)),
                role_in_line=m.role_in_line
            )
        )
    return FactoryLayoutResponse(machines=layout_items)


@router.get("/summary", response_model=FactorySummaryResponse)
def get_factory_summary(db: Session = Depends(get_db)):
    machines = db.query(Machine).all()
    total_machines = len(machines)

    # Latest snapshots per machine
    subq = db.query(
        AnalysisSnapshot.machine_id,
        func.max(AnalysisSnapshot.id).label("max_id")
    ).group_by(AnalysisSnapshot.machine_id).subquery()

    latest_snaps = db.query(AnalysisSnapshot).join(
        subq, AnalysisSnapshot.id == subq.c.max_id
    ).all()

    health_by_mid = {s.machine_id: s.health_score for s in latest_snaps}
    severity_by_mid = {s.machine_id: s.severity for s in latest_snaps}

    normal_count = sum(1 for s in latest_snaps if s.severity == "Normal")
    warning_count = sum(1 for s in latest_snaps if s.severity == "Warning")
    critical_count = sum(1 for s in latest_snaps if s.severity in ["High", "Critical", "Emergency"])

    # Average factory health
    if health_by_mid:
        avg_health = round(sum(health_by_mid.values()) / len(health_by_mid), 1)
    else:
        avg_health = 100.0

    # Line throughput (bottleneck is minimum of effective outputs)
    nominal_line_uph = 120
    worst_derate = min([health_by_mid.get(m.id, 100.0) / 100.0 for m in machines], default=1.0)
    effective_uph = max(0, int(nominal_line_uph * worst_derate))
    loss_pct = round(((nominal_line_uph - effective_uph) / nominal_line_uph) * 100, 2)

    # Active alerts
    active_alerts = db.query(Alert).filter(Alert.status == "active").all()
    root_cause_mid = None
    if active_alerts:
        # Machine with highest risk or first active alert
        active_alerts_sorted = sorted(active_alerts, key=lambda a: a.risk_score, reverse=True)
        root_cause_mid = active_alerts_sorted[0].root_cause_machine_id or active_alerts_sorted[0].machine_id

    return FactorySummaryResponse(
        factory_health_score=avg_health,
        line_throughput_uph=effective_uph,
        nominal_throughput_uph=nominal_line_uph,
        throughput_loss_percent=loss_pct,
        machine_counts={
            "total": total_machines,
            "normal": normal_count if latest_snaps else total_machines,
            "warning": warning_count,
            "critical": critical_count
        },
        active_alerts_count=len(active_alerts),
        root_cause_machine_id=root_cause_mid,
        timestamp=datetime.now(timezone.utc)
    )
