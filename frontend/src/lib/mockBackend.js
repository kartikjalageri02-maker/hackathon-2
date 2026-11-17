// Client-Side Fallback Engine for GitHub Pages & Offline Deployment
// Provides continuous live telemetry, physical rules, and full REST/WS emulation when running without a Python backend.

export const MOCK_MACHINES = [
  {
    id: "MCH001",
    name: "Precision CNC Milling Centre",
    type: "milling_centre",
    role_in_line: "upstream",
    nominal_throughput_uph: 120,
    criticality_weight: 0.95,
    health_score: 98.4,
    risk_score: 3.2,
    severity: "Normal",
    pos_x: -6.0,
    pos_y: 0.0,
    pos_z: 0.0,
    rot_y: 0.0,
  },
  {
    id: "MCH002",
    name: "Transfer Conveyor",
    type: "conveyor",
    role_in_line: "midstream",
    nominal_throughput_uph: 120,
    criticality_weight: 0.8,
    health_score: 99.1,
    risk_score: 1.8,
    severity: "Normal",
    pos_x: 0.0,
    pos_y: 0.0,
    pos_z: 0.0,
    rot_y: 0.0,
  },
  {
    id: "MCH003",
    name: "Carton Packaging Machine",
    type: "packaging",
    role_in_line: "downstream",
    nominal_throughput_uph: 120,
    criticality_weight: 0.75,
    health_score: 97.9,
    risk_score: 4.1,
    severity: "Normal",
    pos_x: 6.0,
    pos_y: 0.0,
    pos_z: 0.0,
    rot_y: 0.0,
  },
]

export const MOCK_THRESHOLDS = {
  MCH001: [
    { sensor: "temperature_c", unit: "°C", normal_low: 35.0, normal_high: 55.0, warning: 65.0, high: 75.0, critical: 85.0, weight: 1.0 },
    { sensor: "vibration_mm_s", unit: "mm/s", normal_low: 0.2, normal_high: 1.8, warning: 2.8, high: 4.5, critical: 6.0, weight: 1.2 },
    { sensor: "current_a", unit: "A", normal_low: 8.0, normal_high: 16.0, warning: 20.0, high: 24.0, critical: 28.0, weight: 0.9 },
    { sensor: "pressure_bar", unit: "bar", normal_low: 5.5, normal_high: 6.5, warning: 5.0, high: 4.5, critical: 4.0, weight: 0.8 },
    { sensor: "infrared_c", unit: "°C", normal_low: 30.0, normal_high: 50.0, warning: 60.0, high: 70.0, critical: 80.0, weight: 0.9 },
    { sensor: "micro_movement_um", unit: "µm", normal_low: 1.0, normal_high: 8.0, warning: 12.0, high: 18.0, critical: 25.0, weight: 0.7 },
    { sensor: "alignment_dev_mm", unit: "mm", normal_low: 0.01, normal_high: 0.08, warning: 0.15, high: 0.25, critical: 0.4, weight: 1.1 },
    { sensor: "acoustic_db", unit: "dB", normal_low: 65.0, normal_high: 78.0, warning: 84.0, high: 90.0, critical: 96.0, weight: 0.6 },
  ],
  MCH002: [
    { sensor: "temperature_c", unit: "°C", normal_low: 25.0, normal_high: 42.0, warning: 50.0, high: 60.0, critical: 70.0, weight: 0.8 },
    { sensor: "vibration_mm_s", unit: "mm/s", normal_low: 0.3, normal_high: 2.2, warning: 3.2, high: 4.8, critical: 6.5, weight: 1.1 },
    { sensor: "current_a", unit: "A", normal_low: 4.0, normal_high: 9.5, warning: 12.0, high: 15.0, critical: 18.0, weight: 1.0 },
    { sensor: "pressure_bar", unit: "bar", normal_low: 4.0, normal_high: 5.5, warning: 3.5, high: 3.0, critical: 2.5, weight: 0.7 },
    { sensor: "infrared_c", unit: "°C", normal_low: 25.0, normal_high: 40.0, warning: 48.0, high: 58.0, critical: 68.0, weight: 0.8 },
    { sensor: "micro_movement_um", unit: "µm", normal_low: 2.0, normal_high: 12.0, warning: 18.0, high: 26.0, critical: 35.0, weight: 0.9 },
    { sensor: "alignment_dev_mm", unit: "mm", normal_low: 0.02, normal_high: 0.12, warning: 0.22, high: 0.35, critical: 0.5, weight: 1.0 },
    { sensor: "acoustic_db", unit: "dB", normal_low: 60.0, normal_high: 72.0, warning: 78.0, high: 84.0, critical: 90.0, weight: 0.5 },
  ],
  MCH003: [
    { sensor: "temperature_c", unit: "°C", normal_low: 28.0, normal_high: 46.0, warning: 55.0, high: 65.0, critical: 75.0, weight: 0.9 },
    { sensor: "vibration_mm_s", unit: "mm/s", normal_low: 0.2, normal_high: 1.5, warning: 2.4, high: 3.6, critical: 5.0, weight: 1.0 },
    { sensor: "current_a", unit: "A", normal_low: 5.0, normal_high: 11.0, warning: 14.0, high: 18.0, critical: 22.0, weight: 0.8 },
    { sensor: "pressure_bar", unit: "bar", normal_low: 6.0, normal_high: 7.2, warning: 5.4, high: 4.8, critical: 4.2, weight: 1.2 },
    { sensor: "infrared_c", unit: "°C", normal_low: 26.0, normal_high: 44.0, warning: 52.0, high: 62.0, critical: 72.0, weight: 0.8 },
    { sensor: "micro_movement_um", unit: "µm", normal_low: 1.0, normal_high: 6.0, warning: 10.0, high: 15.0, critical: 22.0, weight: 0.7 },
    { sensor: "alignment_dev_mm", unit: "mm", normal_low: 0.01, normal_high: 0.06, warning: 0.12, high: 0.2, critical: 0.3, weight: 0.9 },
    { sensor: "acoustic_db", unit: "dB", normal_low: 62.0, normal_high: 75.0, warning: 80.0, high: 86.0, critical: 92.0, weight: 0.6 },
  ],
}

