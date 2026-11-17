from datetime import datetime, timezone
from sqlalchemy import Column, BigInteger, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.db import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    machine_id = Column(String(16), ForeignKey("machines.id"), nullable=False, index=True)
    ts = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    temperature_c = Column(Float, nullable=False)
    vibration_mm_s = Column(Float, nullable=False)
    current_a = Column(Float, nullable=False)
    pressure_bar = Column(Float, nullable=False)
    infrared_c = Column(Float, nullable=False)
    micro_movement_um = Column(Float, nullable=False)
    alignment_dev_mm = Column(Float, nullable=False)
    acoustic_db = Column(Float, nullable=False)
    scenario_tag = Column(String(64), nullable=True)

    machine = relationship("Machine", back_populates="readings")

    __table_args__ = (
        Index("idx_sensor_readings_machine_ts", "machine_id", ts.desc()),
    )
