from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class ScenarioInfo(BaseModel):
    id: str
    name: str
    description: str
    target_machines: List[str]
    sensor_signatures: List[str]
    linked_component: str


class SimulationStateResponse(BaseModel):
    active_scenario: Optional[str] = None
    target_machine_id: Optional[str] = None
    elapsed_seconds: float = 0.0
    duration_seconds: float = 60.0
    speed: float = 1.0
    status: str = "idle"  # idle, running, completed


class StartScenarioRequest(BaseModel):
    machine_id: str
    duration_seconds: float = 60.0
    speed: float = 1.0


class AbnormalEventRequest(BaseModel):
    machine_id: str
    sensor: str
    magnitude: float
