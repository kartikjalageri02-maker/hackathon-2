# Beyond the Factory Floor: REST & WebSocket API Specification

## 1. Overview & Conventions

- **Base URL:** `/api` (REST endpoints)
- **WebSocket URL:** `/ws/live`
- **Data Format:** JSON (`application/json; charset=utf-8`)
- **Timestamps:** ISO 8601 UTC strings (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- **Demo Role Header:** Mutating endpoints inspect the `X-Demo-Role` HTTP header (`Viewer`, `Operator`, `Supervisor`). If missing, defaults to `Viewer`.

---

## 2. Error Response Structure

All HTTP error responses adhere to a standardized JSON schema:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Machine with identifier MCH999 was not found.",
    "details": {
      "machine_id": "MCH999"
    }
  }
}
```

Standard HTTP Status Codes:
- `200 OK`: Request succeeded.
- `201 Created`: Resource created successfully.
- `400 Bad Request`: Invalid parameter or illegal state transition.
- `403 Forbidden`: Insufficient demo role permissions (e.g. Viewer attempting acknowledge).
- `404 Not Found`: Target entity not found.
- `422 Unprocessable Entity`: Schema validation failure.
- `500 Internal Server Error`: Server-side unhandled exception.

---

## 3. REST API Endpoints

### 3.1 Health Check

#### `GET /health`
Returns system health, database connectivity, and simulation status.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "database": "connected",
  "simulation": "running",
  "uptime_seconds": 3600.4,
  "timestamp": "2026-11-17T05:32:00.000Z"
}
```

---

### 3.2 Factory Endpoints

#### `GET /api/factory/summary`
Returns aggregate factory line status, overall health, production output, and alert counts.

**Response `200 OK`:**
```json
{
  "factory_health_score": 94.2,
  "line_throughput_uph": 118,
  "nominal_throughput_uph": 120,
  "throughput_loss_percent": 1.67,
  "machine_counts": {
    "total": 3,
    "normal": 2,
    "warning": 1,
    "critical": 0
  },
  "active_alerts_count": 1,
  "root_cause_machine_id": "MCH001",
  "timestamp": "2026-11-17T05:32:00.000Z"
}
```

#### `GET /api/factory/layout`
Supplies 3D coordinates, GLB asset URLs, and rotation metadata for rendering the digital twin.

**Response `200 OK`:**
```json
{
  "machines": [
    {
      "id": "MCH001",
      "name": "Precision CNC Milling Centre",
      "type": "milling_centre",
      "model_url": "/models/milling_centre.glb",
      "position": { "x": -6.0, "y": 0.0, "z": 0.0 },
      "rotation": { "x": 0.0, "y": 0.0, "z": 0.0 },
      "dimensions": { "width": 2.4, "height": 2.2, "depth": 2.0 },
      "role_in_line": "upstream"
    },
    {
      "id": "MCH002",
      "name": "Transfer Conveyor",
      "type": "conveyor",
      "model_url": "/models/conveyor.glb",
      "position": { "x": 0.0, "y": 0.0, "z": 0.0 },
      "rotation": { "x": 0.0, "y": 0.0, "z": 0.0 },
      "dimensions": { "width": 4.8, "height": 1.0, "depth": 1.2 },
      "role_in_line": "midstream"
    },
    {
      "id": "MCH003",
      "name": "Carton Packaging Machine",
      "type": "packaging",
      "model_url": "/models/packaging.glb",
      "position": { "x": 6.0, "y": 0.0, "z": 0.0 },
      "rotation": { "x": 0.0, "y": 0.0, "z": 0.0 },
      "dimensions": { "width": 2.6, "height": 2.0, "depth": 1.8 },
      "role_in_line": "downstream"
    }
  ]
}
```

---

### 3.3 Machines Endpoints

#### `GET /api/machines`
Lists all machines with their operational status and current health metrics.

**Response `200 OK`:**
```json
[
  {
    "id": "MCH001",
    "name": "Precision CNC Milling Centre",
    "type": "milling_centre",
    "role_in_line": "upstream",
    "nominal_throughput_uph": 120,
    "criticality_weight": 0.95,
    "health_score": 88.5,
    "risk_score": 14.2,
    "severity": "Warning"
  },
  {
    "id": "MCH002",
    "name": "Transfer Conveyor",
    "type": "conveyor",
    "role_in_line": "midstream",
    "nominal_throughput_uph": 120,
    "criticality_weight": 0.80,
    "health_score": 96.0,
    "risk_score": 5.0,
    "severity": "Normal"
  },
  {
    "id": "MCH003",
    "name": "Carton Packaging Machine",
    "type": "packaging",
    "role_in_line": "downstream",
    "nominal_throughput_uph": 120,
    "criticality_weight": 0.75,
    "health_score": 98.1,
    "risk_score": 2.5,
    "severity": "Normal"
  }
]
```

