from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.db import SessionLocal
from app.models.reading import SensorReading
from app.models.analysis import AnalysisSnapshot
from app.services.analysis.scoring import scoring_service
from app.services.alerts.engine import alert_engine
from app.ws.hub import ws_hub


async def ingest_reading(
    machine_id: str,
    readings: Dict[str, float],
    scenario_tag: Optional[str] = None,
    ts: Optional[datetime] = None
) -> Dict[str, Any]:
    if ts is None:
        ts = datetime.now(timezone.utc)

    # 1. Database persistence & retention management
    db: Session = SessionLocal()
    analysis_result = {}
    alert_event_type = None
    alert_obj = None

    try:
        sensor_record = SensorReading(
            machine_id=machine_id,
            ts=ts,
            temperature_c=readings.get("temperature_c", 0.0),
            vibration_mm_s=readings.get("vibration_mm_s", 0.0),
            current_a=readings.get("current_a", 0.0),
            pressure_bar=readings.get("pressure_bar", 0.0),
            infrared_c=readings.get("infrared_c", 0.0),
            micro_movement_um=readings.get("micro_movement_um", 0.0),
            alignment_dev_mm=readings.get("alignment_dev_mm", 0.0),
            acoustic_db=readings.get("acoustic_db", 0.0),
            scenario_tag=scenario_tag
        )
        db.add(sensor_record)

        # Sliding window pruning: remove readings older than READING_RETENTION_MINUTES
        cutoff = ts - timedelta(minutes=settings.READING_RETENTION_MINUTES)
        db.query(SensorReading).filter(
            SensorReading.machine_id == machine_id,
            SensorReading.ts < cutoff
        ).delete(synchronize_session=False)

        # 2. Intelligence Evaluation (Thresholds, Isolation Forest, Pattern Rules)
        analysis_result = scoring_service.evaluate_machine(machine_id, readings)

        snapshot = AnalysisSnapshot(
            machine_id=machine_id,
            ts=ts,
            health_score=analysis_result["health_score"],
            risk_score=analysis_result["risk_score"],
            severity=analysis_result["severity"],
            reasons=analysis_result["reasons"],
            anomalies=analysis_result["anomalies"],
            hypotheses=analysis_result["hypotheses"]
        )
        db.add(snapshot)

        # 3. Alert Engine Processing (Auto-raise, escalate in place, auto-resolve)
        alert_event_type, alert_obj = alert_engine.process_machine_state(
            machine_id=machine_id,
            severity=analysis_result["severity"],
            risk_score=analysis_result["risk_score"],
            hypotheses=analysis_result["hypotheses"],
            reasons=analysis_result["reasons"],
            db=db
        )

        db.commit()
    finally:
        db.close()

    # 4. Broadcast live sensor telemetry over WebSocket
    sensor_payload = {
        "ts": ts.isoformat(),
        "readings": readings,
        "scenario_tag": scenario_tag
    }
    await ws_hub.broadcast("sensor.update", sensor_payload, machine_id=machine_id)

    # 5. Broadcast live intelligence update over WebSocket
    analysis_payload = {
        "ts": ts.isoformat(),
        "health_score": analysis_result["health_score"],
        "risk_score": analysis_result["risk_score"],
        "severity": analysis_result["severity"],
        "reasons": analysis_result["reasons"],
        "hypotheses": analysis_result["hypotheses"]
    }
    await ws_hub.broadcast("analysis.update", analysis_payload, machine_id=machine_id)

    # 6. Broadcast alert update over WebSocket
    if alert_event_type and alert_obj:
        alert_payload = {
            "id": alert_obj.id,
            "machine_id": alert_obj.machine_id,
            "severity": alert_obj.severity,
            "title": alert_obj.title,
            "status": alert_obj.status,
            "risk_score": alert_obj.risk_score,
            "event": alert_event_type
        }
        await ws_hub.broadcast(
            "alert.created" if alert_event_type == "created" else "alert.updated",
            alert_payload,
            machine_id=machine_id
        )

    return {
        "sensor": sensor_payload,
        "analysis": analysis_payload
    }
