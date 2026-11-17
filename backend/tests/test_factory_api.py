def test_factory_layout(client):
    response = client.get("/api/factory/layout")
    assert response.status_code == 200
    data = response.json()
    assert "machines" in data
    assert len(data["machines"]) == 3
    machine_ids = [m["id"] for m in data["machines"]]
    assert "MCH001" in machine_ids
    assert "MCH002" in machine_ids
    assert "MCH003" in machine_ids


def test_factory_summary(client):
    response = client.get("/api/factory/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["factory_health_score"] >= 80.0
    assert data["nominal_throughput_uph"] == 120
    assert data["machine_counts"]["total"] == 3


def test_list_machines(client):
    response = client.get("/api/machines")
    assert response.status_code == 200
    machines = response.json()
    assert len(machines) == 3


def test_get_machine_by_id(client):
    response = client.get("/api/machines/MCH001")
    assert response.status_code == 200
    mch = response.json()
    assert mch["id"] == "MCH001"
    assert mch["name"] == "Precision CNC Milling Centre"
    assert mch["components_count"] == 4


def test_get_machine_thresholds(client):
    response = client.get("/api/machines/MCH001/thresholds")
    assert response.status_code == 200
    thresholds = response.json()
    assert len(thresholds) == 8
    sensors = [t["sensor"] for t in thresholds]
    assert "temperature_c" in sensors
    assert "vibration_mm_s" in sensors


def test_get_machine_not_found(client):
    response = client.get("/api/machines/MCH999")
    assert response.status_code == 404