// Generate active baseline sensor readings with noise
export function generateSensorReading(machineId, tick = 0) {
  const base = {
    MCH001: { temp: 48.2, vib: 1.15, curr: 12.4, press: 6.02, ir: 42.1, mm: 4.2, align: 0.035, db: 71.4 },
    MCH002: { temp: 34.6, vib: 1.42, curr: 6.8, press: 4.85, ir: 32.8, mm: 6.8, align: 0.052, db: 66.8 },
    MCH003: { temp: 38.1, vib: 0.88, curr: 8.2, press: 6.65, ir: 36.4, mm: 3.1, align: 0.028, db: 68.2 },
  }[machineId] || { temp: 45, vib: 1.2, curr: 10, press: 6, ir: 38, mm: 4, align: 0.04, db: 70 }

  const sinOffset = Math.sin(tick * 0.15) * 0.4
  const rnd = () => (Math.random() - 0.5) * 0.25

  return {
    machine_id: machineId,
    ts: new Date().toISOString(),
    temperature_c: +(base.temp + sinOffset + rnd()).toFixed(2),
    vibration_mm_s: +(base.vib + Math.abs(rnd())).toFixed(3),
    current_a: +(base.curr + rnd()).toFixed(2),
    pressure_bar: +(base.press + rnd() * 0.1).toFixed(2),
    infrared_c: +(base.ir + sinOffset * 0.8 + rnd()).toFixed(2),
    micro_movement_um: +(base.mm + rnd()).toFixed(2),
    alignment_dev_mm: +(base.align + rnd() * 0.005).toFixed(4),
    acoustic_db: +(base.db + rnd() * 0.8).toFixed(1),
  }
}

// Generate history
export function generateSensorHistory(machineId, minutes = 15) {
  const history = []
  const count = Math.min(minutes * 4, 60)
  for (let i = count; i >= 0; i--) {
    const reading = generateSensorReading(machineId, i)
    reading.ts = new Date(Date.now() - i * 15000).toISOString()
    history.push(reading)
  }
  return history
}

export function getMockComponents(machineId) {
  return [
    { id: `${machineId}-CMP1`, machine_id: machineId, name: "Spindle / Drive Motor", condition: "Optimal", remaining_useful_life_days: 142, early_deterioration: false, flag_replacement_due: false, inspection_overdue: false, stress_factor: 1.02 },
    { id: `${machineId}-CMP2`, machine_id: machineId, name: "Precision Bearing Assembly", condition: "Good", remaining_useful_life_days: 88, early_deterioration: false, flag_replacement_due: false, inspection_overdue: false, stress_factor: 1.05 },
    { id: `${machineId}-CMP3`, machine_id: machineId, name: "Linear Guideway Set", condition: "Optimal", remaining_useful_life_days: 210, early_deterioration: false, flag_replacement_due: false, inspection_overdue: false, stress_factor: 0.98 },
    { id: `${machineId}-CMP4`, machine_id: machineId, name: "High-Pressure Pneumatic Seal", condition: "Fair", remaining_useful_life_days: 34, early_deterioration: false, flag_replacement_due: false, inspection_overdue: false, stress_factor: 1.12 },
  ]
}

