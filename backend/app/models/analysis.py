from datetime import datetime, timezone
from sqlalchemy import Column, BigInteger, Integer, String, Float, DateTime, ForeignKey, Index, JSON
from sqlalchemy.orm import relationship
from app.core.db import Base


class AnalysisSnapshot(Base):
    __tablename__ = "analysis_snapshots"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    machine_id = Column(String(16), ForeignKey("machines.id"), nullable=False, index=True)
    ts = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)

    health_score = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    severity = Column(String(16), nullable=False)  # Normal, Warning, High, Critical, Emergency

    reasons = Column(JSON, nullable=False, default=list)  # list of {factor, observed, limit, points, note}
    anomalies = Column(JSON, nullable=False, default=list)
    hypotheses = Column(JSON, nullable=False, default=list)

    machine = relationship("Machine", back_populates="snapshots")

    __table_args__ = (
        Index("idx_analysis_snapshots_machine_ts", "machine_id", ts.desc()),
    )
