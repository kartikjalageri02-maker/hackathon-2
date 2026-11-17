from typing import List, Optional
from pydantic import BaseModel


class DependencyNode(BaseModel):
    id: str
    name: str
    health_score: float


class DependencyEdge(BaseModel):
    upstream_id: str
    downstream_id: str
    propagation_factor: float
    description: str


class DependencyGraphResponse(BaseModel):
    nodes: List[DependencyNode]
    edges: List[DependencyEdge]


class AffectedMachine(BaseModel):
    id: str
    status: str  # Fault Origin, Starved Downstream, Blocked Upstream, Normal
    health_derate: float
    effective_output_uph: int


class DependencyImpactResponse(BaseModel):
    nominal_line_uph: int
    effective_line_uph: int
    uph_loss: int
    loss_percentage: float
    root_cause_machine_id: Optional[str] = None
    fix_first_machine_id: Optional[str] = None
    affected_machines: List[AffectedMachine]
    estimated_hourly_revenue_loss_usd: float
