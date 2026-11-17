from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from app.core.db import Base


class SparePart(Base):
    __tablename__ = "spare_parts"

    id = Column(String(32), primary_key=True)  # SP001_BEARING_SET
    name = Column(String(64), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    reorder_level = Column(Integer, nullable=False, default=2)
    lead_time_days = Column(Integer, nullable=False, default=5)
    alternative_part_id = Column(String(32), ForeignKey("spare_parts.id"), nullable=True)

    alternative_part = relationship("SparePart", remote_side=[id])


class PartCompatibility(Base):
    __tablename__ = "part_compatibility"

    id = Column(Integer, primary_key=True, autoincrement=True)
    part_id = Column(String(32), ForeignKey("spare_parts.id"), nullable=False)
    machine_id = Column(String(16), ForeignKey("machines.id"), nullable=False)
    component_id = Column(String(32), ForeignKey("components.id"), nullable=True)

    __table_args__ = (
        UniqueConstraint("part_id", "machine_id", "component_id", name="uq_part_compatibility"),
    )


class Technician(Base):
    __tablename__ = "technicians"

    id = Column(String(16), primary_key=True)  # TCH001
    name = Column(String(64), nullable=False)
    specialisation = Column(String(32), nullable=False)  # Mechanical, Electrical, Mechatronics, Automation
    availability = Column(String(16), nullable=False, default="Available")  # Available, On Duty, Unavailable, Off Shift
    shift = Column(String(16), nullable=False, default="Morning")  # Morning, Evening, Night
    current_task_id = Column(String(32), nullable=True)

    records = relationship("MaintenanceRecord", back_populates="technician")
    qualifications = relationship("TechnicianQualification", back_populates="technician")


class TechnicianQualification(Base):
    __tablename__ = "technician_qualifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    technician_id = Column(String(16), ForeignKey("technicians.id"), nullable=False)
    machine_id = Column(String(16), ForeignKey("machines.id"), nullable=True)
    machine_type = Column(String(32), nullable=True)
    level = Column(Integer, nullable=False, default=1)  # 1 to 3

    technician = relationship("Technician", back_populates="qualifications")


class MaintenanceTask(Base):
    __tablename__ = "maintenance_tasks"

    id = Column(String(32), primary_key=True)  # TSK0101
    machine_id = Column(String(16), ForeignKey("machines.id"), nullable=False)
    component_id = Column(String(32), ForeignKey("components.id"), nullable=True)
    alert_id = Column(String(32), ForeignKey("alerts.id"), nullable=True)
    priority = Column(String(16), nullable=False, default="Medium")  # Low, Medium, High, Urgent
    part_id = Column(String(32), ForeignKey("spare_parts.id"), nullable=True)
    technician_id = Column(String(16), ForeignKey("technicians.id"), nullable=True)
    status = Column(String(16), nullable=False, default="proposed")  # proposed, approved, in_progress, completed, cancelled
    rationale = Column(JSON, nullable=False, default=list)  # list of {factor, justification}
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
