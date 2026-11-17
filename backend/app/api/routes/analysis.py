from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.machine import Machine
from app.models.analysis import AnalysisSnapshot
from app.schemas.analysis import AnalysisResponse, AnalysisHistoryPoint

router = APIRouter(prefix="/machines", tags=["Analysis"])


@router.get("/{id}/analysis", response_model=AnalysisResponse)
def get_latest_machine_analysis(id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == id).first()
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{id}' not found."
        )

    snap = db.query(AnalysisSnapshot).filter(
        AnalysisSnapshot.machine_id == id
    ).order_by(AnalysisSnapshot.id.desc()).first()

    if not snap:
        return AnalysisResponse(
            machine_id=id,
            ts=datetime.now(timezone.utc),
            health_score=100.0,
            risk_score=0.0,
            severity="Normal",
            reasons=[],
            anomalies=[],
            hypotheses=[]
        )

    return AnalysisResponse(
        machine_id=id,
        ts=snap.ts,
        health_score=snap.health_score,
        risk_score=snap.risk_score,
        severity=snap.severity,
        reasons=snap.reasons or [],
        anomalies=snap.anomalies or [],
        hypotheses=snap.hypotheses or []
    )


@router.get("/{id}/analysis/history", response_model=list[AnalysisHistoryPoint])
def get_analysis_history(
    id: str,
    minutes: int = Query(default=60, ge=1, le=120),
    db: Session = Depends(get_db)
):
    machine = db.query(Machine).filter(Machine.id == id).first()
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{id}' not found."
        )

    from_ts = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    snaps = db.query(AnalysisSnapshot).filter(
        AnalysisSnapshot.machine_id == id,
        AnalysisSnapshot.ts >= from_ts
    ).order_by(AnalysisSnapshot.ts.asc()).all()

    return [
        AnalysisHistoryPoint(
            ts=s.ts,
            health_score=s.health_score,
            risk_score=s.risk_score,
            severity=s.severity
        )
        for s in snaps
    ]
