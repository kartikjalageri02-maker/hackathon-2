from fastapi import APIRouter, HTTPException, status
from app.schemas.simulation import (
    ScenarioInfo,
    SimulationStateResponse,
    StartScenarioRequest,
    AbnormalEventRequest,
)
from app.services.simulation.scenarios import AVAILABLE_SCENARIOS
from app.services.simulation.engine import simulation_engine
from app.ws.hub import ws_hub

router = APIRouter(prefix="/simulation", tags=["Simulation"])


@router.get("/scenarios", response_model=list[ScenarioInfo])
def list_scenarios():
    return [
        ScenarioInfo(
            id=s.id,
            name=s.name,
            description=s.description,
            target_machines=s.target_machines,
            sensor_signatures=s.sensor_signatures,
            linked_component=s.linked_component,
        )
        for s in AVAILABLE_SCENARIOS.values()
    ]


@router.get("/state", response_model=SimulationStateResponse)
def get_simulation_state():
    mgr = simulation_engine.scenario_manager
    return SimulationStateResponse(
        active_scenario=mgr.active_scenario,
        target_machine_id=mgr.target_machine_id,
        elapsed_seconds=round(mgr.elapsed_seconds, 1),
        duration_seconds=round(mgr.duration_seconds, 1),
        speed=mgr.speed,
        status="running" if mgr.active_scenario else "idle",
    )


@router.post("/scenarios/{scenario}/start")
async def start_scenario(scenario: str, req: StartScenarioRequest):
    if scenario not in AVAILABLE_SCENARIOS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario '{scenario}' not found. Available: {list(AVAILABLE_SCENARIOS.keys())}"
        )

    simulation_engine.scenario_manager.start_scenario(
        scenario_id=scenario,
        machine_id=req.machine_id,
        duration=req.duration_seconds,
        speed=req.speed,
    )

    await ws_hub.broadcast("simulation.state", {
        "active_scenario": scenario,
        "target_machine_id": req.machine_id,
        "status": "running",
        "speed": req.speed
    })

    return {
        "status": "started",
        "scenario": scenario,
        "machine_id": req.machine_id,
        "duration_seconds": req.duration_seconds,
        "speed": req.speed
    }


@router.post("/events")
async def trigger_abnormal_event(req: AbnormalEventRequest):
    simulation_engine.scenario_manager.trigger_spike(
        machine_id=req.machine_id,
        sensor=req.sensor,
        magnitude=req.magnitude,
    )

    await ws_hub.broadcast("simulation.event", {
        "machine_id": req.machine_id,
        "sensor": req.sensor,
        "magnitude": req.magnitude
    })

    return {
        "status": "injected",
        "machine_id": req.machine_id,
        "sensor": req.sensor,
        "magnitude": req.magnitude
    }


@router.post("/reset")
async def reset_simulation():
    simulation_engine.scenario_manager.reset()

    await ws_hub.broadcast("simulation.state", {
        "active_scenario": None,
        "target_machine_id": None,
        "status": "idle"
    })

    return {"status": "reset", "message": "All machines restored to normal baseline."}
