from typing import List, Tuple, Dict, Any
from app.services.ingestion.reading_source import ReadingSource
from app.services.simulation.generator import SensorGenerator
from app.services.simulation.scenarios import ScenarioManager


class SimulationEngine(ReadingSource):
    def __init__(self):
        self.generator = SensorGenerator(seed=42)
        self.scenario_manager = ScenarioManager()
        self.tick_count = 0
        self.machines = ["MCH001", "MCH002", "MCH003"]

    async def get_next_readings(self) -> List[Tuple[str, Dict[str, Any], str | None]]:
        self.tick_count += 1
        results = []

        for mid in self.machines:
            raw_readings = self.generator.generate_tick(mid, self.tick_count)
            final_readings, tag = self.scenario_manager.apply_modifications(mid, raw_readings, dt=1.0)
            results.append((mid, final_readings, tag))

        return results


simulation_engine = SimulationEngine()