#### `GET /api/machines/{id}`
Returns granular metadata, nominal parameters, and active state for a specific machine.

**Response `200 OK`:**
```json
{
  "id": "MCH001",
  "name": "Precision CNC Milling Centre",
  "type": "milling_centre",
  "role_in_line": "upstream",
  "nominal_throughput_uph": 120,
  "criticality_weight": 0.95,
  "model_url": "/models/milling_centre.glb",
  "position": { "x": -6.0, "y": 0.0, "z": 0.0 },
  "rotation": { "x": 0.0, "y": 0.0, "z": 0.0 },
  "health_score": 88.5,
  "risk_score": 14.2,
  "severity": "Warning",
  "components_count": 4,
  "active_alerts_count": 1
}
```

---

### 3.4 Sensors Endpoints

#### `GET /api/machines/{id}/sensors/latest`
Returns the most recent single telemetry frame across all 8 sensor channels.

**Response `200 OK`:**
```json
{
  "machine_id": "MCH001",
  "ts": "2026-11-17T05:32:00.000Z",
  "readings": {
    "temperature_c": 64.2,
    "vibration_mm_s": 3.45,
    "current_a": 18.2,
    "pressure_bar": 5.92,
    "infrared_c": 68.7,
    "micro_movement_um": 14.3,
    "alignment_dev_mm": 0.04,
    "acoustic_db": 74.8
  },
  "scenario_tag": null
}
```

#### `GET /api/machines/{id}/sensors/history?minutes=15&sensors=vibration_mm_s,temperature_c`
Retrieves time-series telemetry within a historical time window.

**Response `200 OK`:**
```json
{
  "machine_id": "MCH001",
  "from_ts": "2026-11-17T05:17:00.000Z",
  "to_ts": "2026-11-17T05:32:00.000Z",
  "count": 900,
  "series": [
    {
      "ts": "2026-11-17T05:32:00.000Z",
      "temperature_c": 64.2,
      "vibration_mm_s": 3.45
    }
  ]
}
```

#### `GET /api/machines/{id}/thresholds`
Lists normal, warning, high, and critical boundary limits configured per sensor.

**Response `200 OK`:**
```json
[
  {
    "sensor": "temperature_c",
    "unit": "°C",
    "normal_low": 40.0,
    "normal_high": 65.0,
    "warning": 72.0,
    "high": 82.0,
    "critical": 90.0,
    "weight": 1.2
  },
  {
    "sensor": "vibration_mm_s",
    "unit": "mm/s",
    "normal_low": 0.5,
    "normal_high": 2.5,
    "warning": 3.2,
    "high": 4.5,
    "critical": 6.0,
    "weight": 1.8
  }
]
```

---

### 3.5 Analysis & Intelligence Endpoints

#### `GET /api/machines/{id}/analysis`
Retrieves the latest diagnostic evaluation, scoring breakdown, and itemized reasons.

**Response `200 OK`:**
```json
{
  "machine_id": "MCH001",
  "ts": "2026-11-17T05:32:00.000Z",
  "health_score": 78.4,
  "risk_score": 26.8,
  "severity": "Warning",
  "reasons": [
    {
      "factor": "Vibration RMS",
      "observed": 3.45,
      "limit": 3.20,
      "unit": "mm/s",
      "points": -8.5,
      "note": "Exceeded warning threshold of 3.20 mm/s"
    },
    {
      "factor": "Statistical pattern check (Isolation Forest)",
      "observed": 0.72,
      "limit": 0.50,
      "unit": "score",
      "points": -4.2,
      "note": "Multivariate anomaly score elevated"
    },
    {
      "factor": "Bearing Wear Pattern",
      "observed": 3,
      "limit": 4,
      "unit": "conditions",
      "points": -8.9,
      "note": "Matched 3 of 4 pattern conditions"
    }
  ],
  "hypotheses": [
    {
      "hypothesis": "Early Bearing Deterioration",
      "matched_conditions": 3,
      "total_conditions": 4,
      "conditions": [
        { "name": "Vibration Elevated", "matched": true },
        { "name": "Acoustic Noise Elevated", "matched": true },
        { "name": "Temperature Rising", "matched": true },
        { "name": "Micro Movement Critical", "matched": false }
      ]
    }
  ]
}
```

#### `GET /api/machines/{id}/analysis/history?minutes=60`
Retrieves trend history of health and risk scores.

---

### 3.6 Maintenance & Lifecycle Endpoints

