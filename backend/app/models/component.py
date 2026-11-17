from datetime import date, datetime, timezone
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.db import Base


class Component(Base):
    __tablename__ = "components"

    id = Column(String(32), primary_key=True)  # CMP001_SPINDLE_BEARING
    machine_id = Column(String(16), ForeignKey("machines.id"), nullable=False, index=True)
    name = Column(String(64), nullable=False)
    installed_on = Column(Date, nullable=False, default=date.today)
    service_life_days = Column(Integer, nullable=False)
    scheduled_replacement_on = Column(Date, nullable=False)
    inspection_interval_days = Column(Integer, nullable=False, default=90)
    last_inspected_on = Column(Date, nullable=False, default=date.today)
    condition = Column(String(16), nullable=False, default="Good")  # Good, Fair, Degraded, Critical
    linked_sensor = Column(String(32), nullable=False)

    machine = relationship("Machine", back_populates="components")
    maintenance_records = relationship("MaintenanceRecord", back_populates="component")


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(String(32), primary_key=True)  # REC001
    machine_id = Column(String(16), ForeignKey("machines.id"), nullable=False, index=True)
    component_id = Column(String(32), ForeignKey("components.id"), nullable=True)
    performed_on = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    type = Column(String(32), nullable=False)  # Inspection, Preventive, Corrective, Emergency
    summary = Column(Text, nullable=False)
    technician_id = Column(String(16), ForeignKey("technicians.id"), nullable=False)

    component = relationship("Component", back_populates="maintenance_records")
    technician = relationship("Technician", back_populates="records")
