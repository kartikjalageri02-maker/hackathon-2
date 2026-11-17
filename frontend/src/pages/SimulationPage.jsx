import React, { useState, useEffect } from "react"
import {
  PlayCircle,
  ArrowsCounterClockwise,
  Lightning,
  Gauge,
  CheckCircle,
  Warning,
  Clock,
  Speedometer,
  Cpu,
  Sliders,
  CaretRight
} from "@phosphor-icons/react"
import {
  getSimulationScenarios,
  getSimulationState,
  startSimulationScenario,
  triggerAbnormalEvent,
  resetSimulation,
  getMachines,
  getDependencyImpact
} from "@/lib/api"
import { useSelectedMachine } from "@/providers/SelectedMachineProvider"
import { useLiveData } from "@/providers/LiveDataProvider"
import { toast } from "sonner"
import { MetricCard } from "@/components/shared/MetricCard"

const SCENARIO_PRESETS = [
  {
    id: "bearing_wear",
    name: "Bearing Deterioration",
    machines: ["MCH001", "MCH002"],
    description: "Vibration and acoustic noise rise smoothly, indicating spalling in bearing raceways.",
    signatures: "vibration_mm_s, acoustic_db, micro_movement_um",
    component: "Main Spindle Bearings"
  },
  {
    id: "motor_overheat",
    name: "Motor Overheating",
    machines: ["MCH001", "MCH002", "MCH003"],
    description: "Stator temperature and infrared hotspots climb under continuous electrical load.",
    signatures: "temperature_c, infrared_c, current_a",
    component: "Drive Motor Assembly"
  },
  {
    id: "belt_slip",
    name: "Conveyor Belt Damage",
    machines: ["MCH002"],
    description: "Belt tracking slippage causing micro movement and electrical current fluctuation.",
    signatures: "current_a, micro_movement_um, vibration_mm_s",
    component: "Transfer Conveyor Belt"
  },
  {
    id: "electrical_overload",
    name: "Electrical Overload",
    machines: ["MCH001", "MCH002", "MCH003"],
    description: "Current spikes sharply with rapid temperature increase across power inverter stages.",
    signatures: "current_a, temperature_c, infrared_c",
    component: "Main Drive Inverter"
  },
  {
    id: "misalignment",
    name: "Mechanical Misalignment",
    machines: ["MCH001", "MCH002"],
    description: "Shaft coupling offset increases vibration and mechanical alignment deviation.",
    signatures: "alignment_dev_mm, vibration_mm_s",
    component: "Flexible Shaft Coupling"
  }
]

const WORKFLOW_STEPS = [
  { step: 1, title: "Baseline Telemetry", desc: "Line operating at 120 UPH with nominal sensor signals." },
  { step: 2, title: "Failure Injected", desc: "Physical scenario ramps up on selected target machine." },
  { step: 3, title: "Telemetry Rise", desc: "Sensors cross warning thresholds smoothly." },
  { step: 4, title: "Anomaly Detection", desc: "Isolation Forest + deterministic physical pattern rule match." },
  { step: 5, title: "Health Derate", desc: "Health score drops, raising operational risk index." },
  { step: 6, title: "Bottleneck Propagation", desc: "Downstream starvation detected, calculating lost line UPH." },
  { step: 7, title: "Alert Raised", desc: "Central alarm escalates in place, activating audio beacon." },
  { step: 8, title: "Resource Recommender", desc: "Prescriptive work order matches parts and technician." },
  { step: 9, title: "Remediation Authorized", desc: "Operator acknowledges, supervisor approves work order." },
  { step: 10, title: "Line Restored", desc: "Reset returns line to 100% nominal baseline." }
]

