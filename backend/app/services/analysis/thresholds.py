from typing import Dict, List, Tuple
from app.services.simulation.profiles import MACHINE_PROFILES, SensorBaseline


def calculate_sensor_penalties(
    machine_id: str,
    readings: Dict[str, float]
) -> Tuple[float, List[Dict]]:
    """
    Computes continuous threshold grading penalties and itemized reasons.
    Formula: Piecewise linear continuous derating between Warning and Critical.
    """
    profiles = MACHINE_PROFILES.get(machine_id, {})
    total_penalty = 0.0
    reasons = []

    for sensor, baseline in profiles.items():
        val = readings.get(sensor)
        if val is None:
            continue

        p = 0.0
        # Continuous grading:
        # Below warning: 0 penalty
        # Between warning and high: 0 to 0.33
        # Between high and critical: 0.33 to 0.67
        # Above critical: 0.67 to 1.0
        if val > baseline.warning:
            if val <= baseline.high:
                p = 0.33 * ((val - baseline.warning) / max(0.001, baseline.high - baseline.warning))
            elif val <= baseline.critical:
                p = 0.33 + 0.34 * ((val - baseline.high) / max(0.001, baseline.critical - baseline.high))
            else:
                p = 0.67 + 0.33 * min(1.0, (val - baseline.critical) / max(0.001, 0.2 * baseline.critical))

            # Weight sensor importance
            weight = 1.8 if sensor in ["vibration_mm_s", "temperature_c"] else 1.2
            sensor_points = round(p * 20.0 * weight, 1)
            total_penalty += sensor_points

            reasons.append({
                "factor": sensor.replace("_", " ").title(),
                "observed": val,
                "limit": baseline.warning if val < baseline.critical else baseline.critical,
                "unit": baseline.unit,
                "points": -sensor_points,
                "note": f"Exceeded threshold of {baseline.warning if val < baseline.critical else baseline.critical} {baseline.unit}"
            })

    return round(total_penalty, 1), reasons