export const MOCK_DEPENDENCY_IMPACT = {
  baseline_line_uph: 120,
  effective_line_uph: 120,
  lost_uph: 0,
  loss_percentage: 0,
  estimated_hourly_loss_usd: 0,
  root_cause_machine_id: null,
  root_cause_machine_name: "Line operating balanced",
  first_action_recommendation: "All upstream and downstream stations synchronous. Normal operation.",
  propagation_chain: [],
  assumptions: [
    "Nominal line speed: 120 UPH across all stations",
    "Material propagation efficiency factor: 1.00 (rigid sync line)",
    "Gross revenue margin model: $45.00 / finished unit",
  ],
  nodes: [
    { id: "MCH001", name: "Precision CNC Milling", capacity_uph: 120, effective_uph: 120, health_score: 98.4, status: "Normal", starvation_uph: 0 },
    { id: "MCH002", name: "Transfer Conveyor", capacity_uph: 120, effective_uph: 120, health_score: 99.1, status: "Normal", starvation_uph: 0 },
    { id: "MCH003", name: "Carton Packaging", capacity_uph: 120, effective_uph: 120, health_score: 97.9, status: "Normal", starvation_uph: 0 },
  ],
  edges: [
    { upstream_id: "MCH001", downstream_id: "MCH002", propagation_factor: 1.0, description: "Machined components to transfer conveyor" },
    { upstream_id: "MCH002", downstream_id: "MCH003", propagation_factor: 1.0, description: "Conveyed parts to automated packaging" },
  ],
}

export const MOCK_PARTS = [
  { id: "PRT-001", name: "15kW High-Frequency Spindle Bearing Set", quantity: 4, reorder_level: 2, lead_time_days: 5, alternative_part_id: "PRT-002" },
  { id: "PRT-002", name: "Standard Duty Ceramic Spindle Bearing Set", quantity: 2, reorder_level: 1, lead_time_days: 7, alternative_part_id: null },
  { id: "PRT-003", name: "Poly-V Kevlar Reinforced Drive Belt", quantity: 6, reorder_level: 3, lead_time_days: 3, alternative_part_id: null },
  { id: "PRT-004", name: "Pneumatic Ejector Piston Seal Ring Set", quantity: 0, reorder_level: 4, lead_time_days: 12, alternative_part_id: "PRT-005" },
  { id: "PRT-005", name: "High-Temperature Fluorocarbon Seal Kit", quantity: 5, reorder_level: 2, lead_time_days: 4, alternative_part_id: null },
  { id: "PRT-006", name: "Infrared Optical Pyrometer Sensor Head", quantity: 3, reorder_level: 1, lead_time_days: 6, alternative_part_id: null },
  { id: "PRT-007", name: "Triaxial IEPE Vibration Accelerometer", quantity: 1, reorder_level: 2, lead_time_days: 8, alternative_part_id: null },
  { id: "PRT-008", name: "Precision Linear Roller Guide Block (Size 25)", quantity: 4, reorder_level: 2, lead_time_days: 5, alternative_part_id: null },
]

export const MOCK_TECHNICIANS = [
  { id: "TECH-01", name: "Marcus Vance", specialisation: "CNC Spindle & Mechanical", availability: "Available", shift: "Morning (06:00 - 14:00)", current_task_id: null },
  { id: "TECH-02", name: "Elena Rostova", specialisation: "Industrial Automation & Robotics", availability: "Available", shift: "Morning (06:00 - 14:00)", current_task_id: null },
  { id: "TECH-03", name: "Liam O'Connor", specialisation: "Conveyor Systems & Power Transmission", availability: "Available", shift: "Day (08:00 - 16:00)", current_task_id: null },
  { id: "TECH-04", name: "Aria Tanaka", specialisation: "Pneumatics & Packaging Systems", availability: "Busy", shift: "Day (08:00 - 16:00)", current_task_id: "WO-8841" },
  { id: "TECH-05", name: "Devon Reed", specialisation: "Electrical Drives & Inverters", availability: "Available", shift: "Afternoon (14:00 - 22:00)", current_task_id: null },
]