#### `GET /api/machines/{id}/components`
Lists tracked machine components, calendar life remaining, and early deterioration flags.

**Response `200 OK`:**
```json
[
  {
    "id": "CMP001_SPINDLE_BEARING",
    "name": "High Speed Spindle Bearings",
    "installed_on": "2025-05-10",
    "service_life_days": 720,
    "calendar_life_remaining_days": 182,
    "effective_life_remaining_days": 114,
    "last_inspected_on": "2026-10-15",
    "inspection_interval_days": 90,
    "inspection_overdue": false,
    "condition": "Degraded",
    "linked_sensor": "vibration_mm_s",
    "early_deterioration": true,
    "deterioration_reason": "Calendar indicates healthy condition, but linked sensor vibration shows persistent elevation."
  }
]
```

#### `GET /api/machines/{id}/maintenance/history`
Retrieves historical maintenance records for the machine.

#### `GET /api/maintenance/overview`
Returns factory wide maintenance status, components needing replacement, and inspection queue.

---

### 3.7 Dependencies & Production Impact Endpoints

#### `GET /api/dependencies/graph`
Returns the complete machine dependency topology with propagation factors.

**Response `200 OK`:**
```json
{
  "nodes": [
    { "id": "MCH001", "name": "Precision CNC Milling Centre", "health_score": 78.4 },
    { "id": "MCH002", "name": "Transfer Conveyor", "health_score": 96.0 },
    { "id": "MCH003", "name": "Carton Packaging Machine", "health_score": 98.1 }
  ],
  "edges": [
    {
      "upstream_id": "MCH001",
      "downstream_id": "MCH002",
      "propagation_factor": 0.90,
      "description": "Milled parts feed directly onto transfer conveyor"
    },
    {
      "upstream_id": "MCH002",
      "downstream_id": "MCH003",
      "propagation_factor": 0.95,
      "description": "Conveyor routes sorted parts to boxing station"
    }
  ]
}
```

#### `GET /api/dependencies/impact`
Evaluates line bottlenecking, throughput derating, and root cause machine.

**Response `200 OK`:**
```json
{
  "nominal_line_uph": 120,
  "effective_line_uph": 94,
  "uph_loss": 26,
  "loss_percentage": 21.7,
  "root_cause_machine_id": "MCH001",
  "fix_first_machine_id": "MCH001",
  "affected_machines": [
    {
      "id": "MCH001",
      "status": "Fault Origin",
      "health_derate": 0.78,
      "effective_output_uph": 94
    },
    {
      "id": "MCH002",
      "status": "Starved Downstream",
      "health_derate": 1.0,
      "effective_output_uph": 94
    },
    {
      "id": "MCH003",
      "status": "Starved Downstream",
      "health_derate": 1.0,
      "effective_output_uph": 94
    }
  ],
  "estimated_hourly_revenue_loss_usd": 780.0
}
```

---

### 3.8 Alerts Endpoints

#### `GET /api/alerts?status=active`
Lists active or historical alerts filtered by status, severity, or machine.

**Response `200 OK`:**
```json
[
  {
    "id": "ALR0042",
    "machine_id": "MCH001",
    "root_cause_machine_id": "MCH001",
    "severity": "Warning",
    "title": "Spindle Vibration Elevation",
    "reason": "Vibration reached 3.45 mm/s; pattern rule matched bearing wear signature.",
    "risk_score": 26.8,
    "status": "active",
    "created_at": "2026-11-17T05:30:15.000Z",
    "acknowledged_at": null,
    "acknowledged_by": null,
    "resolved_at": null,
    "resolved_by": null
  }
]
```

#### `POST /api/alerts/{id}/acknowledge`
Acknowledges an active alert. Requires `Operator` or `Supervisor` demo role.

**Headers:** `X-Demo-Role: Operator`

**Response `200 OK`:**
```json
{
  "id": "ALR0042",
  "status": "acknowledged",
  "acknowledged_at": "2026-11-17T05:33:00.000Z",
  "acknowledged_by": "Operator"
}
```

#### `POST /api/alerts/{id}/resolve`
Resolves an alert. Requires `Supervisor` demo role.

**Headers:** `X-Demo-Role: Supervisor`

**Response `200 OK`:**
```json
{
  "id": "ALR0042",
  "status": "resolved",
  "resolved_at": "2026-11-17T05:35:00.000Z",
  "resolved_by": "Supervisor"
}
```

#### `GET /api/alerts/{id}/events`
Retrieves the complete audit trail for a specific alert.

---

### 3.9 Resources & Recommendations Endpoints

#### `GET /api/resources/spare-parts`
Returns inventory levels, reorder alerts, and alternative parts.

