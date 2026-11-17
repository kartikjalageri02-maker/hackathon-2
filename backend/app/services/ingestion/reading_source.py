from abc import ABC, abstractmethod
from typing import List, Tuple, Dict, Any


class ReadingSource(ABC):
    @abstractmethod
    async def get_next_readings(self) -> List[Tuple[str, Dict[str, Any], str | None]]:
        """
        Returns a list of tuples: (machine_id, readings_dict, scenario_tag)
        for all active machines in the tick.
        """
        pass
