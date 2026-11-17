# Beyond the Factory Floor: Workspace Rules (Sections 1 - 6)

## 1. Role and operating mode

You are a senior full stack engineer building **Beyond the Factory Floor**, an industrial monitoring, predictive maintenance and decision support prototype with a 3D digital twin.

- Work in **Planning mode**. Before writing code for any stage, post an implementation plan and a task list, then proceed.
- Build **one stage at a time** (Section 7). Do not start the next stage until the current stage passes its checks.
- Never break earlier stages. Do not rename or restructure working code unless the stage requires it. If an API or database contract changes, update `docs/API.md` or `docs/DATA_MODEL.md` and every consumer in the same change.
- If something is unclear, state your assumption in one line and continue. Ask a question only when you are truly blocked.
- Use the browser tool, when available, to verify every UI stage at **1440px and 390px** wide. Attach screenshots to the walkthrough.
- Commit at the end of each stage with a clear message. Never commit secrets.

## 2. Source documents and precedence

| File | Purpose |
|---|---|
| `docs/MASTER_PROMPT.md` | Product requirements: Modules 1 to 7, What if simulation, dashboard sections, expected workflow. Its technology section is **superseded by Section 3**. |
| `SKILL.md` (landing page design skill) | The UI design system. Read it before any UI work, and again before each UI stage. |

**Precedence:** explicit instructions in this prompt > `SKILL.md` > defaults of shadcn/ui, Recharts, Sonner, Drei and Tailwind. Where the master prompt says SQLite, this prompt says PostgreSQL.

## 3. Fixed technology stack

**Frontend:** React.js with Vite, JavaScript (no TypeScript), Tailwind CSS (v4 via `@tailwindcss/vite`), shadcn/ui, Three.js with React Three Fiber and Drei, Recharts, React Router, Sonner. Pin compatible majors (React 19, R3F 9, Drei 10) and verify peer dependencies before installing.

**3D assets:** Blender, exported as GLB/GLTF.

**Backend:** Python 3.11+, FastAPI, Pydantic v2, REST, WebSockets (`uvicorn[standard]`).

**Database:** PostgreSQL, SQLAlchemy 2.x ORM (sync sessions, `psycopg` v3 driver), Alembic.

**Data and intelligence:** NumPy, Pandas, Scikit-learn (Isolation Forest), NetworkX, SciPy only where it is genuinely needed.

**Tooling and deployment:** VS Code, Git/GitHub, Postman, DBeaver. Vercel (frontend), Render (backend), Supabase PostgreSQL or another compatible host.

