from fastapi import APIRouter, status
from app.schemas.sensor import SensorReadingCreate
from app.services.ingestion.pipeline import ingest_reading

router = APIRouter(prefix="/ingest", tags=["Ingest"])


@router.post("/readings", status_code=status.HTTP_201_CREATED)
async def ingest_sensor_reading(payload: SensorReadingCreate):
    readings_dict = payload.readings.model_dump()
    result = await ingest_reading(
        machine_id=payload.machine_id,
        readings=readings_dict,
        scenario_tag=payload.scenario_tag,
        ts=payload.ts
    )
    return {
        "status": "ingested",
        "machine_id": payload.machine_id,
        "ts": result["ts"]
    }
