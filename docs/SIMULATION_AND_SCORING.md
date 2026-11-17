# Beyond the Factory Floor: Simulation, Anomaly Detection & Scoring Specification

## 1. Sensor Telemetry Specifications & Baselines

Each machine in the production line emits 8 physical sensor channels sampled at 1 second intervals.

### 1.1 Sensor Channels & Baseline Operating Parameters

| Sensor Key | Physical Quantity | Unit | MCH001 Baseline (Milling) | MCH002 Baseline (Conveyor) | MCH003 Baseline (Packaging) | Sampling Noise $\sigma$ |
|---|---|---|---|---|---|---|
| `temperature_c` | Motor / Spindle Temperature | °C | $52.0 \pm 1.5$ | $38.0 \pm 1.0$ | $42.0 \pm 1.2$ | $0.25$ |
| `vibration_mm_s` | Vibration Velocity RMS | mm/s | $1.20 \pm 0.15$ | $0.80 \pm 0.10$ | $0.95 \pm 0.12$ | $0.05$ |
| `current_a` | Electrical Current Draw | A | $14.5 \pm 1.2$ | $6.2 \pm 0.4$ | $8.8 \pm 0.6$ | $0.15$ |
| `pressure_bar` | Pneumatic / Hydraulic Pressure| bar | $6.0 \pm 0.1$ | $4.5 \pm 0.1$ | $5.5 \pm 0.1$ | $0.04$ |
| `infrared_c` | Thermal Hotspot Temperature | °C | $56.0 \pm 1.8$ | $40.0 \pm 1.2$ | $44.0 \pm 1.4$ | $0.30$ |
| `micro_movement_um`| Structural Micro-displacement | µm | $4.5 \pm 0.8$ | $2.2 \pm 0.5$ | $3.1 \pm 0.6$ | $0.20$ |
| `alignment_dev_mm` | Shaft Alignment Deviation | mm | $0.020 \pm 0.005$ | $0.015 \pm 0.003$ | $0.018 \pm 0.004$ | $0.002$ |
| `acoustic_db` | Acoustic Noise Emission | dB | $68.0 \pm 1.5$ | $58.0 \pm 1.0$ | $62.0 \pm 1.2$ | $0.40$ |

### 1.2 Mathematical Formulation of Normal Simulation

The normal reading $X_t$ for sensor $s$ at tick $t$ is composed of four deterministic and stochastic components:

$$X_t = \mu_s + C_t + L_t + \epsilon_t$$

Where:
1. $\mu_s$: Configured baseline operating center.
2. $C_t$: Diurnal / thermal slow cycle:
   $$C_t = A_{\text{cycle}} \cdot \sin\left(\frac{2\pi t}{T_{\text{cycle}}}\right), \quad T_{\text{cycle}} = 600\text{ seconds (10 mins)}, \quad A_{\text{cycle}} = 0.05 \cdot \mu_s$$
3. $L_t$: Periodic workpiece load step:
   $$L_t = A_{\text{load}} \cdot \text{square}\left(\frac{2\pi t}{T_{\text{load}}}\right), \quad T_{\text{load}} = 45\text{ seconds}, \quad A_{\text{load}} = 0.08 \cdot \mu_s$$
4. $\epsilon_t$: First-order Autoregressive AR(1) Gaussian noise generated via a seeded NumPy generator:
   $$\epsilon_t = \phi \cdot \epsilon_{t-1} + \eta_t, \quad \phi = 0.72, \quad \eta_t \sim \mathcal{N}(0, \sigma_s^2 (1 - \phi^2))$$
   The seed is fixed per machine ID ensuring exact repeatability between demo runs.

---

## 2. Failure Scenarios & Injection Curves

Failure scenarios smoothly elevate target sensor channels from their baseline to critical levels over a configurable duration $D$ (default 60 seconds), scaled by speed multiplier $M \in \{1.0, 2.0, 5.0\}$.

$$\text{Effective Time Step } \Delta \tau = \frac{M}{D}$$

Progress normalized: $\lambda \in [0.0, 1.0]$.

### 2.1 Scenario Signatures & Curves