export default function SimulationPage() {
  const { selectedMachineId, selectMachine } = useSelectedMachine()
  const { machines } = useLiveData()

  const [selectedScenario, setSelectedScenario] = useState("bearing_wear")
  const [targetMachine, setTargetMachine] = useState(selectedMachineId || "MCH001")
  const [speedMultiplier, setSpeedMultiplier] = useState(2.0)
  const [durationSeconds, setDurationSeconds] = useState(60)
  const [simState, setSimState] = useState(null)
  const [impact, setImpact] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)

  // Fetch simulation state & line impact
  const pollState = async () => {
    try {
      const [sState, imp] = await Promise.all([
        getSimulationState().catch(() => null),
        getDependencyImpact().catch(() => null)
      ])
      setSimState(sState)
      setImpact(imp)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    pollState()
    const timer = setInterval(pollState, 1500)
    return () => clearInterval(timer)
  }, [])

  // Sync targetMachine with global selection if valid
  useEffect(() => {
    if (selectedMachineId) {
      setTargetMachine(selectedMachineId)
    }
  }, [selectedMachineId])

  const handleStartScenario = async () => {
    setIsExecuting(true)
    try {
      await startSimulationScenario(selectedScenario, {
        machine_id: targetMachine,
        duration_seconds: durationSeconds,
        speed: speedMultiplier
      })
      toast.success(`Started "${selectedScenario.replace("_", " ")}" on ${targetMachine} at ${speedMultiplier}x speed`)
      selectMachine(targetMachine)
      pollState()
    } catch (err) {
      toast.error(err.message || "Failed to start simulation scenario")
    } finally {
      setIsExecuting(false)
    }
  }

  const handleTriggerSpike = async (sensor = "vibration_mm_s") => {
    try {
      await triggerAbnormalEvent({
        machine_id: targetMachine,
        sensor: sensor,
        multiplier: 2.2,
        duration_seconds: 15
      })
      toast.success(`Injected abnormal spike on ${targetMachine} (${sensor})`)
      pollState()
    } catch (err) {
      toast.error(err.message || "Failed to trigger spike")
    }
  }

  const handleReset = async () => {
    setIsExecuting(true)
    try {
      await resetSimulation()
      toast.success("Factory simulation reset: all machines restored to nominal baseline")
      pollState()
    } catch (err) {
      toast.error(err.message || "Failed to reset simulation")
    } finally {
      setIsExecuting(false)
    }
  }

  const isRunning = simState?.status === "running"
  const currentScenarioInfo = SCENARIO_PRESETS.find(s => s.id === selectedScenario)

  // Calculate current active workflow step
  let activeStep = 1
  if (isRunning) {
    if (impact && impact.lost_uph > 0) {
      activeStep = 6
    } else if (simState?.elapsed_seconds > 4) {
      activeStep = 4
    } else {
      activeStep = 2
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4 rounded-3xl bg-simulation-grid min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#313131] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="caption-3 font-mono text-white bg-[#1F1F1F] px-2 py-0.5 rounded border border-[#313131]">
              STAGE 10
            </span>
            <span className="caption-3 text-[#9B9B9B] font-mono">What If Simulation Engine</span>
          </div>
          <h1 className="heading-4 text-white text-balance">What If Simulation & Presentation Sandbox</h1>
          <p className="body-6 text-[#9B9B9B] text-pretty mt-1">
            Inject reproducible physical degradation scenarios, observe downstream bottleneck starvation, and verify remediation.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={isExecuting}
          className="flex items-center gap-2 py-2 px-4 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 button-sm transition-all duration-300 active:scale-[0.98]"
        >
          <ArrowsCounterClockwise className="size-4" />
          <span>Reset Factory Line</span>
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Scenario"
          value={isRunning ? simState.active_scenario.replace("_", " ") : "Baseline Normal"}
          subtitle={isRunning ? `Target: ${simState.target_machine_id} (${simState.speed}x speed)` : "All machines in nominal state"}
          valueClassName={isRunning ? "text-amber-400 capitalize" : "text-white capitalize"}
        />
        <MetricCard
          title="Elapsed Time"
          value={isRunning ? `${simState.elapsed_seconds}s` : "0s"}
          subtitle={isRunning ? `Duration: ${simState.duration_seconds}s target` : "Waiting for scenario trigger"}
          icon={<Clock className="size-5" />}
        />
        <MetricCard
          title="Line Production Loss"
          value={impact ? `-${impact.lost_uph} UPH` : "0.0 UPH"}
          subtitle={impact && impact.lost_uph > 0 ? `${impact.loss_percentage}% throughput derate` : "Zero downstream starvation"}
          valueClassName={impact && impact.lost_uph > 0 ? "text-rose-400" : "text-emerald-400"}
          icon={<Gauge className="size-5" />}
        />
        <MetricCard
          title="Root Cause Station"
          value={impact?.root_cause_machine_id || "None"}
          subtitle={impact?.root_cause_machine_name || "Line operating balanced"}
          valueClassName={impact && impact.lost_uph > 0 ? "text-amber-400" : "text-emerald-400"}
          icon={<Warning className="size-5" />}
        />
      </div>

      {/* Main Simulation Control Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scenario & Parameter Configurator */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#181818] border border-[#313131] rounded-xl p-5 space-y-5">
            <h2 className="title-3 text-white flex items-center gap-2">
              <Sliders className="size-5 text-[#9B9B9B]" />
              <span>Select Failure Scenario</span>
            </h2>

            {/* Scenario Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCENARIO_PRESETS.map((sc) => {
                const isSelected = selectedScenario === sc.id
                return (
                  <div
                    key={sc.id}
                    onClick={() => {
                      setSelectedScenario(sc.id)
                      // Auto pick first compatible machine
                      if (!sc.machines.includes(targetMachine)) {
                        setTargetMachine(sc.machines[0])
                      }
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 card-hover-smooth flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#1F1F1F] border-white shadow-xl shadow-white/5"
                        : "bg-[#131209] border-[#313131] hover:border-[#4B5563]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="title-4 text-white font-medium">{sc.name}</span>
                        {isSelected && <span className="size-2 rounded-full bg-white" />}
                      </div>
                      <p className="caption-3 text-[#9B9B9B] leading-relaxed">
                        {sc.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#313131] flex items-center justify-between caption-4 text-[#9B9B9B]">
                      <span>Machines: {sc.machines.join(", ")}</span>
                      <span className="font-mono text-white/70">{sc.component}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Parameters Control Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#313131]">
              {/* Target Machine */}
              <div>
                <label className="caption-3 text-[#9B9B9B] block mb-1.5">Target Machine</label>
                <div className="flex items-center gap-1.5">
                  {["MCH001", "MCH002", "MCH003"].map((mid) => {
                    const isSupported = currentScenarioInfo?.machines.includes(mid)
                    return (
                      <button
                        key={mid}
                        disabled={!isSupported}
                        onClick={() => setTargetMachine(mid)}
                        className={`flex-1 py-1.5 px-2 rounded-lg font-mono caption-3 font-medium transition-colors ${
                          targetMachine === mid
                            ? "bg-white text-black font-semibold"
                            : isSupported
                            ? "bg-[#1F1F1F] text-white hover:bg-[#272727]"
                            : "bg-[#181818] text-[#555555] cursor-not-allowed opacity-40"
                        }`}
                      >
                        {mid}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Speed Multiplier */}
              <div>
                <label className="caption-3 text-[#9B9B9B] block mb-1.5">Simulation Speed</label>
                <div className="flex items-center gap-1.5">
                  {[1.0, 2.0, 5.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSpeedMultiplier(spd)}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-mono caption-3 font-medium transition-colors ${
                        speedMultiplier === spd
                          ? "bg-white text-black font-semibold"
                          : "bg-[#1F1F1F] text-white hover:bg-[#272727]"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="caption-3 text-[#9B9B9B] block mb-1.5">Scenario Duration</label>
                <div className="flex items-center gap-1.5">
                  {[30, 60, 120].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setDurationSeconds(dur)}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-mono caption-3 font-medium transition-colors ${
                        durationSeconds === dur
                          ? "bg-white text-black font-semibold"
                          : "bg-[#1F1F1F] text-white hover:bg-[#272727]"
                      }`}
                    >
                      {dur}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#313131]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTriggerSpike("vibration_mm_s")}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-[#1F1F1F] hover:bg-[#272727] border border-[#313131] text-white button-sm transition-colors duration-300"
                >
                  <Lightning className="size-4 text-amber-400" />
                  <span>Spike Vibration</span>
                </button>
                <button
                  onClick={() => handleTriggerSpike("temperature_c")}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-[#1F1F1F] hover:bg-[#272727] border border-[#313131] text-white button-sm transition-colors duration-300"
                >
                  <Lightning className="size-4 text-rose-400" />
                  <span>Spike Temperature</span>
                </button>
              </div>

              <button
                onClick={handleStartScenario}
                disabled={isExecuting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-5 rounded-lg bg-white hover:bg-neutral-200 text-black button-md font-semibold transition-all duration-300 active:scale-[0.98]"
              >
                <PlayCircle className="size-5" weight="fill" />
                <span>Inject Scenario</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 10-Step Workflow Stepper */}
        <div className="bg-[#181818] border border-[#313131] rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#313131] pb-3 mb-4">
              <h3 className="title-3 text-white">10-Step Workflow Progress</h3>
              <span className="caption-3 font-mono text-[#9B9B9B]">
                Step {activeStep} of 10
              </span>
            </div>

            <div className="space-y-2.5">
              {WORKFLOW_STEPS.map((ws) => {
                const isPassed = activeStep > ws.step
                const isCurrent = activeStep === ws.step

                return (
                  <div
                    key={ws.step}
                    className={`flex items-start gap-2.5 p-2 rounded-lg transition-all duration-300 ${
                      isCurrent
                        ? "bg-[#1F1F1F] border border-amber-500/40 text-white"
                        : isPassed
                        ? "text-[#9B9B9B] opacity-75"
                        : "text-[#555555] opacity-50"
                    }`}
                  >
                    <span
                      className={`size-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                        isCurrent
                          ? "bg-amber-400 text-black font-bold animate-pulse"
                          : isPassed
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-[#222222] text-[#888888]"
                      }`}
                    >
                      {isPassed ? "✓" : ws.step}
                    </span>

                    <div className="text-left">
                      <div className="caption-2 font-medium leading-tight">
                        {ws.title}
                      </div>
                      <div className="caption-4 text-[#9B9B9B] mt-0.5 leading-snug">
                        {ws.desc}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#313131] caption-4 text-[#9B9B9B]">
            *Full 10-step loop demonstratable in under 2 minutes.
          </div>
        </div>
      </div>
    </div>
  )
}
