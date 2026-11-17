from datetime import datetime, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.alert import Alert, AlertEvent


SEVERITY_RANKS = {
    "Normal": 0,
    "Warning": 1,
    "High": 2,
    "Critical": 3,
    "Emergency": 4
}


class AlertEngine:
    def process_machine_state(
        self,
        machine_id: str,
        severity: str,
        risk_score: float,
        hypotheses: list,
        reasons: list,
        db: Session
    ) -> Tuple[Optional[str], Optional[Alert]]:
        # Find active or acknowledged alert for this machine
        alert = db.query(Alert).filter(
            Alert.machine_id == machine_id,
            Alert.status.in_(["active", "acknowledged"])
        ).first()

        now = datetime.now(timezone.utc)

        if severity in ["Warning", "High", "Critical", "Emergency"]:
            if not alert:
                # Create title and reason
                title = hypotheses[0]["hypothesis"] if hypotheses else f"Elevated Operating Stress ({severity})"
                reason_note = reasons[0]["note"] if reasons else f"Sensors exceeded warning limits with risk score {risk_score:.1f}."

                alert_id = f"ALR_{machine_id}_{int(now.timestamp())}"
                alert = Alert(
                    id=alert_id,
                    machine_id=machine_id,
                    root_cause_machine_id=machine_id,
                    severity=severity,
                    title=title,
                    reason=reason_note,
                    risk_score=risk_score,
                    status="active",
                    created_at=now
                )
                event = AlertEvent(
                    alert_id=alert.id,
                    ts=now,
                    event="created",
                    from_severity=None,
                    to_severity=severity,
                    actor="system_engine",
                    note=f"Automatic alert raised: {title}"
                )
                db.add(alert)
                db.add(event)
                db.commit()
                db.refresh(alert)
                return "created", alert
            else:
                # Alert exists: check if severity rank changed
                old_rank = SEVERITY_RANKS.get(alert.severity, 0)
                new_rank = SEVERITY_RANKS.get(severity, 0)

                if new_rank != old_rank:
                    event_type = "escalated" if new_rank > old_rank else "deescalated"
                    event = AlertEvent(
                        alert_id=alert.id,
                        ts=now,
                        event=event_type,
                        from_severity=alert.severity,
                        to_severity=severity,
                        actor="system_engine",
                        note=f"Alert {event_type} from {alert.severity} to {severity}"
                    )
                    alert.severity = severity
                    alert.risk_score = risk_score
                    db.add(event)
                    db.commit()
                    db.refresh(alert)
                    return event_type, alert
        elif severity == "Normal" and alert and alert.status == "active":
            # Auto resolve if returned to normal
            alert.status = "resolved"
            alert.resolved_at = now
            alert.resolved_by = "system_normal"
            event = AlertEvent(
                alert_id=alert.id,
                ts=now,
                event="resolved",
                from_severity=alert.severity,
                to_severity="Normal",
                actor="system_engine",
                note="Machine telemetry restored within normal baseline parameters."
            )
            db.add(event)
            db.commit()
            db.refresh(alert)
            return "resolved", alert

        return None, None

    def acknowledge_alert(self, alert_id: str, actor: str, db: Session) -> Alert:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            raise ValueError(f"Alert '{alert_id}' not found.")
        if alert.status == "resolved":
            raise ValueError(f"Alert '{alert_id}' is already resolved.")

        now = datetime.now(timezone.utc)
        alert.status = "acknowledged"
        alert.acknowledged_at = now
        alert.acknowledged_by = actor

        event = AlertEvent(
            alert_id=alert.id,
            ts=now,
            event="acknowledged",
            from_severity=alert.severity,
            to_severity=alert.severity,
            actor=actor,
            note=f"Alert acknowledged by {actor}"
        )
        db.add(event)
        db.commit()
        db.refresh(alert)
        return alert

    def resolve_alert(self, alert_id: str, actor: str, db: Session) -> Alert:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            raise ValueError(f"Alert '{alert_id}' not found.")

        now = datetime.now(timezone.utc)
        alert.status = "resolved"
        alert.resolved_at = now
        alert.resolved_by = actor

        event = AlertEvent(
            alert_id=alert.id,
            ts=now,
            event="resolved",
            from_severity=alert.severity,
            to_severity="Normal",
            actor=actor,
            note=f"Alert resolved by {actor}"
        )
        db.add(event)
        db.commit()
        db.refresh(alert)
        return alert


alert_engine = AlertEngine()
