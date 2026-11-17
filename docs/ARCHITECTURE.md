# Beyond the Factory Floor: Architecture & System Design

## 1. System Overview

**Beyond the Factory Floor** is a cyber physical digital twin and intelligent decision support system for industrial manufacturing lines. It pairs a dynamic 3D factory visualization with continuous multivariate telemetry ingestion, deterministic and statistical anomaly detection, dependency-based production impact modeling, and automated resource-aware maintenance recommendations.

### 1.1 Non-Negotiable Architectural Principles

1. **Strict Modularity:** Frontend, backend, database persistence, and simulation are decoupled into independent layers.
   - The simulation engine never imports API route handlers or HTTP contexts.
   - Analysis services process telemetry snapshots without knowing whether the source is the simulator or a physical gateway.
2. **Stable Unique Machine Identifiers:** Machines possess permanent IDs (`MCH001`, `MCH002`, `MCH003`). Every database table, API endpoint, WebSocket packet, and frontend URL parameter refers to machines strictly by ID.
3. **Deep Linkable Machine State:** The selected machine is stored in the URL query parameters (`?machine=MCH001`), synchronizing the 3D twin, telemetry charts, intelligence breakdowns, and maintenance records across page navigation.
4. **WebSocket-First Live Streaming:** Real-time sensor telemetry, analysis updates, and alert events stream over a single persistent WebSocket (`/ws/live`). REST polling is used only as a fallback.
5. **Single Server-Side Source of Truth:** The frontend contains zero hardcoded machine data, geometry coordinates, thresholds, or intelligence scoring rules. The 3D scene layout is dynamically loaded from `GET /api/factory/layout`.
6. **IoT-Ready Ingestion Pipeline:** The simulator implements an abstract `ReadingSource` interface. Ingesting readings via the internal loop and external HTTP ingest (`POST /api/ingest/readings`) executes the exact same validation, persistence, and intelligence pipeline.
7. **Zero Paid APIs & Zero External CDNs:** No proprietary AI APIs, no external CDN assets, and no external HDR skyboxes. All algorithms (Isolation Forest, NetworkX graphs, pattern rules) execute locally on the backend.

---

## 2. End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Simulation Engine                        │
│   - AR(1) Gaussian noise (seeded NumPy generator)           │
│   - Thermal cycles, diurnal curves & load shifts            │
│   - Smooth scenario ramps & speed multipliers               │
│   - Implements ReadingSource interface                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                Unified Ingestion Pipeline                   │
│   ingest_reading(machine_id, reading)                       │
│   ◄── Dual entry: Simulation loop OR POST /api/ingest       │
└──────┬───────────────────────┬──────────────────────────────┘
       │                       │
       ▼                       ▼
┌────────────────────┐  ┌─────────────────────────────────────┐
│ PostgreSQL Storage │  │         Intelligence Services        │
│                    │  │                                     │
│ - sensor_readings  │  │ 1. Threshold Evaluator (continuous) │
│   (120m retention) │  │ 2. Isolation Forest (multivariate)  │
│ - snapshots        │  │ 3. Pattern Rules (rule match count) │
│ - alerts & tasks   │  │ 4. Lifecycle Evaluator (RUL & deg)  │
└────────────────────┘  │ 5. Dependency Engine (NetworkX)     │
                        │ 6. Alert Engine (hysteresis/dedupe) │
                        │ 7. Maintenance Recommender          │
                        └──────────────────┬──────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   WebSocket Hub (/ws/live)                  │
│   - Single connection per client                            │
│   - Sequence numbered envelopes                             │
│   - Types: snapshot, sensor.update, analysis.update, etc.   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend Layer                     │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Providers: LiveData, SelectedMachine, DemoRole      │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│       ┌──────────────────────┼──────────────────────┐       │
│       ▼                      ▼                      ▼       │
│  3D Digital Twin        Small-Multiples        Operational  │
│  (R3F + Drei)           Telemetry Charts       Alerts &     │
│  - Emissive lights      (Recharts flat line)   Recommendations│
│  - Floor rings          - Dashed thresholds    - Web Audio  │
│  - Dependency lines     - Live numeric badges    Alarm      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Backend Architecture

### 3.1 Framework & Concurrency Model
- **Runtime:** Python 3.11+
- **Framework:** FastAPI with Pydantic v2 schemas.
- **Server:** Uvicorn with a strict single worker model (`--workers 1`). This guarantees that only one in-process background simulation engine exists, eliminating cross-process state sync bugs.
- **Background Execution:** FastAPI `lifespan` context manager initializes database connections, trains baseline Isolation Forest models, registers WebSocket broadcast hooks, and spawns the simulation loop via `asyncio.create_task()`.

### 3.2 Ingestion & Decoupled Pipeline
- **ReadingSource Interface (`backend/app/services/ingestion/reading_source.py`):**
  Defines an asynchronous generator interface `async def get_next_readings() -> list[tuple[str, SensorReadingSchema]]`.
- **Pipeline Execution (`backend/app/services/ingestion/pipeline.py`):**
  A synchronized ingest worker executes the sequential evaluation pipeline:
  1. Validates incoming sensor payload against `SensorReadingSchema`.
  2. Persists reading to `sensor_readings` table (sync SQLAlchemy session).
  3. Purges readings older than `READING_RETENTION_MINUTES` (sliding retention window).
  4. Triggers `AnalysisService.evaluate(machine_id, reading)`:
     - Calculates continuous threshold penalties.
     - Runs Scikit-learn Isolation Forest evaluation.
     - Tests deterministic pattern rule conditions.
     - Computes Health Score (0-100) and Risk Score (0-100).
     - Generates itemized `reasons` list.
  5. Triggers `LifecycleService.evaluate(machine_id, reading)`.
  6. Triggers `DependencyService.evaluate_line()`.
  7. Triggers `AlertEngine.process(machine_id, analysis_result)`.
  8. Triggers `Recommender.evaluate(machine_id, alert)`.
  9. Broadcasts unified state envelope via `WebSocketHub`.