#### `GET /api/resources/technicians`
Returns technicians, specializations, shift status, and certifications.

#### `GET /api/maintenance/tasks`
Lists proposed and approved maintenance tasks.

#### `GET /api/recommendations?machine_id=MCH001`
Generates intelligent work orders with parts, technician assignment, contingency plans, and `why` explanations.

**Response `200 OK`:**
```json
[
  {
    "id": "REC_TSK01",
    "machine_id": "MCH001",
    "component_id": "CMP001_SPINDLE_BEARING",
    "priority": "High",
    "problem_statement": "Early stage wear detected on high speed spindle bearing set.",
    "inspection_steps": [
      "Lock out spindle power supply.",
      "Inspect front bearing housing for axial play.",
      "Check lubrication grease contamination."
    ],
    "assigned_part": {
      "id": "SP001_BEARING_SET",
      "name": "SKF 7205 Precision Bearing Set",
      "quantity_on_hand": 3,
      "in_stock": true,
      "alternative_available": false
    },
    "assigned_technician": {
      "id": "TCH001",
      "name": "Meera Iyer",
      "specialisation": "Mechanical",
      "qualification_level": 3,
      "available": true
    },
    "estimated_downtime_minutes": 45,
    "contingency_plan": null,
    "why": [
      {
        "factor": "Diagnostic Signature",
        "justification": "Vibration elevated to 3.45 mm/s with matching acoustic signature."
      },
      {
        "factor": "Production Impact",
        "justification": "Failure will starve downstream conveyor MCH002, cutting line output by 26 UPH."
      },
      {
        "factor": "Technician Allocation",
        "justification": "Meera Iyer holds Level 3 certification for MCH001 and is currently on morning shift."
      }
    ]
  }
]
```

#### `POST /api/recommendations/{id}/approve`
Approves recommendation into an active maintenance task. Requires `Supervisor` role.

---

### 3.10 Simulation Endpoints

#### `GET /api/simulation/scenarios`
Lists available failure scenarios, target machines, and sensor signatures.

#### `GET /api/simulation/state`
Returns active scenario, elapsed time, and speed multiplier.

#### `POST /api/simulation/scenarios/{scenario}/start`
Starts a failure scenario with optional parameters.

**Request Body:**
```json
{
  "machine_id": "MCH001",
  "duration_seconds": 60,
  "speed": 1.0
}
```

#### `POST /api/simulation/events`
Injects a single instantaneous abnormal sensor spike on a selected machine.

**Request Body:**
```json
{
  "machine_id": "MCH001",
  "sensor": "vibration_mm_s",
  "magnitude": 4.8
}
```

#### `POST /api/simulation/reset`
Restores all machines to normal baselines, terminates active scenarios, and resolves simulation-driven alerts.

---

### 3.11 Ingest Endpoint (IoT-Ready)

#### `POST /api/ingest/readings`
Ingests an external sensor telemetry frame through the identical evaluation pipeline.

**Request Body:**
```json
{
  "machine_id": "MCH001",
  "ts": "2026-11-17T05:32:00.000Z",
  "readings": {
    "temperature_c": 64.2,
    "vibration_mm_s": 3.45,
    "current_a": 18.2,
    "pressure_bar": 5.92,
    "infrared_c": 68.7,
    "micro_movement_um": 14.3,
    "alignment_dev_mm": 0.04,
    "acoustic_db": 74.8
  }
}
```

**Response `201 Created`:**
```json
{
  "status": "ingested",
  "machine_id": "MCH001",
  "health_score": 78.4,
  "severity": "Warning"
}
```

---

## 4. WebSocket Protocol (`/ws/live`)

### 4.1 Connection Handshake & Envelope Schema

Clients connect via `ws://<host>:<port>/ws/live`. Every message follows a standard envelope:

```json
{
  "type": "string",
  "seq": 1042,
  "ts": "2026-11-17T05:32:00.000Z",
  "machine_id": "MCH001",
  "payload": {}
}
```

### 4.2 Message Types

1. **`snapshot`:** Dispatched immediately upon client connection. Contains full factory state, all machines, active alerts, and current simulation status.
2. **`sensor.update`:** Broadcast every 1s tick per machine. Payload contains latest sensor readings.
3. **`analysis.update`:** Dispatched when a machine's health or risk score shifts. Payload includes scores, severity, and reasons.
4. **`alert.created` / `alert.updated`:** Dispatched whenever an alert is created, escalated, acknowledged, or resolved.
5. **`factory.summary`:** Broadcast periodically with factory-wide UPH and aggregate health.
6. **`simulation.state`:** Broadcast when a scenario starts, completes, or is reset.
