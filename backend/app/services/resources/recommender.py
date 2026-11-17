from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.machine import Machine
from app.models.component import Component
from app.models.alert import Alert
from app.models.analysis import AnalysisSnapshot
from app.models.resource import SparePart, PartCompatibility, Technician, TechnicianQualification, MaintenanceTask
from app.services.dependency.impact import dependency_service


class RecommenderService:
    def get_recommendations(self, machine_id: Optional[str], db: Session) -> List[Dict[str, Any]]:
        # Get machine query
        if machine_id:
            machines = db.query(Machine).filter(Machine.id == machine_id).all()
        else:
            machines = db.query(Machine).all()

        impact_data = dependency_service.calculate_impact(db)
        recommendations = []

        for m in machines:
            # Check latest analysis and active alerts
            snap = db.query(AnalysisSnapshot).filter(
                AnalysisSnapshot.machine_id == m.id
            ).order_by(AnalysisSnapshot.id.desc()).first()

            alert = db.query(Alert).filter(
                Alert.machine_id == m.id,
                Alert.status.in_(["active", "acknowledged"])
            ).order_by(Alert.created_at.desc()).first()

            health = snap.health_score if snap else 100.0
            risk = snap.risk_score if snap else 0.0

            # Only generate recommendation if there is an alert or health < 90
            if not alert and health >= 90.0:
                continue

            # Hypothesis / problem statement
            hypothesis_title = alert.title if alert else (
                snap.hypotheses[0]["hypothesis"] if snap and snap.hypotheses else f"Operating Parameter Deviation on {m.name}"
            )

            # Map hypothesis to relevant component
            component = None
            if "bearing" in hypothesis_title.lower():
                component = db.query(Component).filter(
                    Component.machine_id == m.id,
                    Component.name.ilike("%bearing%")
                ).first()
            elif "motor" in hypothesis_title.lower() or "overheat" in hypothesis_title.lower():
                component = db.query(Component).filter(
                    Component.machine_id == m.id,
                    Component.name.ilike("%motor%")
                ).first()
            elif "belt" in hypothesis_title.lower():
                component = db.query(Component).filter(
                    Component.machine_id == m.id,
                    Component.name.ilike("%belt%")
                ).first()
            elif "alignment" in hypothesis_title.lower():
                component = db.query(Component).filter(
                    Component.machine_id == m.id,
                    Component.name.ilike("%coupling%")
                ).first()

            if not component:
                component = db.query(Component).filter(Component.machine_id == m.id).first()

            # Compatible parts
            assigned_part = None
            if component:
                comp_parts = db.query(PartCompatibility).filter(
                    PartCompatibility.machine_id == m.id,
                    PartCompatibility.component_id == component.id
                ).all()

                for cp in comp_parts:
                    sp = db.query(SparePart).filter(SparePart.id == cp.part_id).first()
                    if sp:
                        if sp.quantity > 0:
                            assigned_part = {
                                "id": sp.id,
                                "name": sp.name,
                                "quantity": sp.quantity,
                                "is_substitute": False,
                                "lead_time_days": sp.lead_time_days
                            }
                            break
                        elif sp.alternative_part_id:
                            alt_sp = db.query(SparePart).filter(SparePart.id == sp.alternative_part_id).first()
                            if alt_sp and alt_sp.quantity > 0:
                                assigned_part = {
                                    "id": alt_sp.id,
                                    "name": f"{alt_sp.name} (Direct Substitute for {sp.id})",
                                    "quantity": alt_sp.quantity,
                                    "is_substitute": True,
                                    "lead_time_days": 0
                                }
                                break
                            else:
                                assigned_part = {
                                    "id": sp.id,
                                    "name": sp.name,
                                    "quantity": 0,
                                    "is_substitute": False,
                                    "lead_time_days": sp.lead_time_days
                                }
                        else:
                            assigned_part = {
                                "id": sp.id,
                                "name": sp.name,
                                "quantity": 0,
                                "is_substitute": False,
                                "lead_time_days": sp.lead_time_days
                            }

            if not assigned_part:
                # Default fallback part from inventory
                sp = db.query(SparePart).first()
                if sp:
                    assigned_part = {
                        "id": sp.id,
                        "name": sp.name,
                        "quantity": sp.quantity,
                        "is_substitute": False,
                        "lead_time_days": sp.lead_time_days
                    }

            # Qualified Technician
            assigned_tech = None
            quals = db.query(TechnicianQualification).filter(
                (TechnicianQualification.machine_id == m.id) | (TechnicianQualification.machine_type == m.type)
            ).order_by(TechnicianQualification.level.desc()).all()

            for q in quals:
                t = db.query(Technician).filter(Technician.id == q.technician_id).first()
                if t and t.availability == "Available":
                    assigned_tech = {
                        "id": t.id,
                        "name": t.name,
                        "specialisation": t.specialisation,
                        "shift": t.shift,
                        "level": q.level,
                        "is_cross_qualified": False
                    }
                    break

            if not assigned_tech:
                # Find any available technician or highest level
                for q in quals:
                    t = db.query(Technician).filter(Technician.id == q.technician_id).first()
                    if t:
                        assigned_tech = {
                            "id": t.id,
                            "name": f"{t.name} (Standby {t.availability})",
                            "specialisation": t.specialisation,
                            "shift": t.shift,
                            "level": q.level,
                            "is_cross_qualified": True
                        }
                        break

            if not assigned_tech:
                t = db.query(Technician).first()
                assigned_tech = {
                    "id": t.id,
                    "name": t.name,
                    "specialisation": t.specialisation,
                    "shift": t.shift,
                    "level": 1,
                    "is_cross_qualified": True
                }

            # Steps
            if "bearing" in hypothesis_title.lower():
                steps = [
                    "Acoustic vibration spectrum check at 2.4 kHz center frequency.",
                    "Lock out spindle drive and inspect runout tolerance (<0.005 mm).",
                    "Replace worn bearing set and repack with high-speed synthetic grease.",
                    "Perform 15-minute low speed spindle break-in test."
                ]
            elif "motor" in hypothesis_title.lower() or "overheat" in hypothesis_title.lower():
                steps = [
                    "Thermal imaging scan across stator winding core.",
                    "Check electrical current draw balance across phases L1-L3.",
                    "Clean dust buildup from forced air cooling shroud.",
                    "Test motor thermal sensor resistance curve."
                ]
            else:
                steps = [
                    "Perform visual alignment and fastener torque verification.",
                    "Check operational telemetry on linked sensor.",
                    "Inspect mechanical wear surfaces for micro-scoring.",
                    "Recalibrate zero-point baseline."
                ]

            # Priority
            lost_uph = impact_data.get("lost_uph", 0.0)
            if risk >= 60.0 or lost_uph >= 20.0:
                priority = "Urgent"
            elif risk >= 30.0 or lost_uph >= 10.0:
                priority = "High"
            elif risk >= 15.0:
                priority = "Medium"
            else:
                priority = "Low"

            # Contingency
            if assigned_part and assigned_part.get("quantity", 0) == 0:
                contingency = f"Primary part out of stock. Derate line speed to 70% nominal until procurement lead time ({assigned_part.get('lead_time_days', 5)} days) resolves."
            elif assigned_tech and assigned_tech.get("is_cross_qualified"):
                contingency = "Primary specialist on duty elsewhere. Dispatch cross-qualified mechatronics technician under remote senior engineer supervision."
            else:
                contingency = "Execute 45-minute scheduled line window during upcoming shift change to prevent unplanned downtime."

            # Itemized Why chain
            why_chain = [
                {
                    "factor": "Physical Health Deficit",
                    "justification": f"Machine health score degraded to {health:.1f}% with risk index {risk:.1f}/100."
                },
                {
                    "factor": "Production Starvation Impact",
                    "justification": f"Constraining line throughput by estimated {lost_uph:.1f} lost UPH (${impact_data.get('estimated_hourly_loss_usd', 0):.2f}/hr revenue impact)."
                },
                {
                    "factor": "Resource Availability Check",
                    "justification": f"Part '{assigned_part['name']}' selected (Stock: {assigned_part.get('quantity', 0)}). Tech '{assigned_tech['name']}' ({assigned_tech['specialisation']}) assigned."
                }
            ]

            recommendations.append({
                "id": f"REC_{m.id}_{int(snap.ts.timestamp()) if snap else 100}",
                "machine_id": m.id,
                "component_id": component.id if component else None,
                "priority": priority,
                "problem_statement": hypothesis_title,
                "inspection_steps": steps,
                "assigned_part": assigned_part,
                "assigned_technician": assigned_tech,
                "estimated_downtime_minutes": 45,
                "contingency_plan": contingency,
                "why": why_chain
            })

        return recommendations


recommender_service = RecommenderService()
