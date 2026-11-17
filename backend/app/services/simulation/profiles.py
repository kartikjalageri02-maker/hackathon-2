from dataclasses import dataclass
from typing import Dict


@dataclass
class SensorBaseline:
    mean: float
    noise_sigma: float
    unit: str
    normal_low: float
    normal_high: float
    warning: float
    high: float
    critical: float


MACHINE_PROFILES: Dict[str, Dict[str, SensorBaseline]] = {
    "MCH001": {
        "temperature_c": SensorBaseline(52.0, 0.25, "°C", 35.0, 60.0, 68.0, 78.0, 88.0),
        "vibration_mm_s": SensorBaseline(1.20, 0.05, "mm/s", 0.5, 2.2, 3.0, 4.2, 5.8),
        "current_a": SensorBaseline(14.5, 0.15, "A", 10.0, 18.0, 22.0, 28.0, 35.0),
        "pressure_bar": SensorBaseline(6.0, 0.04, "bar", 5.2, 6.8, 7.4, 8.2, 9.0),
        "infrared_c": SensorBaseline(56.0, 0.30, "°C", 40.0, 64.0, 72.0, 82.0, 92.0),
        "micro_movement_um": SensorBaseline(4.5, 0.20, "µm", 1.0, 8.0, 12.0, 18.0, 25.0),
        "alignment_dev_mm": SensorBaseline(0.020, 0.002, "mm", 0.005, 0.035, 0.055, 0.085, 0.120),
        "acoustic_db": SensorBaseline(68.0, 0.40, "dB", 60.0, 72.0, 78.0, 84.0, 90.0),
    },
    "MCH002": {
        "temperature_c": SensorBaseline(38.0, 0.20, "°C", 25.0, 45.0, 52.0, 62.0, 72.0),
        "vibration_mm_s": SensorBaseline(0.80, 0.04, "mm/s", 0.3, 1.5, 2.2, 3.2, 4.5),
        "current_a": SensorBaseline(6.2, 0.10, "A", 4.0, 8.5, 11.0, 14.5, 18.0),
        "pressure_bar": SensorBaseline(4.5, 0.03, "bar", 3.8, 5.2, 5.8, 6.5, 7.2),
        "infrared_c": SensorBaseline(40.0, 0.25, "°C", 28.0, 48.0, 55.0, 65.0, 75.0),
        "micro_movement_um": SensorBaseline(2.2, 0.15, "µm", 0.5, 4.5, 7.0, 11.0, 16.0),
        "alignment_dev_mm": SensorBaseline(0.015, 0.002, "mm", 0.005, 0.028, 0.045, 0.070, 0.100),
        "acoustic_db": SensorBaseline(58.0, 0.30, "dB", 50.0, 64.0, 70.0, 76.0, 82.0),
    },
    "MCH003": {
        "temperature_c": SensorBaseline(42.0, 0.22, "°C", 28.0, 50.0, 58.0, 68.0, 78.0),
        "vibration_mm_s": SensorBaseline(0.95, 0.05, "mm/s", 0.4, 1.8, 2.5, 3.6, 4.8),
        "current_a": SensorBaseline(8.8, 0.12, "A", 5.0, 12.0, 15.0, 19.0, 24.0),
        "pressure_bar": SensorBaseline(5.5, 0.04, "bar", 4.5, 6.2, 6.9, 7.8, 8.5),
        "infrared_c": SensorBaseline(44.0, 0.25, "°C", 32.0, 54.0, 62.0, 72.0, 82.0),
        "micro_movement_um": SensorBaseline(3.1, 0.18, "µm", 0.8, 6.0, 9.5, 14.0, 20.0),
        "alignment_dev_mm": SensorBaseline(0.018, 0.002, "mm", 0.005, 0.030, 0.050, 0.075, 0.105),
        "acoustic_db": SensorBaseline(62.0, 0.35, "dB", 55.0, 68.0, 74.0, 80.0, 86.0),
    },
}
