from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MachinePosition(BaseModel):
    x: float
    y: float
    z: float


class MachineDimensions(BaseModel):
    width: float
    height: float
    depth: float


class MachineBase(BaseModel):
    id: str
    name: str
    type: str
    role_in_line: str
    nominal_throughput_uph: int
    criticality_weight: float
    model_url: Optional[str] = None


class MachineLayoutItem(BaseModel):
    id: str
    name: str
    type: str
    model_url: Optional[str] = None
    position: MachinePosition
    rotation: MachinePosition
    dimensions: MachineDimensions
    role_in_line: str


class FactoryLayoutResponse(BaseModel):
    machines: list[MachineLayoutItem]


class MachineSummary(MachineBase):
    health_score: float = 100.0
    risk_score: float = 0.0
    severity: str = "Normal"

    model_config = ConfigDict(from_attributes=True)


class MachineDetail(MachineSummary):
    pos_x: float
    pos_y: float
    pos_z: float
    rot_y: float
    components_count: int = 0
    active_alerts_count: int = 0
    created_at: Optional[datetime] = None


class FactorySummaryResponse(BaseModel):
    factory_health_score: float
    line_throughput_uph: int
    nominal_throughput_uph: int
    throughput_loss_percent: float
    machine_counts: dict
    active_alerts_count: int
    root_cause_machine_id: Optional[str] = None
    timestamp: datetime
