from dataclasses import dataclass
from typing import Dict, List, Optional
import numpy as np


@dataclass
class ScenarioDefinition:
    id: str
    name: str
    description: str
    target_machines: List[str]
    sensor_signatures: List[str]
    linked_component: str


AVAILABLE_SCENARIOS: Dict[str, ScenarioDefinition] = {
    "motor_overheating": ScenarioDefinition(
        id="motor_overheating",
        name="Motor Overheating",
        description="Thermal runaway in spindle/drive motor accompanied by infrared hotspot.",
        target_machines=["MCH001", "MCH002", "MCH003"],
        sensor_signatures=["temperature_c", "infrared_c", "current_a"],
        linked_component="Drive / Spindle Motor",
    ),
    "bearing_wear": ScenarioDefinition(
        id="bearing_wear",
        name="Bearing Deterioration",
        description="High frequency acoustic emission and vibration harmonics from bearing raceway pitting.",
        target_machines=["MCH001", "MCH002"],
        sensor_signatures=["vibration_mm_s", "acoustic_db", "micro_movement_um", "temperature_c"],
        linked_component="Spindle / Roller Bearings",
    ),
    "belt_damage": ScenarioDefinition(
        id="belt_damage",
        name="Conveyor Belt Damage",
        description="Belt slippage and tension loss causing motor current fluctuations and micro vibration.",
        target_machines=["MCH002"],
        sensor_signatures=["current_a", "micro_movement_um", "vibration_mm_s"],
        linked_component="Drive Belt",
    ),
    "electrical_overload": ScenarioDefinition(
        id="electrical_overload",
        name="Electrical Overload",
        description="Abrupt high current surge, power inverter thermal accumulation, and critical risk.",
        target_machines=["MCH001", "MCH002", "MCH003"],
        sensor_signatures=["current_a", "infrared_c", "temperature_c"],
        linked_component="Power / Inverter Module",
    ),
    "misalignment": ScenarioDefinition(
        id="misalignment",
        name="Mechanical Misalignment",
        description="Shaft coupling angular deviation, cyclic structural vibration, and friction heat.",
        target_machines=["MCH001", "MCH002"],
        sensor_signatures=["alignment_dev_mm", "vibration_mm_s", "temperature_c"],
        linked_component="Flexible Coupling",
    ),
}


class ScenarioManager:
    def __init__(self):
        self.active_scenario: Optional[str] = None
        self.target_machine_id: Optional[str] = None
        self.elapsed_seconds: float = 0.0
        self.duration_seconds: float = 60.0
        self.speed: float = 1.0
        self.spikes: Dict[str, Dict[str, float]] = {}  # (machine_id, sensor) -> remaining_magnitude

    def start_scenario(self, scenario_id: str, machine_id: str, duration: float = 60.0, speed: float = 1.0):
        if scenario_id in AVAILABLE_SCENARIOS:
            self.active_scenario = scenario_id
            self.target_machine_id = machine_id
            self.elapsed_seconds = 0.0
            self.duration_seconds = max(10.0, duration)
            self.speed = max(0.5, min(5.0, speed))

    def trigger_spike(self, machine_id: str, sensor: str, magnitude: float):
        if machine_id not in self.spikes:
            self.spikes[machine_id] = {}
        self.spikes[machine_id][sensor] = magnitude

    def reset(self):
        self.active_scenario = None
        self.target_machine_id = None
        self.elapsed_seconds = 0.0
        self.spikes.clear()

    def apply_modifications(self, machine_id: str, readings: Dict[str, float], dt: float = 1.0) -> tuple[Dict[str, float], Optional[str]]:
        scenario_tag = None

        # 1. Apply active failure scenario ramps
        if self.active_scenario and self.target_machine_id == machine_id:
            scenario_tag = self.active_scenario
            self.elapsed_seconds += dt * self.speed
            progress = min(1.0, self.elapsed_seconds / self.duration_seconds)

            if self.active_scenario == "motor_overheating":
                readings["temperature_c"] += round(38.0 * (progress ** 1.2), 1)
                readings["infrared_c"] += round(45.0 * (progress ** 1.1), 1)
                readings["current_a"] += round(4.5 * progress, 1)

            elif self.active_scenario == "bearing_wear":
                readings["vibration_mm_s"] += round(4.2 * (progress ** 1.4), 2)
                readings["acoustic_db"] += round(22.0 * (progress ** 1.3), 1)
                readings["micro_movement_um"] += round(24.0 * (progress ** 1.5), 1)
                readings["temperature_c"] += round(14.0 * progress, 1)

            elif self.active_scenario == "belt_damage":
                fluct = 2.0 * np.sin(4.0 * np.pi * (self.elapsed_seconds / 5.0))
                readings["current_a"] += round(6.0 * progress + fluct, 1)
                readings["micro_movement_um"] += round(18.0 * (progress ** 1.3), 1)
                readings["vibration_mm_s"] += round(2.8 * progress, 2)

            elif self.active_scenario == "electrical_overload":
                readings["current_a"] += round(18.0 * (progress ** 0.8), 1)
                readings["infrared_c"] += round(35.0 * (progress ** 1.2), 1)
                readings["temperature_c"] += round(26.0 * progress, 1)

            elif self.active_scenario == "misalignment":
                readings["alignment_dev_mm"] += round(0.18 * (progress ** 1.2), 4)
                readings["vibration_mm_s"] += round(3.2 * (progress ** 1.1), 2)
                readings["temperature_c"] += round(10.0 * progress, 1)

        # 2. Apply single abnormal sensor spikes with exponential decay
        if machine_id in self.spikes:
            for sensor, mag in list(self.spikes[machine_id].items()):
                if sensor in readings:
                    readings[sensor] += round(mag, 2)
                # Exponential decay
                new_mag = mag * 0.75
                if abs(new_mag) < 0.05:
                    del self.spikes[machine_id][sensor]
                else:
                    self.spikes[machine_id][sensor] = new_mag

        return readings, scenario_tag
