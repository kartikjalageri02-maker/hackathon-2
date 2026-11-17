import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Dict, Tuple, Optional
from app.services.simulation.profiles import MACHINE_PROFILES


class IsolationForestService:
    def __init__(self):
        self.models: Dict[str, IsolationForest] = {}
        self.scalers: Dict[str, StandardScaler] = {}
        self.sensors_order = [
            "temperature_c", "vibration_mm_s", "current_a", "pressure_bar",
            "infrared_c", "micro_movement_um", "alignment_dev_mm", "acoustic_db"
        ]
        self.is_trained = False

    def train_baseline_models(self):
        if self.is_trained:
            return

        rng = np.random.default_rng(42)
        n_samples = 400

        for mid, profiles in MACHINE_PROFILES.items():
            data = np.zeros((n_samples, len(self.sensors_order)))

            for i, sensor in enumerate(self.sensors_order):
                base = profiles[sensor]
                data[:, i] = rng.normal(base.mean, base.noise_sigma * 1.5, n_samples)

            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(data)

            model = IsolationForest(
                n_estimators=35,
                contamination=0.03,
                random_state=42,
                n_jobs=1
            )
            model.fit(scaled_data)

            self.scalers[mid] = scaler
            self.models[mid] = model

        self.is_trained = True

    def evaluate(self, machine_id: str, readings: Dict[str, float]) -> Tuple[float, Optional[Dict]]:
        if not self.is_trained:
            self.train_baseline_models()

        scaler = self.scalers.get(machine_id)
        model = self.models.get(machine_id)

        if not scaler or not model:
            return 0.0, None

        # Build feature vector in fixed order
        vec = np.array([[readings.get(s, MACHINE_PROFILES[machine_id][s].mean) for s in self.sensors_order]])
        scaled_vec = scaler.transform(vec)

        # Raw score: lower score means more abnormal
        raw_score = float(-model.score_samples(scaled_vec)[0])
        # Map to 0.0 to 1.0 deviation index
        anomaly_index = float(np.clip((raw_score - 0.38) / 0.30, 0.0, 1.0))

        # Strictly capped at 15.0 points
        penalty = round(15.0 * anomaly_index, 1)

        reason = None
        if penalty >= 2.0:
            reason = {
                "factor": "Statistical pattern check (Isolation Forest)",
                "observed": round(raw_score, 2),
                "limit": 0.40,
                "unit": "score",
                "points": -penalty,
                "note": "Multivariate pattern drift detected across sensor correlation matrix."
            }

        return penalty, reason


isolation_forest_service = IsolationForestService()
