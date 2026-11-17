from typing import Dict, List, Tuple


def evaluate_pattern_rules(
    machine_id: str,
    readings: Dict[str, float],
    recent_history: List[Dict[str, float]] = None
) -> Tuple[float, List[Dict], List[Dict]]:
    """
    Evaluates deterministic failure rules.
    Outputs exact rule match count: 'matched M of N conditions' (NOT a probability).
    """
    hypotheses = []
    pattern_reasons = []
    total_penalty = 0.0

    vib = readings.get("vibration_mm_s", 0.0)
    temp = readings.get("temperature_c", 0.0)
    ir = readings.get("infrared_c", 0.0)
    current = readings.get("current_a", 0.0)
    micro = readings.get("micro_movement_um", 0.0)
    align = readings.get("alignment_dev_mm", 0.0)
    acoust = readings.get("acoustic_db", 0.0)

    # 1. Bearing Wear Pattern (MCH001, MCH002)
    if machine_id in ["MCH001", "MCH002"]:
        c1 = vib > 2.8
        c2 = acoust > 74.0
        c3 = micro > 10.0
        c4 = temp > 58.0
        matched = sum([c1, c2, c3, c4])

        if matched >= 2:
            pts = 16.0 if matched >= 3 else 8.0
            total_penalty += pts
            hypotheses.append({
                "hypothesis": "Possible Bearing Deterioration",
                "matched_conditions": matched,
                "total_conditions": 4,
                "conditions": [
                    {"name": "Vibration RMS Elevated", "matched": bool(c1)},
                    {"name": "Acoustic Noise Elevated", "matched": bool(c2)},
                    {"name": "Mechanical Micro Movement Elevated", "matched": bool(c3)},
                    {"name": "Spindle Friction Temperature Elevated", "matched": bool(c4)}
                ]
            })
            pattern_reasons.append({
                "factor": "Bearing Wear Pattern",
                "observed": matched,
                "limit": 4,
                "unit": "conditions",
                "points": -pts,
                "note": f"Matched {matched} of 4 conditions: high vibration, acoustic spike, and friction heat."
            })

    # 2. Motor Overheating / Overload Pattern
    c_m1 = temp > 66.0
    c_m2 = ir > 72.0
    c_m3 = current > 20.0
    m_matched = sum([c_m1, c_m2, c_m3])

    if m_matched >= 2:
        pts = 18.0 if m_matched == 3 else 10.0
        total_penalty += pts
        hypotheses.append({
            "hypothesis": "Possible Motor Overheating / Overload",
            "matched_conditions": m_matched,
            "total_conditions": 3,
            "conditions": [
                {"name": "Spindle / Drive Temperature High", "matched": bool(c_m1)},
                {"name": "Infrared Thermal Hotspot High", "matched": bool(c_m2)},
                {"name": "Electrical Current Draw Elevated", "matched": bool(c_m3)}
            ]
        })
        pattern_reasons.append({
            "factor": "Motor Overheating Pattern",
            "observed": m_matched,
            "limit": 3,
            "unit": "conditions",
            "points": -pts,
            "note": f"Matched {m_matched} of 3 conditions: thermal rise and electrical load."
        })

    # 3. Mechanical Misalignment Pattern
    if machine_id in ["MCH001", "MCH002"]:
        c_a1 = align > 0.05
        c_a2 = vib > 2.6
        c_a3 = temp > 56.0
        a_matched = sum([c_a1, c_a2, c_a3])

        if a_matched >= 2:
            pts = 12.0
            total_penalty += pts
            hypotheses.append({
                "hypothesis": "Possible Mechanical Misalignment",
                "matched_conditions": a_matched,
                "total_conditions": 3,
                "conditions": [
                    {"name": "Shaft Alignment Deviation High", "matched": bool(c_a1)},
                    {"name": "Vibration Harmonics Elevated", "matched": bool(c_a2)},
                    {"name": "Coupling Friction Temperature Elevated", "matched": bool(c_a3)}
                ]
            })
            pattern_reasons.append({
                "factor": "Shaft Misalignment Pattern",
                "observed": a_matched,
                "limit": 3,
                "unit": "conditions",
                "points": -pts,
                "note": f"Matched {a_matched} of 3 conditions: angular deviation and cyclic vibration."
            })

    # 4. Conveyor Belt Slip / Tracking Pattern (MCH002)
    if machine_id == "MCH002":
        c_b1 = current > 11.0
        c_b2 = micro > 7.0
        c_b3 = vib > 2.0
        b_matched = sum([c_b1, c_b2, c_b3])

        if b_matched >= 2:
            pts = 14.0
            total_penalty += pts
            hypotheses.append({
                "hypothesis": "Possible Conveyor Belt Damage / Slip",
                "matched_conditions": b_matched,
                "total_conditions": 3,
                "conditions": [
                    {"name": "Motor Current Draw High", "matched": bool(c_b1)},
                    {"name": "Micro Displacement Elevated", "matched": bool(c_b2)},
                    {"name": "Belt Path Vibration Elevated", "matched": bool(c_b3)}
                ]
            })
            pattern_reasons.append({
                "factor": "Conveyor Belt Slip Pattern",
                "observed": b_matched,
                "limit": 3,
                "unit": "conditions",
                "points": -pts,
                "note": f"Matched {b_matched} of 3 conditions: torque surge and structural displacement."
            })

    return round(total_penalty, 1), hypotheses, pattern_reasons
