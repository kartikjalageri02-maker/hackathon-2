from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.db import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(32), primary_key=True)  # ALR0042
    machine_id = Column(String(16), ForeignKey("machines.id"), nullable=False, index=True)
    root_cause_machine_id = Column(String(16), ForeignKey("machines.id"), nullable=False)
    severity = Column(String(16), nullable=False)  # Warning, High, Critical, Emergency
    title = Column(String(128), nullable=False)
    reason = Column(Text, nullable=False)
    risk_score = Column(Float, nullable=False, default=0.0)
    status = Column(String(16), nullable=False, default="active")  # active, acknowledged, resolved
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    acknowledged_by = Column(String(64), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(String(64), nullable=True)

    machine = relationship("Machine", foreign_keys=[machine_id], back_populates="alerts")
    events = relationship("AlertEvent", back_populates="alert", cascade="all, delete-orphan")


class AlertEvent(Base):
    __tablename__ = "alert_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_id = Column(String(32), ForeignKey("alerts.id"), nullable=False, index=True)
    ts = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    event = Column(String(32), nullable=False)  # created, escalated, acknowledged, deescalated, resolved
    from_severity = Column(String(16), nullable=True)
    to_severity = Column(String(16), nullable=False)
    actor = Column(String(64), nullable=False, default="system_engine")
    note = Column(Text, nullable=True)

    alert = relationship("Alert", back_populates="events")


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(String(32), primary_key=True)
    machine_id = Column(String(16), ForeignKey("machines.id"), nullable=False)
    scenario = Column(String(64), nullable=False)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime(timezone=True), nullable=True)
    speed = Column(Float, nullable=False, default=1.0)
    status = Column(String(16), nullable=False, default="running")  # running, completed, reset