**Allowed small additions:** `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, a Phosphor icon package, shadcn dependencies (Radix, `class-variance-authority`, `clsx`, `tailwind-merge`), `pydantic-settings`, `pytest`, `httpx`, `joblib`.

**Not allowed without written justification in the plan:** state libraries, data fetching libraries, graph visualisation libraries, UI kits, paid APIs, LLM calls, postprocessing for 3D, external CDNs or HDR files.

shadcn setup notes for JavaScript:
- Add a `jsconfig.json` with the `@/*` path alias and set `"tsx": false` in `components.json`.
- The generated Sonner component imports `next-themes`. Replace that with a fixed dark theme, since this app is not Next.js.
- shadcn defaults to Inter, lucide icons, oklch colours and its own radii. All of these are overridden by Section 5.

## 4. Architecture

### 4.1 Non negotiable rules

1. **Modular.** Frontend, backend, database and simulation are separate. The simulation never imports API routes. The analysis never imports the simulation.
2. **Unique machine IDs.** Every machine has a stable string ID (`MCH001`, `MCH002`, `MCH003`). Every table, API route, WebSocket message and URL refers to machines by this ID.
3. **Selecting a machine in 3D retrieves its data from the backend.** Click sets the selected machine ID, which is stored in the URL (`?machine=MCH001`) and shared by every page.
4. **Live data over WebSockets.** The frontend receives sensor updates, analysis updates and alert events from `/ws/live`. Polling is only a fallback.
5. **One source of truth.** Scores, alerts, dependency impact, lifecycle flags and recommendations are all computed server side from the same stored machine data. The frontend contains **no hardcoded machine data**, including 3D layout, which comes from `GET /api/factory/layout`.
6. **Simulated inputs only.** No hardware. The UI shows a persistent "Simulated data" badge.
7. **IoT ready.** The simulator implements a `ReadingSource` interface and feeds the same `ingest_reading()` function that `POST /api/ingest/readings` uses. A future MQTT or HTTP gateway replaces the simulator without touching analysis code.
8. **No unnecessary technology, no paid APIs.**
9. **End to end integration beats decoration.** Every visual element must be functional.

### 4.2 Data flow

```
SimulationEngine (scenarios, noise, seeded NumPy RNG)      implements ReadingSource
        │
        ▼
ingest_reading(machine_id, reading)  ◄── POST /api/ingest/readings (future IoT bridge)
        │
        ├─► sensor_readings            (PostgreSQL, retention limited)
        ├─► AnalysisService            thresholds + Isolation Forest + pattern rules → health, risk, reasons
        ├─► LifecycleService           component remaining life + sensor deterioration
        ├─► DependencyService          NetworkX impact, root cause, production loss
        ├─► AlertEngine                severity, dedupe, escalate in place
        └─► Recommender                parts, technician, priority, "why"
        │
        ▼
WebSocket hub  ──►  React providers  ──►  3D scene · charts · tables · Sonner toasts · alarm
```

The simulation runs as a single in process background task. Run **one** Uvicorn worker so only one engine exists.

### 4.3 Repository layout

```
beyond-the-factory-floor/
├── README.md
├── docs/            ARCHITECTURE.md  DATA_MODEL.md  API.md  SIMULATION_AND_SCORING.md  DESIGN_RULES.md  postman/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/            config.py  db.py  security_demo.py
│   │   ├── models/          SQLAlchemy models
│   │   ├── schemas/         Pydantic models
│   │   ├── api/routes/      factory  machines  sensors  analysis  maintenance  resources  alerts  dependencies  simulation  ingest
│   │   ├── ws/              hub.py  routes.py
│   │   ├── services/
│   │   │   ├── ingestion/   reading_source.py  pipeline.py
│   │   │   ├── simulation/  profiles.py  generator.py  scenarios.py  engine.py
│   │   │   ├── analysis/    thresholds.py  isolation_forest.py  patterns.py  scoring.py  explain.py
│   │   │   ├── lifecycle/   lifecycle.py
│   │   │   ├── dependency/  graph.py  impact.py
│   │   │   ├── alerts/      engine.py
│   │   │   └── resources/   recommender.py
│   │   └── seed/            seed.py  data/*.json
│   ├── alembic/  alembic.ini
│   ├── tests/
│   ├── scripts/             e2e_smoke.py
│   ├── requirements.txt  .env.example
├── frontend/
│   ├── public/models/       milling_centre.glb  conveyor.glb  packaging.glb  (optional until Stage 3 swap)
│   ├── src/
│   │   ├── main.jsx  App.jsx  routes.jsx
│   │   ├── styles/index.css          tokens, fonts, named text styles
│   │   ├── lib/                      api.js  ws.js  format.js  severity.js  alarm.js
│   │   ├── providers/                LiveDataProvider  SelectedMachineProvider  DemoRoleProvider
│   │   ├── hooks/
│   │   ├── components/ui/            shadcn, edited to spec
│   │   ├── components/layout/        AppShell  Sidebar  TopBar  MobileMenu  ConnectionBanner
│   │   ├── components/shared/        StatusBadge  SeverityBadge  MetricCard  ScoreRing  ReasonList  EmptyState  Skeletons
│   │   ├── features/                 factory3d  sensors  intelligence  dependencies  maintenance  resources  alerts  simulation  overview
│   │   └── pages/                    404 and landing included
│   ├── components.json  jsconfig.json  vercel.json
└── .gitignore
```

### 4.4 Data model (PostgreSQL via SQLAlchemy, migrated with Alembic)

| Table | Key columns |
|---|---|
| `machines` | `id` (PK, string), name, type, role_in_line, nominal_throughput_uph, criticality_weight, model_url, pos_x, pos_y, pos_z, rot_y |
| `machine_dependencies` | upstream_id, downstream_id, propagation_factor, description |
| `machine_thresholds` | machine_id, sensor, unit, normal_low, normal_high, warning, high, critical, weight |
| `sensor_readings` | id, machine_id, ts, temperature_c, vibration_mm_s, current_a, pressure_bar, infrared_c, micro_movement_um, alignment_dev_mm, acoustic_db, scenario_tag |
| `analysis_snapshots` | id, machine_id, ts, health_score, risk_score, severity, reasons (JSON), anomalies (JSON), hypotheses (JSON) |
| `components` | id, machine_id, name, installed_on, service_life_days, scheduled_replacement_on, inspection_interval_days, last_inspected_on, condition, linked_sensor |
| `maintenance_records` | id, machine_id, component_id, performed_on, type, summary, technician_id |
| `spare_parts` | id, name, quantity, reorder_level, lead_time_days, alternative_part_id |
| `part_compatibility` | part_id, machine_id, component_id |
| `technicians` | id, name, specialisation, availability, shift, current_task_id |
| `technician_qualifications` | technician_id, machine_id or machine_type, level |
| `alerts` | id, machine_id, root_cause_machine_id, severity, title, reason, risk_score, status, created_at, acknowledged_at, acknowledged_by, resolved_at, resolved_by |
| `alert_events` | id, alert_id, ts, event, from_severity, to_severity |
| `maintenance_tasks` | id, machine_id, component_id, alert_id, priority, part_id, technician_id, status, rationale (JSON), created_at |
| `simulation_runs` | id, machine_id, scenario, started_at, ended_at, speed |

Seed data: 3 machines in a line, `MCH001` precision milling centre → `MCH002` transfer conveyor → `MCH003` carton packaging machine. Give each at least 4 components, a thresholds set per sensor, 3 to 5 past maintenance records, at least 10 spare parts and 5 technicians. Seed deliberately includes: one part out of stock, one part below reorder level, one technician unavailable, and one machine with only one qualified technician, so the "alternative" paths in the recommender can be demonstrated. Seed must be **idempotent**.

### 4.5 Sensor simulation

- Sensors: temperature (°C), vibration (mm/s), electrical current (A), pressure (bar), infrared hotspot (°C), mechanical micro movement (µm), alignment deviation (mm), acoustic (dB, optional).
- Normal behaviour: per machine baseline plus slow cycles, load changes and AR(1) noise from a seeded NumPy generator, so runs are reproducible.
- Tick every 1 second, all machines. Retain only a configurable window (`READING_RETENTION_MINUTES`, default 120) to stay inside free database tiers.
- Failure scenarios ramp smoothly (configurable duration and a demo speed multiplier):

| Scenario | Machines | Sensor signature | Linked component |
|---|---|---|---|
| Motor overheating | all | temperature and infrared rise, current rises mildly | drive or spindle motor |
| Bearing deterioration | MCH001, MCH002 | vibration and acoustic rise, temperature rises mildly, micro movement rises | bearing set |
| Conveyor belt damage | MCH002 | current fluctuates and rises, micro movement and vibration rise | belt |
| Electrical overload | all | current spikes, temperature rises, infrared hotspot | motor or drive |
| Mechanical misalignment | MCH001, MCH002 | alignment deviation and vibration rise, temperature rises mildly | coupling |

- Users can also trigger a single abnormal sensor event (one sensor spike) on a selected machine.
- `POST /api/simulation/reset` returns every machine to normal and resolves simulation driven alerts.

### 4.6 Intelligence (explainable, no fake AI)

**Threshold detection.** Compare each reading with that machine's thresholds. Grade each sensor continuously between warning and critical (not just a step), so scores move smoothly.

**Isolation Forest.** Train one model per machine at startup on generated normal data, standardised with Scikit-learn. It produces a normalised "pattern deviation" value. It is a *supporting* signal with a capped contribution, shown as its own line in the score breakdown and labelled "Statistical pattern check (Isolation Forest)". It never creates an alert on its own.

**Pattern rules** (failure explanations). Each rule lists its conditions, and the output states "matched 3 of 4 conditions". This is a rule match count, **not a probability**. Examples:
- Vibration high + acoustic high + temperature rising → possible bearing wear.
- Temperature high + infrared high + current high → possible motor overheating or overload.
- Alignment deviation high + vibration high → possible misalignment.
- Current fluctuating + micro movement high → possible belt tracking or slip.

**Scores.**
- *Health (0 to 100)* = 100 minus weighted sensor penalties, minus pattern penalty, minus capped Isolation Forest penalty, minus capped lifecycle penalty.
- *Risk (0 to 100, higher is worse)* combines the health deficit, rate of change, downstream exposure from the dependency graph, and lifecycle urgency.
- Every score stores a `reasons` list of `{factor, observed, limit, points, note}`. The UI shows it.
- Weights and thresholds live in one config module, are documented in `docs/SIMULATION_AND_SCORING.md`, and are unit tested.

**Severity** (from risk and safety conditions): Normal, Warning, High, Critical, Emergency. Use hysteresis (for example 3 consecutive ticks to raise, 10 to lower) so status does not flicker. Emergency requires a critical risk plus a safety relevant condition (for example critical temperature and critical current together).

**Lifecycle.** Remaining useful life = calendar life remaining adjusted by condition and by a sensor deterioration index. Flag a component when: replacement is due within 30 days, inspection is overdue, more than 85% of service life is used, **or** its linked sensor shows deterioration while the calendar says it is healthy (labelled "early deterioration").

**Dependency and production impact.** NetworkX `DiGraph` built from `machine_dependencies`. Effective output of a node = `min(own capacity × health derate, sum of upstream effective output × propagation factor)`. Production loss is the drop at the end of the line compared with baseline. Root cause = the anomalous machine with no anomalous upstream machine that explains it, ties broken by risk. Output: affected machines, chain, estimated units per hour lost, and which problem to address first. Assumptions are stored in config and displayed in the UI.

**Alerts.** One active alert per machine per hypothesis. Escalate in place and record each change in `alert_events`. Alerts are acknowledged and resolved through the API. For the demo, a role switcher (Viewer, Operator, Supervisor) is sent as a header and enforced by the API. Operators acknowledge, supervisors also resolve and approve tasks. Label this clearly as demo roles, not authentication.

**Recommender.** For each active issue: likely problem → inspection and repair steps → components likely needing replacement → part compatibility and stock → qualified and available technician → priority (risk × downstream impact) → recommendation. If a part or technician is missing, return alternatives: substitute part, cross qualified technician, procurement with lead time, or a production contingency such as reduced line speed. Every recommendation carries a `why` list with its inputs.

### 4.7 API plan

REST under `/api`:

| Area | Endpoints |
|---|---|
| Health | `GET /health` |
| Factory | `GET /factory/summary`, `GET /factory/layout` |
| Machines | `GET /machines`, `GET /machines/{id}` |
| Sensors | `GET /machines/{id}/sensors/latest`, `GET /machines/{id}/sensors/history?minutes=&sensors=`, `GET /machines/{id}/thresholds` |
| Analysis | `GET /machines/{id}/analysis`, `GET /machines/{id}/analysis/history` |
| Maintenance | `GET /machines/{id}/components`, `GET /machines/{id}/maintenance/history`, `GET /maintenance/overview` |
| Dependencies | `GET /dependencies/graph`, `GET /dependencies/impact` |
| Alerts | `GET /alerts?status=&severity=&machine_id=`, `POST /alerts/{id}/acknowledge`, `POST /alerts/{id}/resolve`, `GET /alerts/{id}/events` |
| Resources | `GET /resources/spare-parts`, `GET /resources/technicians`, `GET /maintenance/tasks`, `GET /recommendations?machine_id=`, `POST /recommendations/{id}/approve` |
| Simulation | `GET /simulation/scenarios`, `GET /simulation/state`, `POST /simulation/scenarios/{scenario}/start`, `POST /simulation/events`, `POST /simulation/reset` |
| Ingest | `POST /ingest/readings` (IoT ready, same pipeline as the simulator) |

**WebSocket** `/ws/live`. Envelope: `{ type, seq, ts, machine_id?, payload }`. Types: `snapshot` (sent on connect), `sensor.update`, `analysis.update`, `alert.created`, `alert.updated`, `factory.summary`, `simulation.state`. The client reconnects with backoff and shows an inline banner while disconnected.

### 4.8 Frontend routes and behaviour

React Router: `/` (landing, optional, Stage 11), `/app/overview`, `/app/factory`, `/app/sensors`, `/app/intelligence`, `/app/dependencies`, `/app/maintenance`, `/app/resources`, `/app/alerts`, `/app/simulation`, and a branded 404.

Three providers sit at the app root: `LiveDataProvider` (one WebSocket, latest state), `SelectedMachineProvider` (synced with `?machine=`), `DemoRoleProvider`. Selecting a machine on any page, including by clicking in 3D, updates every page.

### 4.9 3D factory plan

- Procedural machine primitives swapped to GLB through `machines.model_url`.
- Layout from `/api/factory/layout`. Click sets URL and retrieves backend data.
- Emissive status indicators, Drei `Html` labels, downstream floor ring markers, dependency arrowed lines.
- OrbitControls with damping, focus selected, reset view. Clamped DPR `[1, 2]`. Flat background, no HDR/CDN.

---

## 5. UI design system (from `SKILL.md`)

- Typography: Geist & Geist Mono only. No italics (`em, i { font-style: normal }`). Semibold/bold max. Tailwind type scale only. Named text styles defined once in `styles/index.css`. `text-wrap: balance` for headings, `text-wrap: pretty` for body. No hyphens in user facing copy. Sentence case.
- Spacing: 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96px. Main buttons `py-2 px-3`.
- Radius & Backgrounds: Tailwind radii only. Nested formula `inner = outer - gap`. Full borders or none. No background gradients. Dark palette: `#000000`, `#181818`, `#1F1F1F`, `#272727`, `#313131`, `#131209`. Text `#FFFFFF`, secondary `#9B9B9B`. Status colors (green, yellow, orange, red) flat, paired with icon and label.
- Icons: Phosphor, Solar, or Iconamoon only.
- Motion: `cubic-bezier(0.22, 1, 0.36, 1)`, `duration-500` (layout/pos), `duration-300` (hover/opacity). Animate only `transform` and `opacity`. Support `prefers-reduced-motion`. `isAnimationActive={false}` on streaming Recharts.
- Navigation: Left sidebar for 9 sections, sticky top bar with selected machine, factory health, connection state, "Simulated data" badge, alarm toggle, demo role switcher. Mobile full-height sheet.
- States & Content: Full interactive states (hover, active scale-0.98, focus ring, skeleton loaders, composed empty states, inline errors). Sonner toasts for High and Emergency. Web Audio API procedural tone alarm for Emergency. Real, calm copy.

---

## 6. Engineering quality gates (every stage)

- Backend: `pytest` passes, `alembic upgrade head` works on an empty DB, seed idempotent (runs twice cleanly), Ruff/flake8 clean.
- Frontend: `npm run build` and `npm run lint` pass, no console errors, no hardcoded machine data.
- Integration: `backend/scripts/e2e_smoke.py` extended every stage to verify the full loop.
- UI: Verified at 1440px and 390px against Section 5.
- Documentation: `API.md`, `DATA_MODEL.md`, `SIMULATION_AND_SCORING.md` kept strictly updated.
