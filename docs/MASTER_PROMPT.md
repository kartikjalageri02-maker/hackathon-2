# Beyond the Factory Floor: Master Product Requirements

> **Precedence Note:** The technology choices specified in Section 3 of the Build Rules (PostgreSQL, sync SQLAlchemy 2.x sessions via `psycopg` v3, React 19, Tailwind CSS v4 via `@tailwindcss/vite`, R3F 9, Drei 10, JavaScript) supersede any legacy SQLite or other framework specifications in this document.

---

## 1. Product Vision & Overview

**Beyond the Factory Floor** is an intelligent industrial monitoring, predictive maintenance, and operational decision support system. It integrates a 3D digital twin of a connected production line with multivariate sensor telemetry, continuous anomaly detection, explainable failure diagnostics, dependency graph propagation, and resource-aware maintenance task recommendations.

The prototype models a discrete manufacturing line comprising three interdependent machines:
1. **MCH001: Precision Milling Centre** (Upstream, spindle & axis tooling)
2. **MCH002: Transfer Conveyor** (Midstream, material handling & transport)
3. **MCH003: Carton Packaging Machine** (Downstream, end of line boxing & sealing)

---

## 2. Core Functional Modules

### Module 1: Interactive 3D Digital Twin Factory Floor
- **Visual Representation:** Three dimensional representation of the 3-machine production line.
- **Dynamic Positioning:** Machine positions, dimensions, and visual orientations retrieved dynamically from backend (`GET /api/factory/layout`).
- **Status Indication:** Color coded status indicators on machines (Normal = Green, Warning = Yellow, High = Orange, Critical / Emergency = Red).
- **Interactive Selection:** Clicking any machine updates the global selected machine state (`?machine=MCH001`), synchronizing all analytics tabs and side panels.
- **Dependency Flow & Impact Visualization:** Visible directional connectors between machines showing material flow. Downstream machines impacted by upstream failures display prominent floor ring indicators.
- **Camera Controls:** Smooth OrbitControls with distance and polar limits, "Focus selected machine" easing, and "Reset camera view".
- **Fallback Architecture:** Procedural 3D primitive geometry by default, with seamless GLB model loading via React Three Fiber / Drei `useGLTF`.

### Module 2: Simulation, Ingestion & Sensor Analytics
- **8 Sensor Channels:**
  1. Spindle / Motor Temperature (°C)
  2. Vibration RMS (mm/s)
  3. Electrical Current Draw (A)
  4. Hydraulic / Pneumatic Pressure (bar)
  5. Infrared Hotspot Temperature (°C)
  6. Mechanical Micro-movement (µm)
  7. Shaft Alignment Deviation (mm)
  8. Acoustic Emission (dB)
- **Telemetry Generation:** In-process deterministic simulation engine (`ReadingSource` interface) producing realistic baselines, thermal cycles, load variations, and AR(1) Gaussian noise at 1 second intervals.
- **IoT-Ready Ingestion Pipeline:** Decoupled `ingest_reading()` pipeline that processes simulated data and external inputs identically via `POST /api/ingest/readings`.
- **Live Streaming & Persistence:** Live updates streamed over WebSockets (`/ws/live`). Telemetry persisted to PostgreSQL with configurable sliding window retention (default 120 minutes).
- **Interactive Telemetry UI:** Multi-sensor small-multiples telemetry charts with normal, warning, and critical thresholds, live numeric badges, and manual single-sensor anomaly injection triggers.

### Module 3: Anomaly Detection & Machine Intelligence
- **Explainable Diagnostics (No black-box or hallucinated AI):**
  1. *Continuous Threshold Grading:* Smooth penalty scoring between normal, warning, high, and critical levels.
  2. *Multivariate Statistical Pattern Check (Isolation Forest):* Pre-trained Scikit-learn model per machine to detect multivariate drift. Capped penalty contribution; never alerts on its own.
  3. *Deterministic Pattern Rules:* Rule engine matching physical failure signatures (e.g., "Vibration high + Acoustic high + Temperature rising → Bearing deterioration"). Output displays exact rule condition match count (e.g. "matched 3 of 4 conditions").
- **Composite Scoring:**
  - **Health Score (0 to 100):** 100 minus sensor penalties, pattern rule penalties, Isolation Forest penalty, and lifecycle penalties.
  - **Risk Score (0 to 100):** Aggregates health deficit, rate of change (ROC), downstream bottleneck exposure, and component urgency.
  - **Explainability Breakdown:** Every score is accompanied by an itemized `reasons` list detailing exact factor, observed value, threshold limit, penalty points deducted, and diagnostic note.

### Module 4: Lifecycle & Predictive Maintenance
- **Component Tracking:** At least 4 critical components per machine (e.g., Spindle Motor, Bearings, Drive Belt, Coupling, Tool Holder).
- **Remaining Useful Life (RUL):** Calculated dynamically using installed date, rated service life days, calendar age, inspection history, and operational stress factor.
- **Sensor Deterioration Index:** Cross-references component health with linked sensor anomalies.
- **Early Deterioration Alert:** Flags components whose calendar age suggests healthy status, but whose linked sensor readings reveal accelerated degradation.
- **Maintenance Records:** Historical log of inspections, overhauls, and replacements.

