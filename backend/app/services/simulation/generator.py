import numpy as np
from typing import Dict
from app.services.simulation.profiles import MACHINE_PROFILES, SensorBaseline


class SensorGenerator:
    def __init__(self, seed: int = 42):
        self.rng = np.random.default_rng(seed)
        # AR(1) state per machine and sensor: machine_id -> sensor -> previous_epsilon
        self.prev_noise: Dict[str, Dict[str, float]] = {
            mid: {sensor: 0.0 for sensor in MACHINE_PROFILES[mid]}
            for mid in MACHINE_PROFILES
        }
        self.phi = 0.72  # Autoregressive coefficient

    def generate_tick(self, machine_id: str, tick_count: int) -> Dict[str, float]:
        profiles = MACHINE_PROFILES.get(machine_id, {})
        readings = {}

        t = float(tick_count)
        # 10 minute slow diurnal / thermal cycle
        cycle = np.sin((2.0 * np.pi * t) / 600.0)
        # 45 second periodic workpiece load step
        load_step = 1.0 if (t % 45.0) < 22.5 else -0.5

        for sensor, baseline in profiles.items():
            # Calculate AR(1) noise: eps_t = phi * eps_{t-1} + eta_t
            sigma_eta = baseline.noise_sigma * np.sqrt(1.0 - self.phi ** 2)
            eta = self.rng.normal(0.0, sigma_eta)
            eps = self.phi * self.prev_noise[machine_id][sensor] + eta
            self.prev_noise[machine_id][sensor] = float(eps)

            # Composition: baseline + cycle + load + noise
            c_val = 0.04 * baseline.mean * cycle
            l_val = 0.05 * baseline.mean * load_step * (1.0 if sensor in ["current_a", "vibration_mm_s", "micro_movement_um"] else 0.2)

            val = baseline.mean + c_val + l_val + eps

            # Format precision
            if sensor in ["alignment_dev_mm"]:
                readings[sensor] = round(float(max(0.0, val)), 4)
            elif sensor in ["vibration_mm_s"]:
                readings[sensor] = round(float(max(0.0, val)), 2)
            else:
                readings[sensor] = round(float(max(0.0, val)), 1)

        return readings
