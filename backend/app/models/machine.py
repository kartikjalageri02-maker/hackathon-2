from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.db import Base


class Machine(Base):
    __tablename__ = "machines"

    id = Column(String(16), primary_key=True)  # MCH001, MCH002, MCH003
    name = Column(String(64), nullable=False)
    type = Column(String(32), nullable=False)  # milling_centre, conveyor, packaging
    role_in_line = Column(String(32), nullable=False)  # upstream, midstream, downstream
    nominal_throughput_uph = Column(Integer, nullable=False, default=120)
    criticality_weight = Column(Float, nullable=False, default=1.0)
    model_url = Column(String(255), nullable=True)
    pos_x = Column(Float, nullable=False, default=0.0)
    pos_y = Column(Float, nullable=False, default=0.0)
    pos_z = Column(Float, nullable=False, default=0.0)
    rot_y = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    thresholds = relationship("MachineThreshold", back_populates="machine", cascade="all, delete-orphan")
    components = relationship("Component", back_populates="machine", cascade="all, delete-orphan")
    readings = relationship("SensorReading", back_populates="machine", cascade="all, delete-orphan")
    snapshots = relationship("AnalysisSnapshot", back_populates="machine", cascade="all, delete-orphan")
    alerts = relationship("Alert", foreign_keys="[Alert.machine_id]", back_populates="machine", cascade="all, delete-orphan")


class MachineDependency(Base):
    __tablename__ = "machine_dependencies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    upstream_id = Column(String(16), ForeignKey("machines.id"), nullable=False)
    downstream_id = Column(String(16), ForeignKey("machines.id"), nullable=False)
    propagation_factor = Column(Float, nullable=False, default=1.0)
    description = Column(String(255), nullable=False)

    __table_args__ = (
        UniqueConstraint("upstream_id", "downstream_id", name="uq_machine_dependency"),
    )


class MachineThreshold(Base):
    __tablename__ = "machine_thresholds"

    id = Column(Integer, primary_key=True, autoincrement=True)
    machine_id = Column(String(16), ForeignKey("machines.id"), nullable=False, index=True)
    sensor = Column(String(32), nullable=False, index=True)
    unit = Column(String(16), nullable=False)
    normal_low = Column(Float, nullable=False)
    normal_high = Column(Float, nullable=False)
    warning = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    critical = Column(Float, nullable=False)
    weight = Column(Float, nullable=False, default=1.0)

    machine = relationship("Machine", back_populates="thresholds")
