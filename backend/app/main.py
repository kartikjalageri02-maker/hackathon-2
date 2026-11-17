import time
import asyncio
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.db import engine, Base
from app.api.router import api_router
from app.ws.routes import router as ws_router
from app.services.simulation.engine import simulation_engine
from app.services.ingestion.pipeline import ingest_reading

start_time = time.time()


async def background_simulation_loop():
    """Single in-process simulation loop ticking every 1.0s."""
    print("Starting background simulation telemetry loop...")
    while True:
        try:
            readings_list = await simulation_engine.get_next_readings()
            for machine_id, readings, tag in readings_list:
                await ingest_reading(machine_id=machine_id, readings=readings, scenario_tag=tag)
        except Exception as e:
            print(f"Error in simulation loop: {e}")
        await asyncio.sleep(settings.SIMULATION_TICK_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    # Spawn single background simulation task
    sim_task = asyncio.create_task(background_simulation_loop())
    yield
    # Cleanup on shutdown
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="Beyond the Factory Floor API",
    description="Industrial monitoring, predictive maintenance, and decision support with 3D digital twin.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc),
                "details": {"path": str(request.url.path)}
            }
        }
    )


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "simulation": "running",
        "uptime_seconds": round(time.time() - start_time, 1),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


app.include_router(api_router)
app.include_router(ws_router)