### Module 5: Dependency Graph & Production Impact
- **NetworkX Directed Graph:** Represents physical production line dependencies (`MCH001 → MCH002 → MCH003`) with propagation factors.
- **Throughput & Capacity Derating:** Evaluates effective throughput based on machine health derating and upstream starved/blocked conditions.
- **Bottleneck & Loss Estimation:** Calculates factory output loss in Units Per Hour (UPH) and monetary loss rate.
- **Root Cause Isolation:** Traverses graph to isolate the origin machine of line degradation, preventing symptom confusion on downstream machines.
- **Fix-First Recommendation:** Highlights the exact machine whose repair will yield the highest recovery in overall factory throughput.

### Module 6: Alerts & Emergency Response Center
- **Severity Levels:** Normal, Warning, High, Critical, Emergency.
- **Hysteresis Damping:** State machine requiring 3 consecutive elevated ticks to upgrade severity and 10 consecutive normal ticks to downgrade, preventing UI flicker.
- **Emergency Escalation Criteria:** Critical risk combined with an active safety-critical condition (e.g., extreme thermal hotspot + electrical overload).
- **Incident Audit Trail:** In-place alert escalation logging all transitions in `alert_events`.
- **Demo Role Access Control:**
  - *Viewer:* Read only monitoring.
  - *Operator:* Can acknowledge active alerts.
  - *Supervisor:* Can acknowledge, resolve alerts, and approve maintenance work orders.
- **Audible Emergency Tone:** Procedural Web Audio API synthesizer tone (no external audio assets) triggered during unacknowledged Emergency conditions with user-consented audio toggle.

### Module 7: Resource Management & Smart Recommender
- **Spare Parts Inventory:** Catalog of compatible parts with quantities, reorder thresholds, lead times, and defined alternative/substitute parts.
- **Technician Workforce:** Staff roster with skill specializations (Mechanical, Electrical, Mechatronics), qualification levels (Levels 1 to 3), shift schedules, and live availability.
- **Autonomous Recommendation Engine:** Synthesizes active failure hypothesis, required replacement parts, and qualified available technicians to produce actionable work orders.
- **Contingency Handling:**
  - If a primary part is out of stock, automatically recommends verified alternative part or flags procurement lead time with operational line derate.
  - If a preferred technician is unavailable, identifies cross-qualified peers.
- **Transparent Justification:** Every recommendation includes an itemized `why` chain listing the diagnostic triggers, safety implications, and logistical trade-offs.

---

## 3. What-If Simulation Engine

The What-If Simulation engine enables operators and managers to test failure scenarios, assess cascading risks, and validate response workflows in safe, repeatable sandbox runs.

### 5 Pre-Configured Failure Scenarios
1. **Motor Overheating:** Thermal runaway on drive/spindle motors with infrared hotspot and moderate current increase.
2. **Bearing Deterioration:** High-frequency vibration and acoustic spike, micro-movement, accompanied by friction-induced temperature rise.
3. **Conveyor Belt Damage:** Mechanical slip, fluctuating motor current, vibration, and mechanical micro-movement.
4. **Electrical Overload:** Sudden current spike, thermal accumulation, and severe power imbalance.
5. **Mechanical Misalignment:** Progressive shaft alignment deviation, vibration harmonics, and coupling stress.

### Simulation Controls
- Scenario selection and trigger per machine.
- Simulation speed multiplier (1x, 2x, 5x).
- Single abnormal event trigger (instantaneous anomaly injection on any sensor).
- System Reset (`POST /api/simulation/reset`): Instantly restores baseline readings, clears simulated faults, and resolves simulation-driven alerts.

---

## 4. Expected 10-Step Operational Workflow

The application is structured to demonstrate this continuous 10-step lifecycle:
1. **Baseline Normal Operation:** All three machines run within normal operating boundaries; health scores > 90, zero active alerts, line throughput at nominal 100%.
2. **Fault Injection:** User initiates a failure scenario (e.g., Bearing Deterioration on MCH001) or manual sensor anomaly.
3. **Sensor Telemetry Response:** Ingestion pipeline receives ramping sensor signals; vibration, acoustic, and micro-movement rise smoothly on charts.
4. **Intelligence Evaluation:** Threshold engine detects warning crossing; Isolation Forest flags multi-sensor drift; pattern rule engine registers match count.
5. **Score Derating & Reason Itemization:** Health score drops; Risk score rises; itemized reason penalty breakdown shows exact limits exceeded.
6. **Downstream Impact & Root Cause Analysis:** NetworkX dependency engine flags MCH002 and MCH003 as starving/impacted; calculates lost UPH; confirms MCH001 as root cause.
7. **Alert Creation & Emergency Handling:** Alert engine raises severity; UI triggers Sonner toast; 3D view shows root cause red beacon and downstream yellow rings; procedural Web Audio alarm sounds if Emergency.
8. **Resource Recommendation Generation:** Recommender identifies bearing set replacement, checks inventory (or suggests alternative), assigns qualified technician, and calculates estimated downtime.
9. **Role-Based Incident Mitigation:** Operator acknowledges alert (silencing alarm tone); Supervisor approves generated maintenance task.
10. **Factory Recovery:** User triggers Reset; simulator restores baselines; health scores recover to 100; alerts resolve; line throughput normalizes.