### 3.3 Intelligence Services
- **Threshold Evaluator:** Evaluates values continuously between normal, warning, high, and critical levels rather than binary steps.
- **Isolation Forest Service:** Standardizes 8 sensor features (`StandardScaler`), predicts multivariate outlier probability, and maps to a capped 0-15 point penalty.
- **Deterministic Pattern Rules:** Evaluates physical mechanical/electrical relationships. Emits clear condition match counts (e.g., "3 of 4 conditions satisfied"), explicitly disclaiming probabilistic guessing.
- **Lifecycle Engine:** Adjusts nominal calendar component life against accumulated sensor degradation indexes to flag Early Deterioration.
- **Dependency Service:** Evaluates a NetworkX `DiGraph` of machine couplings (`MCH001 → MCH002 → MCH003`). Downstream nodes are throttled by upstream bottleneck capacity, calculating exact line output loss in Units Per Hour (UPH).
- **Alert Engine:** Applies hysteresis (3 consecutive ticks to escalate, 10 consecutive ticks to downgrade) to eliminate alarm chatter. Deduplicates active alerts per failure mode.
- **Recommender Engine:** Synthesizes failure hypotheses with parts stock, part alternatives, technician qualifications, and shift availability to produce fully justified work orders.

---

## 4. Database Architecture & Persistence

- **Database Engine:** PostgreSQL (Supabase / Render compatible).
- **Driver & Session Model:** SQLAlchemy 2.0 with synchronous sessions using the modern `psycopg` (v3) binary driver.
- **Migrations:** Alembic manages schema versioning and initial migrations.
- **Retention Management:** Telemetry table `sensor_readings` is indexed on `(machine_id, ts DESC)`. A scheduled pruning job executes periodically to maintain a 120-minute operational window, conserving storage while preserving high-resolution trends.
- **Idempotent Seeding:** `seed.py` uses deterministic upserts keyed by primary keys (`machines.id`, `components.id`, `spare_parts.id`, etc.) ensuring zero duplicate insertions on repeated invocations.

---

## 5. Frontend Architecture

### 5.1 Technology Stack & Tooling
- **Core Library:** React 19 with Vite (JavaScript, JSX, strict `@/*` path aliasing via `jsconfig.json`).
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` enforcing strict design tokens from `SKILL.md`.
- **UI Primitives:** shadcn/ui components refactored to remove all default Inter fonts, lucide icons, and light mode classes.
- **Icons:** Phosphor icons (`@phosphor-icons/react`) exclusively.
- **Charts:** Recharts configured for small multiples, flat lines, dashed threshold markers, and `isAnimationActive={false}` for smooth real-time streaming.
- **3D Engine:** Three.js via React Three Fiber (R3F 9) and `@react-three/drei` (Drei 10).

### 5.2 State Management & Context Providers
No third party global state libraries (e.g. Redux, Zustand) are used. The application utilizes three focused React context providers:
1. **`LiveDataProvider`:**
   - Establishes and manages the single WebSocket connection to `/ws/live`.
   - Handles auto-reconnect with exponential backoff and jitter.
   - Maintains latest sensor frames, health scores, active alerts, and connection status (`connected`, `reconnecting`, `offline`).
2. **`SelectedMachineProvider`:**
   - Synchronizes the selected machine ID with the URL search param (`?machine=MCH001`).
   - Listens to popstate and provides programmatic selection across the 3D twin, sidebar, and sub-pages.
3. **`DemoRoleProvider`:**
   - Tracks current operational demo role (`Viewer`, `Operator`, `Supervisor`).
   - Injects the `X-Demo-Role` header into mutating API requests (acknowledging alerts, resolving incidents, approving tasks).

### 5.3 3D Factory Twin Implementation
- **Layout Driven:** The scene requests layout metadata from `GET /api/factory/layout` on mount.
- **Progressive Geometry:** Implements `ProceduralMachine` primitives (milling bed, conveyor rollers, packaging gantry) that render immediately, with fallback support for loading optimized GLB models via `useGLTF` and Suspense.
- **Visual Status Feedback:**
  - Status beacon meshes colored dynamically by machine health.
  - Drei `Html` annotations displaying machine ID, operational status, and health score.
  - Directed spline lines tracing material flow dependencies between machines.
  - Glowing floor ring markers projecting downstream starvation or blockage impacts.
- **Camera & Interaction:** Smooth OrbitControls with distance clamping, smooth look-at transitions on machine selection, and pointer cursor highlights.

---

## 6. Security, Demo Roles & Deployment Topology

### 6.1 Demo Role Security Model
To maintain zero friction while demonstrating industrial access control, permissions are enforced via an application-level demo role header:
- `Viewer`: Read-only telemetry, intelligence, and dependency visibility.
- `Operator`: Permitted to acknowledge active warnings and emergency alerts.
- `Supervisor`: Permitted to acknowledge alerts, resolve cleared incidents, and approve maintenance work orders.

### 6.2 Deployment Topology
- **Frontend:** Hosted on Vercel as a Single Page Application (SPA) with rewrite rules in `vercel.json` routing all paths to `index.html`.
- **Backend:** Hosted on Render as a single web service running `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1`.
- **Database:** Hosted on Supabase Managed PostgreSQL or Render PostgreSQL using SSL connections (`sslmode=require`).
- **Cold Start Handling:** The frontend displays an informative banner when backend wake-up latency is detected on free tier instances.