| Scenario | Target Machines | Sensor Signatures & Transfer Curves | Target Component |
|---|---|---|---|
| **1. Motor Overheating** | All | `temperature_c`: $\mu + 38 \cdot \lambda^{1.2}$<br>`infrared_c`: $\mu + 45 \cdot \lambda^{1.1}$<br>`current_a`: $\mu + 4.5 \cdot \lambda$ | Drive / Spindle Motor |
| **2. Bearing Deterioration**| MCH001, MCH002 | `vibration_mm_s`: $\mu + 4.2 \cdot \lambda^{1.4}$<br>`acoustic_db`: $\mu + 22 \cdot \lambda^{1.3}$<br>`micro_movement_um`: $\mu + 24 \cdot \lambda^{1.5}$<br>`temperature_c`: $\mu + 14 \cdot \lambda$ | Spindle / Roller Bearings |
| **3. Conveyor Belt Damage** | MCH002 | `current_a`: $\mu + 6.0 \cdot \lambda + 2.0 \sin(4\pi t)$ (fluctuation)<br>`micro_movement_um`: $\mu + 18 \cdot \lambda^{1.3}$<br>`vibration_mm_s`: $\mu + 2.8 \cdot \lambda$ | Drive Belt |
| **4. Electrical Overload** | All | `current_a`: $\mu + 18.0 \cdot \lambda^{0.8}$ (fast spike)<br>`infrared_c`: $\mu + 35 \cdot \lambda^{1.2}$<br>`temperature_c`: $\mu + 26 \cdot \lambda$ | Power / Inverter Module |
| **5. Mechanical Misalignment**| MCH001, MCH002 | `alignment_dev_mm`: $\mu + 0.18 \cdot \lambda^{1.2}$<br>`vibration_mm_s`: $\mu + 3.2 \cdot \lambda^{1.1}$<br>`temperature_c`: $\mu + 10 \cdot \lambda$ | Flexible Coupling |

### 2.2 Instantaneous Anomaly Injection (Spike Event)
Users can inject an abrupt shock to any single sensor channel:
$$X_{t_{\text{spike}}} = X_{t} + \Delta_{\text{magnitude}}$$
The spike decays exponentially over 15 seconds:
$$\Delta_t = \Delta_{\text{magnitude}} \cdot e^{-0.25 (t - t_{\text{spike}})}$$

---

## 3. Anomaly Detection & Machine Intelligence

### 3.1 Continuous Multi-Level Threshold Grading

Rather than binary alert triggers, each sensor reading $x$ is graded continuously between configured thresholds ($T_{\text{norm\_high}}, T_{\text{warn}}, T_{\text{high}}, T_{\text{crit}}$).

The normalized penalty $p_s(x) \in [0.0, 1.0]$ is computed as piecewise linear:

$$p_s(x) = \begin{cases}
0, & x \le T_{\text{warn}} \\
0.33 \cdot \frac{x - T_{\text{warn}}}{T_{\text{high}} - T_{\text{warn}}}, & T_{\text{warn}} < x \le T_{\text{high}} \\
0.33 + 0.34 \cdot \frac{x - T_{\text{high}}}{T_{\text{crit}} - T_{\text{high}}}, & T_{\text{high}} < x \le T_{\text{crit}} \\
0.67 + 0.33 \cdot \min\left(1.0, \frac{x - T_{\text{crit}}}{0.2 \cdot T_{\text{crit}}}\right), & x > T_{\text{crit}}
\end{cases}$$

Weighted sensor deduction:
$$\text{Penalty}_s = w_s \cdot p_s(x) \cdot 25.0$$
Where $w_s$ is the sensor criticality weight (e.g., 1.8 for vibration, 1.2 for temperature).

### 3.2 Multivariate Statistical Pattern Check (Isolation Forest)

At backend startup, a Scikit-learn `IsolationForest` model is fit for each machine on 2,000 synthetic normal baseline observations:
- **Features:** 8 normalized channels via `StandardScaler`.
- **Hyperparameters:** `n_estimators=100`, `contamination=0.03`, `random_state=42`.
- **Real-Time Evaluation:** For each incoming reading frame $\mathbf{x} \in \mathbb{R}^8$:
  $$\text{Raw Score } s_{\text{IF}} = -\text{score\_samples}(\text{scaler.transform}(\mathbf{x}))$$
  Normalized to anomaly index $I_{\text{IF}} \in [0.0, 1.0]$:
  $$I_{\text{IF}} = \text{clip}\left(\frac{s_{\text{IF}} - 0.40}{0.35}, 0.0, 1.0\right)$$
