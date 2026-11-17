from datetime import date, datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict


class ComponentResponse(BaseModel):
    id: str
    machine_id: str
    name: str
    installed_on: date
    service_life_days: int
    calendar_life_remaining_days: int
    effective_life_remaining_days: int
    life_used_ratio: float = 0.0
    last_inspected_on: date
    inspection_interval_days: int
    inspection_overdue: bool
    condition: str
    linked_sensor: str
    sensor_stress_multiplier: float = 1.0
    early_deterioration: bool
    deterioration_reason: Optional[str] = None
    flag_replacement_due: bool = False
    flag_high_usage: bool = False

    model_config = ConfigDict(from_attributes=True)


class MaintenanceRecordResponse(BaseModel):
    id: str
    machine_id: str
    component_id: Optional[str] = None
    performed_on: datetime
    type: str
    summary: str
    technician_id: str

    model_config = ConfigDict(from_attributes=True)


class SparePartResponse(BaseModel):
    id: str
    name: str
    quantity: int
    reorder_level: int
    lead_time_days: int
    alternative_part_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TechnicianResponse(BaseModel):
    id: str
    name: str
    specialisation: str
    availability: str
    shift: str
    current_task_id: Optional[str] = None
    qualifications: List[Any] = []

    model_config = ConfigDict(from_attributes=True)


class RecommendationRationale(BaseModel):
    factor: str
    justification: str


class RecommendationResponse(BaseModel):
    id: str
    machine_id: str
    component_id: Optional[str] = None
    priority: str
    problem_statement: str
    inspection_steps: List[str]
    assigned_part: Optional[dict] = None
    assigned_technician: Optional[dict] = None
    estimated_downtime_minutes: int
    contingency_plan: Optional[str] = None
    why: List[RecommendationRationale]
