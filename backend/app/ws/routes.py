from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.ws.hub import ws_hub
from app.core.db import SessionLocal
from app.models.machine import Machine
from app.models.analysis import AnalysisSnapshot
from app.models.alert import Alert

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await ws_hub.connect(websocket)

    # Send initial state snapshot on connect
    db = SessionLocal()
    try:
        machines = db.query(Machine).all()
        active_alerts = db.query(Alert).filter(Alert.status == "active").all()

        machines_summary = []
        for m in machines:
            latest_snap = db.query(AnalysisSnapshot).filter(
                AnalysisSnapshot.machine_id == m.id
            ).order_by(AnalysisSnapshot.id.desc()).first()

            machines_summary.append({
                "id": m.id,
                "name": m.name,
                "type": m.type,
                "role_in_line": m.role_in_line,
                "nominal_throughput_uph": m.nominal_throughput_uph,
                "criticality_weight": m.criticality_weight,
                "health_score": latest_snap.health_score if latest_snap else 100.0,
                "risk_score": latest_snap.risk_score if latest_snap else 0.0,
                "severity": latest_snap.severity if latest_snap else "Normal"
            })

        alerts_payload = [
            {
                "id": a.id,
                "machine_id": a.machine_id,
                "severity": a.severity,
                "title": a.title,
                "reason": a.reason,
                "risk_score": a.risk_score,
                "status": a.status,
                "created_at": a.created_at.isoformat() if a.created_at else None
            }
            for a in active_alerts
        ]

        await websocket.send_json({
            "type": "snapshot",
            "seq": 0,
            "machine_id": None,
            "payload": {
                "machines": machines_summary,
                "active_alerts": alerts_payload,
            }
        })
    finally:
        db.close()

    try:
        while True:
            # Keep receiving client heartbeats or messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        await ws_hub.disconnect(websocket)
    except Exception:
        await ws_hub.disconnect(websocket)