- **Contribution Capping:** The Isolation Forest deduction is strictly capped at a maximum of **15 points**:
  $$\text{Penalty}_{\text{IF}} = 15.0 \cdot I_{\text{IF}}$$
  It is labelled explicitly as: `"Statistical pattern check (Isolation Forest)"`. It **never** triggers an alert on its own.

### 3.3 Explainable Pattern Rules (Failure Hypotheses)

Physical failure modes are identified via deterministic pattern rules. Each rule requires multiple concurrent physical signatures:

| Rule Hypothesis | Required Conditions | Condition Thresholds | Point Penalty |
|---|---|---|---|
| **Bearing Wear** | 1. Vibration High<br>2. Acoustic High<br>3. Temperature Rising<br>4. Micro-movement High | $v > 3.2$ mm/s<br>$a > 74$ dB<br>$\Delta T / \Delta t > 0.15$ °C/s<br>$m > 12$ µm | 18.0 (if $\ge 3$ matched) |
| **Motor Overheating / Overload** | 1. Spindle Temp High<br>2. IR Hotspot High<br>3. Current Draw High | $T > 72$ °C<br>$IR > 78$ °C<br>$I > 20$ A | 20.0 (if $\ge 2$ matched) |
| **Mechanical Misalignment** | 1. Alignment Deviation High<br>2. Vibration High<br>3. Temperature Elevated | $\Delta_{\text{align}} > 0.08$ mm<br>$v > 3.0$ mm/s<br>$T > 62$ °C | 15.0 (if $\ge 2$ matched) |
| **Belt Tracking / Slip** | 1. Current Fluctuating<br>2. Micro-movement High<br>3. Vibration Elevated | $\text{Std}(I)_{10\text{s}} > 1.2$ A<br>$m > 10$ µm<br>$v > 2.2$ mm/s | 16.0 (if $\ge 2$ matched) |

Output format: **"matched $M$ of $N$ conditions"** (e.g. "matched 3 of 4 conditions"). This is an explicit rule match count, **not a probability**.

---

## 4. Health & Risk Composite Scoring

### 4.1 Health Score Formula (0 to 100)

$$\text{Health Score} = \max\left(0.0, 100.0 - \sum_{s=1}^8 \text{Penalty}_s - \text{Penalty}_{\text{pattern}} - \text{Penalty}_{\text{IF}} - \text{Penalty}_{\text{lifecycle}}\right)$$

### 4.2 Risk Score Formula (0 to 100)

Risk reflects impending operational disruption:

$$\text{Risk Score} = \min\left(100.0, \; 0.45 \cdot (100 - \text{Health}) + 0.25 \cdot \text{ROC} + 0.20 \cdot \text{DownstreamExposure} + 0.10 \cdot \text{LifecycleUrgency}\right)$$

Where:
- $\text{ROC} = \text{clip}\left(\frac{\text{Health}_{t-10} - \text{Health}_t}{10} \times 50, 0, 100\right)$: Rate of health degradation over the last 10 seconds.
- $\text{DownstreamExposure} = 100 \cdot \text{CriticalityWeight} \cdot \text{PropagationFactor}$.
- $\text{LifecycleUrgency} = 100 \cdot \left(1.0 - \frac{\text{RUL}_{\text{effective}}}{\text{ServiceLife}}\right)$.

### 4.3 Itemized `reasons` Schema
Every computed score persists and returns an itemized reasons breakdown:

```json
[
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
  }
]
```

---

## 5. Severity State Machine & Hysteresis

To prevent status flickering at threshold borders, state transitions employ asymmetric hysteresis:
- **Upgrade Transition:** Condition must persist for **3 consecutive ticks**.
- **Downgrade Transition:** Condition must clear for **10 consecutive ticks**.

```mermaid
stateDiagram-v2
    [*] --> Normal
    Normal --> Warning : Risk > 20 (3 ticks)
    Warning --> High : Risk > 50 (3 ticks)
    High --> Critical : Risk > 75 (3 ticks)
    Critical --> Emergency : Risk > 85 AND Safety Condition (3 ticks)

    Emergency --> Critical : Safety Condition cleared (10 ticks)
    Critical --> High : Risk <= 75 (10 ticks)
    High --> Warning : Risk <= 50 (10 ticks)
    Warning --> Normal : Risk <= 20 (10 ticks)
```

