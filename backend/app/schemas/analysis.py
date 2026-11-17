from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict


class ScoreReason(BaseModel):
    factor: str
    observed: float | int
    limit: float | int
    unit: str
    points: float
    note: str


class RuleCondition(BaseModel):
    name: str
    matched: bool


class Hypothesis(BaseModel):
    hypothesis: str
    matched_conditions: int
    total_conditions: int
    conditions: List[RuleCondition] = []


class AnalysisResponse(BaseModel):
    machine_id: str
    ts: datetime
    health_score: float
    risk_score: float
    severity: str
    reasons: List[ScoreReason] = []
    anomalies: List[Any] = []
    hypotheses: List[Hypothesis] = []

    model_config = ConfigDict(from_attributes=True)


class AnalysisHistoryPoint(BaseModel):
    ts: datetime
    health_score: float
    risk_score: float
    severity: str