export function getMockEndpoint(endpoint) {
  const clean = endpoint.split("?")[0]

  if (clean === "/api/machines") return MOCK_MACHINES
  if (clean === "/api/factory/summary") {
    return {
      total_machines: 3,
      factory_health_score: 98.5,
      nominal_line_uph: 120,
      effective_line_uph: 120,
      active_alerts_count: 0,
      system_status: "Nominal",
      is_simulated: true,
    }
  }
  if (clean === "/api/factory/layout") {
    return { machines: MOCK_MACHINES }
  }
  if (clean.startsWith("/api/machines/") && clean.endsWith("/thresholds")) {
    const id = clean.split("/")[3]
    return MOCK_THRESHOLDS[id] || MOCK_THRESHOLDS.MCH001
  }
  if (clean.startsWith("/api/machines/") && clean.endsWith("/sensors/latest")) {
    const id = clean.split("/")[3]
    return generateSensorReading(id)
  }
  if (clean.startsWith("/api/machines/") && clean.endsWith("/sensors/history")) {
    const id = clean.split("/")[3]
    return generateSensorHistory(id, 15)
  }
  if (clean.startsWith("/api/machines/") && clean.endsWith("/analysis")) {
    const id = clean.split("/")[3]
    const m = MOCK_MACHINES.find((x) => x.id === id) || MOCK_MACHINES[0]
    return {
      machine_id: id,
      ts: new Date().toISOString(),
      health_score: m.health_score,
      risk_score: m.risk_score,
      severity: m.severity,
      reasons: [
        { factor: "Sensor Threshold Margin", points: 0, note: "All 8 channels within nominal envelopes" },
        { factor: "Isolation Forest Statistical Check", points: 0, note: "Pattern density normal (0.02 deviation)" },
      ],
      anomalies: [],
      hypotheses: [],
    }
  }
  if (clean.startsWith("/api/machines/") && clean.endsWith("/components")) {
    const id = clean.split("/")[3]
    return getMockComponents(id)
  }
  if (clean.startsWith("/api/machines/") && clean.endsWith("/maintenance/history")) {
    const id = clean.split("/")[3]
    return [
      { id: "REC-101", machine_id: id, component_id: `${id}-CMP1`, performed_on: "2026-11-02", type: "Lubrication & Balancing", summary: "Routine spindle bearing lubrication completed cleanly.", technician_id: "TECH-01" },
      { id: "REC-102", machine_id: id, component_id: `${id}-CMP3`, performed_on: "2026-10-18", type: "Calibration", summary: "Linear axis alignment recalibrated to within 0.01mm tolerance.", technician_id: "TECH-02" },
    ]
  }
  if (clean === "/api/maintenance/overview") {
    return {
      total_tracked_components: 12,
      early_deterioration_count: 0,
      flag_replacement_due_count: 0,
      inspection_overdue_count: 0,
      healthy_components_count: 12,
    }
  }
  if (clean === "/api/dependencies/graph" || clean === "/api/dependencies/impact") {
    return MOCK_DEPENDENCY_IMPACT
  }
  if (clean === "/api/alerts") {
    return []
  }
  if (clean === "/api/resources/spare-parts") {
    return MOCK_PARTS
  }
  if (clean === "/api/resources/technicians") {
    return MOCK_TECHNICIANS
  }
  if (clean === "/api/recommendations") {
    return []
  }
  if (clean === "/api/simulation/scenarios") {
    return [
      { id: "motor_overheating", name: "Spindle Motor Overheating", target_machines: ["MCH001", "MCH002", "MCH003"], description: "Temperature and infrared hotspot ramp upwards under heavy load." },
      { id: "bearing_deterioration", name: "Bearing Deterioration", target_machines: ["MCH001", "MCH002"], description: "High-frequency vibration and acoustic emissions increase progressively." },
      { id: "conveyor_belt_slip", name: "Conveyor Belt Damage & Slip", target_machines: ["MCH002"], description: "Current fluctuations and micro-movement spikes along transfer line." },
      { id: "electrical_overload", name: "Electrical Drive Overload", target_machines: ["MCH001", "MCH002", "MCH003"], description: "Sudden current surge causing thermal spike across drive controller." },
      { id: "mechanical_misalignment", name: "Coupling Mechanical Misalignment", target_machines: ["MCH001", "MCH002"], description: "Axial alignment deviation accompanied by harmonic vibration." },
    ]
  }
  if (clean === "/api/simulation/state") {
    return { active: false, scenario: null, speed: 1.0, elapsed_seconds: 0 }
  }

  return null
}
