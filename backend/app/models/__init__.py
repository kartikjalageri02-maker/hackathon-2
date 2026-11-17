from app.core.db import Base
from app.models.machine import Machine, MachineDependency, MachineThreshold
from app.models.reading import SensorReading
from app.models.analysis import AnalysisSnapshot
from app.models.component import Component, MaintenanceRecord
from app.models.resource import SparePart, PartCompatibility, Technician, TechnicianQualification, MaintenanceTask
from app.models.alert import Alert, AlertEvent, SimulationRun

__all__ = [
    "Base",
    "Machine",
    "MachineDependency",
    "MachineThreshold",
    "SensorReading",
    "AnalysisSnapshot",
    "Component",
    "MaintenanceRecord",
    "SparePart",
    "PartCompatibility",
    "Technician",
    "TechnicianQualification",
    "MaintenanceTask",
    "Alert",
    "AlertEvent",
    "SimulationRun",
]
