from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.services.dependency.impact import dependency_service

router = APIRouter(prefix="/dependencies", tags=["Dependencies"])


@router.get("/graph")
def get_dependency_graph(db: Session = Depends(get_db)):
    impact = dependency_service.calculate_impact(db)
    return {
        "nodes": impact["nodes"],
        "edges": impact["edges"],
        "root_cause_machine_id": impact["root_cause_machine_id"]
    }


@router.get("/impact")
def get_dependency_impact(db: Session = Depends(get_db)):
    return dependency_service.calculate_impact(db)
