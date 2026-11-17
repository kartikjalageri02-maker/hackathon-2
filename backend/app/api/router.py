from fastapi import APIRouter
from app.api.routes import factory, machines, sensors, simulation, ingest, maintenance, analysis, dependencies, alerts, resources

api_router = APIRouter(prefix="/api")

api_router.include_router(factory.router)
api_router.include_router(machines.router)
api_router.include_router(sensors.router)
api_router.include_router(simulation.router)
api_router.include_router(ingest.router)
api_router.include_router(maintenance.router)
api_router.include_router(analysis.router)
api_router.include_router(dependencies.router)
api_router.include_router(alerts.router)
api_router.include_router(resources.router)
