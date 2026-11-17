import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.db import Base, engine
from app.seed.seed import seed_database


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield


@pytest.fixture
def client():
    return TestClient(app)
