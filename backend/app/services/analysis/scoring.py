from typing import Dict, List, Tuple
from app.services.analysis.thresholds import calculate_sensor_penalties
from app.services.analysis.isolation_forest import isolation_forest_service
from app.services.analysis.patterns import evaluate_pattern_rules


class ScoringService:
    def __init__(self):
        # Hysteresis state tracking per machine: machine_id -> { current_severity, pending_severity, pending_ticks }
        self.hysteresis_state: Dict[str, Dict] = {
            "MCH001": {"severity": "Normal", "candidate": "Normal", "ticks": 0},
            "MCH002": {"severity": "Normal", "candidate": "Normal", "ticks": 0},
            "MCH003": {"severity": "Normal", "candidate": "Normal", "ticks": 0},
        }
        self.previous_health: Dict[str, float] = {
            "MCH001": 98.5,
            "MCH002": 99.0,
            "MCH003": 99.0,
        }

    def evaluate_machine(
        self,
        machine_id: str,
        readings: Dict[str, float]
    ) -> Dict:
        # 1. Continuous sensor threshold penalties
        sensor_penalty, sensor_reasons = calculate_sensor_penalties(machine_id, readings)

        # 2. Multivariate Isolation Forest check (capped at 15 pts)
        if_penalty, if_reason = isolation_forest_service.evaluate(machine_id, readings)

        # 3. Deterministic pattern rules
        pattern_penalty, hypotheses, pattern_reasons = evaluate_pattern_rules(machine_id, readings)

        # 4. Health Score (0 to 100)
        total_penalties = sensor_penalty + if_penalty + pattern_penalty
        health_score = max(0.0, min(100.0, round(100.0 - total_penalties, 1)))

        # 5. Risk Score (0 to 100)
        prev_h = self.previous_health.get(machine_id, 100.0)
        roc = max(0.0, min(100.0, (prev_h - health_score) * 20.0))
        self.previous_health[machine_id] = health_score

        health_deficit = 100.0 - health_score
        risk_score = min(100.0, round(0.55 * health_deficit + 0.30 * roc + 0.15 * (if_penalty + pattern_penalty), 1))

        # 6. Safety check for Emergency severity
        is_safety_critical = (
            (readings.get("temperature_c", 0.0) > 85.0 and readings.get("current_a", 0.0) > 30.0) or
            (readings.get("infrared_c", 0.0) > 90.0 and readings.get("vibration_mm_s", 0.0) > 5.0)
        )

        # Raw candidate severity
        if risk_score > 85.0 and is_safety_critical:
            raw_candidate = "Emergency"
        elif risk_score > 70.0:
            raw_candidate = "Critical"
        elif risk_score > 45.0:
            raw_candidate = "High"
        elif risk_score > 20.0:
            raw_candidate = "Warning"
        else:
            raw_candidate = "Normal"

        # 7. Hysteresis filtering (3 ticks to upgrade, 10 ticks to downgrade)
        current = self.hysteresis_state.setdefault(
            machine_id, {"severity": "Normal", "candidate": "Normal", "ticks": 0}
        )

        severity_ranks = {"Normal": 1, "Warning": 2, "High": 3, "Critical": 4, "Emergency": 5}
        current_rank = severity_ranks.get(current["severity"], 1)
        candidate_rank = severity_ranks.get(raw_candidate, 1)

        if raw_candidate == current["severity"]:
            current["candidate"] = raw_candidate
            current["ticks"] = 0
        elif candidate_rank > current_rank:
            # Escalation: requires 3 consecutive ticks
            if current["candidate"] == raw_candidate:
                current["ticks"] += 1
                if current["ticks"] >= 3:
                    current["severity"] = raw_candidate
                    current["ticks"] = 0
            else:
                current["candidate"] = raw_candidate
                current["ticks"] = 1
        else:
            # De-escalation: requires 10 consecutive ticks
            if current["candidate"] == raw_candidate:
                current["ticks"] += 1
                if current["ticks"] >= 10:
                    current["severity"] = raw_candidate
                    current["ticks"] = 0
            else:
                current["candidate"] = raw_candidate
                current["ticks"] = 1

        active_severity = current["severity"]

        # Compile reasons
        all_reasons = []
        all_reasons.extend(sensor_reasons)
        if if_reason:
            all_reasons.append(if_reason)
        all_reasons.extend(pattern_reasons)

        return {
            "machine_id": machine_id,
            "health_score": health_score,
            "risk_score": risk_score,
            "severity": active_severity,
            "reasons": all_reasons,
            "anomalies": [],
            "hypotheses": hypotheses,
        }


scoring_service = ScoringService()
