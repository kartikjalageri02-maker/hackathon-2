from datetime import date
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from app.models.component import Component
from app.models.reading import SensorReading
from app.models.machine import MachineThreshold


class LifecycleService:
    def evaluate_machine_components(self, machine_id: str, db: Session) -> List[Dict[str, Any]]:
        components = db.query(Component).filter(Component.machine_id == machine_id).all()
        today = date.today()

        # Get latest sensor reading for the machine
        latest_reading = db.query(SensorReading).filter(
            SensorReading.machine_id == machine_id
        ).order_by(SensorReading.id.desc()).first()

        # Get machine thresholds
        thresholds = {t.sensor: t for t in db.query(MachineThreshold).filter(MachineThreshold.machine_id == machine_id).all()}

        results = []
        for c in components:
            cal_remaining = max(0, (c.scheduled_replacement_on - today).days)
            life_used_ratio = max(0.0, min(1.0, (c.service_life_days - cal_remaining) / max(1, c.service_life_days)))
            inspection_days_since = (today - c.last_inspected_on).days
            inspection_overdue = inspection_days_since > c.inspection_interval_days

            sensor_stress = 1.0
            early_det = False
            det_reason = None

            if latest_reading and c.linked_sensor and hasattr(latest_reading, c.linked_sensor):
                val = getattr(latest_reading, c.linked_sensor)
                t = thresholds.get(c.linked_sensor)
                if val is not None and t:
                    if val > t.warning:
                        # Sensor is stressed
                        excess = val - t.warning
                        span = max(0.01, t.critical - t.warning)
                        sensor_stress = round(1.0 + (excess / span) * 2.0, 2)
                        
                        if cal_remaining > 30 and sensor_stress >= 1.25:
                            early_det = True
                            det_reason = (
                                f"Calendar indicates {cal_remaining} days remaining, but linked sensor "
                                f"'{c.linked_sensor}' is elevated ({val:.2f} > warning {t.warning:.2f}), "
                                f"causing accelerated component wear."
                            )

            effective_remaining = max(0, int(cal_remaining / sensor_stress))

            flag_replacement_due = cal_remaining <= 30
            flag_high_usage = life_used_ratio >= 0.85

            results.append({
                "id": c.id,
                "machine_id": c.machine_id,
                "name": c.name,
                "installed_on": c.installed_on,
                "service_life_days": c.service_life_days,
                "calendar_life_remaining_days": cal_remaining,
                "effective_life_remaining_days": effective_remaining,
                "life_used_ratio": round(life_used_ratio * 100, 1),
                "last_inspected_on": c.last_inspected_on,
                "inspection_interval_days": c.inspection_interval_days,
                "inspection_overdue": inspection_overdue,
                "condition": c.condition,
                "linked_sensor": c.linked_sensor,
                "sensor_stress_multiplier": sensor_stress,
                "early_deterioration": early_det,
                "deterioration_reason": det_reason,
                "flag_replacement_due": flag_replacement_due,
                "flag_high_usage": flag_high_usage,
            })

        return results


lifecycle_service = LifecycleService()
