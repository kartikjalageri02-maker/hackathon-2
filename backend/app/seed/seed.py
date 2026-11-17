import json
from pathlib import Path
from datetime import datetime, date, timezone, timedelta
from app.core.db import SessionLocal, Base, engine
from app.models.machine import Machine, MachineDependency, MachineThreshold
from app.models.component import Component, MaintenanceRecord
from app.models.resource import SparePart, PartCompatibility, Technician, TechnicianQualification
from app.models.analysis import AnalysisSnapshot


DATA_DIR = Path(__file__).resolve().parent / "data"


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Machines
        with open(DATA_DIR / "machines.json", "r", encoding="utf-8") as f:
            machines_data = json.load(f)
            for m in machines_data:
                db.merge(Machine(**m))
        db.commit()

        # 2. Seed Dependencies (MCH001 -> MCH002 -> MCH003)
        deps = [
            {
                "upstream_id": "MCH001",
                "downstream_id": "MCH002",
                "propagation_factor": 0.90,
                "description": "Milled parts feed directly onto transfer conveyor."
            },
            {
                "upstream_id": "MCH002",
                "downstream_id": "MCH003",
                "propagation_factor": 0.95,
                "description": "Conveyor routes sorted parts to boxing station."
            }
        ]
        for dep in deps:
            existing = db.query(MachineDependency).filter_by(
                upstream_id=dep["upstream_id"],
                downstream_id=dep["downstream_id"]
            ).first()
            if not existing:
                db.add(MachineDependency(**dep))
        db.commit()

        # 3. Seed Thresholds
        with open(DATA_DIR / "thresholds.json", "r", encoding="utf-8") as f:
            thresholds_data = json.load(f)
            for t in thresholds_data:
                existing = db.query(MachineThreshold).filter_by(
                    machine_id=t["machine_id"],
                    sensor=t["sensor"]
                ).first()
                if existing:
                    for key, val in t.items():
                        setattr(existing, key, val)
                else:
                    db.add(MachineThreshold(**t))
        db.commit()

        # 4. Seed Components
        with open(DATA_DIR / "components.json", "r", encoding="utf-8") as f:
            components_data = json.load(f)
            for c in components_data:
                c_copy = dict(c)
                c_copy["installed_on"] = date.fromisoformat(c["installed_on"])
                c_copy["scheduled_replacement_on"] = date.fromisoformat(c["scheduled_replacement_on"])
                c_copy["last_inspected_on"] = date.fromisoformat(c["last_inspected_on"])
                db.merge(Component(**c_copy))
        db.commit()

        # 5. Seed Spare Parts
        with open(DATA_DIR / "spare_parts.json", "r", encoding="utf-8") as f:
            parts_data = json.load(f)
            # First pass: create parts without foreign keys
            for p in parts_data:
                p_copy = dict(p)
                p_copy["alternative_part_id"] = None
                db.merge(SparePart(**p_copy))
            db.commit()

            # Second pass: link alternatives
            for p in parts_data:
                if p.get("alternative_part_id"):
                    part = db.query(SparePart).filter_by(id=p["id"]).first()
                    if part:
                        part.alternative_part_id = p["alternative_part_id"]
            db.commit()

        # 6. Seed Part Compatibility
        compatibilities = [
            {"part_id": "SP001_BEARING_SET", "machine_id": "MCH001", "component_id": "CMP001_SPINDLE_BEARING"},
            {"part_id": "SP002_BEARING_ALT", "machine_id": "MCH001", "component_id": "CMP001_SPINDLE_BEARING"},
            {"part_id": "SP003_DRIVE_BELT", "machine_id": "MCH002", "component_id": "CMP002_DRIVE_BELT"},
            {"part_id": "SP004_HD_DRIVE_BELT", "machine_id": "MCH002", "component_id": "CMP002_DRIVE_BELT"},
            {"part_id": "SP005_HEATER_CARTRIDGE", "machine_id": "MCH003", "component_id": "CMP003_SEALING_HEATER"},
            {"part_id": "SP006_SEAL_KIT", "machine_id": "MCH003", "component_id": "CMP003_PNEUMATIC_CYLINDER"},
            {"part_id": "SP007_ROTARY_BLADE", "machine_id": "MCH003", "component_id": "CMP003_CUTTER_ASSEMBLY"},
            {"part_id": "SP008_FLEX_COUPLING", "machine_id": "MCH001", "component_id": "CMP001_BALL_SCREW"},
            {"part_id": "SP009_MOTOR_BEARING", "machine_id": "MCH002", "component_id": "CMP002_ROLLER_BEARINGS"},
            {"part_id": "SP010_PRESSURE_REGULATOR", "machine_id": "MCH003", "component_id": "CMP003_PNEUMATIC_CYLINDER"},
            {"part_id": "SP011_SERVO_ENCODER", "machine_id": "MCH003", "component_id": "CMP003_FEED_SERVO"},
        ]
        for comp in compatibilities:
            existing = db.query(PartCompatibility).filter_by(
                part_id=comp["part_id"],
                machine_id=comp["machine_id"],
                component_id=comp["component_id"]
            ).first()
            if not existing:
                db.add(PartCompatibility(**comp))
        db.commit()

        # 7. Seed Technicians & Qualifications
        with open(DATA_DIR / "technicians.json", "r", encoding="utf-8") as f:
            tech_data = json.load(f)
            for t in tech_data:
                t_obj = {
                    "id": t["id"],
                    "name": t["name"],
                    "specialisation": t["specialisation"],
                    "availability": t["availability"],
                    "shift": t["shift"],
                    "current_task_id": None
                }
                db.merge(Technician(**t_obj))
                for q in t.get("qualifications", []):
                    existing_q = db.query(TechnicianQualification).filter_by(
                        technician_id=t["id"],
                        machine_id=q.get("machine_id")
                    ).first()
                    if not existing_q:
                        db.add(TechnicianQualification(
                            technician_id=t["id"],
                            machine_id=q.get("machine_id"),
                            level=q.get("level", 1)
                        ))
        db.commit()

        # 8. Seed Maintenance History (3 to 5 records per machine)
        now = datetime.now(timezone.utc)
        records = [
            {
                "id": "REC001",
                "machine_id": "MCH001",
                "component_id": "CMP001_SPINDLE_BEARING",
                "performed_on": now - timedelta(days=32),
                "type": "Preventive",
                "summary": "Grease lubrication replenishment and ultrasonic vibration check.",
                "technician_id": "TCH001"
            },
            {
                "id": "REC002",
                "machine_id": "MCH001",
                "component_id": "CMP001_BALL_SCREW",
                "performed_on": now - timedelta(days=74),
                "type": "Inspection",
                "summary": "Axis backlash verification and laser interferometer calibration.",
                "technician_id": "TCH001"
            },
            {
                "id": "REC003",
                "machine_id": "MCH001",
                "component_id": "CMP001_TOOL_CHANGER",
                "performed_on": now - timedelta(days=120),
                "type": "Corrective",
                "summary": "Replaced grip fingers and realigned pneumatic carousel.",
                "technician_id": "TCH003"
            },
            {
                "id": "REC004",
                "machine_id": "MCH002",
                "component_id": "CMP002_DRIVE_BELT",
                "performed_on": now - timedelta(days=28),
                "type": "Inspection",
                "summary": "Tension tracking audit and optical surface inspection.",
                "technician_id": "TCH002"
            },
            {
                "id": "REC005",
                "machine_id": "MCH002",
                "component_id": "CMP002_ROLLER_BEARINGS",
                "performed_on": now - timedelta(days=66),
                "type": "Preventive",
                "summary": "Cleaned idler sprockets and relubricated bearing blocks.",
                "technician_id": "TCH003"
            },
            {
                "id": "REC006",
                "machine_id": "MCH002",
                "component_id": "CMP002_GEAR_MOTOR",
                "performed_on": now - timedelta(days=95),
                "type": "Inspection",
                "summary": "Thermal imaging inspection and synthetic gear oil level top off.",
                "technician_id": "TCH002"
            },
            {
                "id": "REC007",
                "machine_id": "MCH003",
                "component_id": "CMP003_CUTTER_ASSEMBLY",
                "performed_on": now - timedelta(days=38),
                "type": "Corrective",
                "summary": "Honed rotary knife edge and checked pneumatic cylinder alignment.",
                "technician_id": "TCH005"
            },
            {
                "id": "REC008",
                "machine_id": "MCH003",
                "component_id": "CMP003_SEALING_HEATER",
                "performed_on": now - timedelta(days=50),
                "type": "Inspection",
                "summary": "Calibrated temperature PID controller and cleaned sealing platens.",
                "technician_id": "TCH005"
            },
            {
                "id": "REC009",
                "machine_id": "MCH003",
                "component_id": "CMP003_PNEUMATIC_CYLINDER",
                "performed_on": now - timedelta(days=82),
                "type": "Preventive",
                "summary": "Replaced polyurethane piston rod wiper and tested pressure relief valve.",
                "technician_id": "TCH002"
            }
        ]
        for r in records:
            db.merge(MaintenanceRecord(**r))
        db.commit()

        # 9. Baseline Analysis Snapshots
        for mid in ["MCH001", "MCH002", "MCH003"]:
            existing_snap = db.query(AnalysisSnapshot).filter_by(machine_id=mid).first()
            if not existing_snap:
                db.add(AnalysisSnapshot(
                    machine_id=mid,
                    ts=now,
                    health_score=98.5,
                    risk_score=2.0,
                    severity="Normal",
                    reasons=[],
                    anomalies=[],
                    hypotheses=[]
                ))
        db.commit()

        print("Database seeded successfully and idempotently.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