**Emergency Criteria:** Requires `Risk Score > 85` **AND** a concurrent safety-critical condition:
$$(T_{\text{temp}} > T_{\text{crit}} \land T_{\text{current}} > T_{\text{crit}}) \quad \lor \quad (T_{\text{infrared}} > T_{\text{crit}} \land T_{\text{vibration}} > T_{\text{crit}})$$

---

## 6. Lifecycle & Early Deterioration Detection

### 6.1 Remaining Useful Life (RUL) Calculation
Calendar remaining life:
$$L_{\text{cal}} = \text{ServiceLifeDays} - (\text{Today} - \text{InstalledDate})$$

Sensor stress factor $S_{\text{stress}} \ge 1.0$:
$$S_{\text{stress}} = 1.0 + 2.5 \cdot \text{Mean}_{\text{24h}}(p_{\text{linked\_sensor}})$$

Effective RUL in days:
$$\text{RUL}_{\text{eff}} = \max\left(0, \frac{L_{\text{cal}}}{S_{\text{stress}}}\right)$$

### 6.2 Early Deterioration Flag
A component triggers the **Early Deterioration** alert when:
$$L_{\text{cal}} > 60\text{ days (calendar says healthy)} \quad \text{AND} \quad \text{RUL}_{\text{eff}} < 0.60 \cdot L_{\text{cal}} \quad \text{AND} \quad p_{\text{linked\_sensor}} > 0.40$$
Displayed in UI with label: `"Early Deterioration"`.

---

## 7. Dependency Graph & Production Impact

Physical line dependency modeled as NetworkX `DiGraph`:
$\text{MCH001} \xrightarrow{p_{12} = 0.90} \text{MCH002} \xrightarrow{p_{23} = 0.95} \text{MCH003}$

### 7.1 Effective Throughput & Loss Equations
For each machine node $u$:
$$\text{Own Capacity}(u) = \text{NominalUPH}(u) \cdot \frac{\text{HealthScore}(u)}{100}$$

$$\text{Effective Throughput}(u) = \begin{cases}
\text{Own Capacity}(u), & u \text{ is source (MCH001)} \\
\min\left(\text{Own Capacity}(u), \; \sum_{v \in \text{Pred}(u)} \text{Effective Throughput}(v) \cdot p_{vu}\right), & u \text{ has upstream}
\end{cases}$$

Production loss is measured at the end of the line (MCH003):
$$\text{Line Loss (UPH)} = \text{NominalUPH}(\text{MCH003}) - \text{Effective Throughput}(\text{MCH003})$$

### 7.2 Root Cause Isolation Algorithm
1. Identify all machines with `Risk Score > 20`.
2. For each anomalous machine $u$, examine upstream predecessors $\text{Pred}(u)$:
   - If no upstream predecessor has `Risk Score > 20`, machine $u$ is a candidate root cause.
   - If multiple candidates exist, tie-break by highest Risk Score.
3. The candidate with the greatest downstream throughput loss impact is flagged as **Root Cause** and **Fix-First Machine**.

---

## 8. Configuration Dictionary & Environment Keys

All scoring weights, thresholds, and simulation timings are centralized in `backend/app/core/config.py`:

```python
class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/factory"
    READING_RETENTION_MINUTES: int = 120
    SIMULATION_TICK_SECONDS: float = 1.0
    SIMULATION_DEFAULT_SPEED: float = 1.0

    # Hysteresis
    HYSTERESIS_UPGRADE_TICKS: int = 3
    HYSTERESIS_DOWNGRADE_TICKS: int = 10

    # Scoring weights
    WEIGHT_HEALTH_DEFICIT: float = 0.45
    WEIGHT_RATE_OF_CHANGE: float = 0.25
    WEIGHT_DOWNSTREAM_EXPOSURE: float = 0.20
    WEIGHT_LIFECYCLE_URGENCY: float = 0.10

    # Isolation Forest
    IF_MAX_PENALTY: float = 15.0
    IF_CONTAMINATION: float = 0.03
```
