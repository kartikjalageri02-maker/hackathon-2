from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel, ConfigDict


class SensorReadingChannels(BaseModel):
    temperature_c: float
    vibration_mm_s: float
    current_a: float
    pressure_bar: float
    infrared_c: float
    micro_movement_um: float
    alignment_dev_mm: float
    acoustic_db: float


class SensorReadingCreate(BaseModel):
    machine_id: str
    ts: Optional[datetime] = None
    readings: SensorReadingChannels
    scenario_tag: Optional[str] = None


class SensorReadingResponse(BaseModel):
    machine_id: str
    ts: datetime
    readings: SensorReadingChannels
    scenario_tag: Optional[str] = None


class SensorThresholdResponse(BaseModel):
    sensor: str
    unit: str
    normal_low: float
    normal_high: float
    warning: float
    high: float
    critical: float
    weight: float

    model_config = ConfigDict(from_attributes=True)


class SensorHistoryResponse(BaseModel):
    machine_id: str
    from_ts: datetime
    to_ts: datetime
    count: int
    series: list[Dict]
