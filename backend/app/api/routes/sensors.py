from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.machine import Machine
from app.models.reading import SensorReading
from app.schemas.sensor import SensorReadingResponse, SensorReadingChannels, SensorHistoryResponse

router = APIRouter(prefix="/machines", tags=["Sensors"])


@router.get("/{id}/sensors/latest", response_model=SensorReadingResponse)
def get_latest_sensor_reading(id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == id).first()
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{id}' not found."
        )

    reading = db.query(SensorReading).filter(
        SensorReading.machine_id == id
    ).order_by(SensorReading.id.desc()).first()

    if not reading:
        # If no readings yet, return nominal defaults
        return SensorReadingResponse(
            machine_id=id,
            ts=datetime.now(timezone.utc),
            readings=SensorReadingChannels(
                temperature_c=52.0,
                vibration_mm_s=1.2,
                current_a=14.5,
                pressure_bar=6.0,
                infrared_c=56.0,
                micro_movement_um=4.5,
                alignment_dev_mm=0.02,
                acoustic_db=68.0
            ),
            scenario_tag=None
        )

    return SensorReadingResponse(
        machine_id=id,
        ts=reading.ts,
        readings=SensorReadingChannels(
            temperature_c=reading.temperature_c,
            vibration_mm_s=reading.vibration_mm_s,
            current_a=reading.current_a,
            pressure_bar=reading.pressure_bar,
            infrared_c=reading.infrared_c,
            micro_movement_um=reading.micro_movement_um,
            alignment_dev_mm=reading.alignment_dev_mm,
            acoustic_db=reading.acoustic_db
        ),
        scenario_tag=reading.scenario_tag
    )


@router.get("/{id}/sensors/history", response_model=SensorHistoryResponse)
def get_sensor_history(
    id: str,
    minutes: int = Query(default=15, ge=1, le=120),
    sensors: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    machine = db.query(Machine).filter(Machine.id == id).first()
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{id}' not found."
        )

    to_ts = datetime.now(timezone.utc)
    from_ts = to_ts - timedelta(minutes=minutes)

    readings = db.query(SensorReading).filter(
        SensorReading.machine_id == id,
        SensorReading.ts >= from_ts
    ).order_by(SensorReading.ts.asc()).all()

    requested_sensors = [s.strip() for s in sensors.split(",")] if sensors else [
        "temperature_c", "vibration_mm_s", "current_a", "pressure_bar",
        "infrared_c", "micro_movement_um", "alignment_dev_mm", "acoustic_db"
    ]

    series = []
    for r in readings:
        item = {"ts": r.ts.isoformat()}
        for s in requested_sensors:
            if hasattr(r, s):
                item[s] = getattr(r, s)
        series.append(item)

    return SensorHistoryResponse(
        machine_id=id,
        from_ts=from_ts,
        to_ts=to_ts,
        count=len(series),
        series=series
    )
