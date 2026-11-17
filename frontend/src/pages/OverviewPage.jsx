import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLiveData } from "@/providers/LiveDataProvider"
import { useSelectedMachine } from "@/providers/SelectedMachineProvider"
import { FactoryScene } from "@/features/factory3d/FactoryScene"
import { MetricCard } from "@/components/shared/MetricCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ScoreRing } from "@/components/shared/ScoreRing"
import { MetricCardSkeleton, SkeletonBox } from "@/components/shared/Skeletons"
import {
  Factory,
  Gauge,
  Bell,
  Cube,
  Waveform,
  PlayCircle,
  ArrowRight,
  Cpu,
  ArrowsCounterClockwise,
  Crosshair,
  Lightning,
  ShieldWarning,
  Wrench,
  X
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { startSimulationScenario, resetSimulation } from "@/lib/api"
import { toast } from "sonner"

export function OverviewPage() {
  const { machines, factorySummary, connectionStatus } = useLiveData()
  const { selectedMachineId, selectMachine } = useSelectedMachine()
  const navigate = useNavigate()

  const [resetTrigger, setResetTrigger] = useState(0)
  const [focusSelected, setFocusSelected] = useState(false)
  const [cameraPreset, setCameraPreset] = useState("overview")
  const [activeTouchedPart, setActiveTouchedPart] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const isLoading = !factorySummary && machines.length === 0

  const handleQuickInject = async (scenarioId, machineId) => {
    setIsSimulating(true)
    try {
      await startSimulationScenario(scenarioId, {
        machine_id: machineId,
        duration_seconds: 60,
        speed: 2.0
      })
      selectMachine(machineId)
      toast.success(`Injected "${scenarioId.replace("_", " ")}" on ${machineId}`)
    } catch (err) {
      toast.error(err.message || "Failed to trigger scenario")
    } finally {
      setIsSimulating(false)
    }
  }

  const handleResetLine = async () => {
    setIsSimulating(true)
    try {
      await resetSimulation()
      toast.success("Factory line restored to nominal baseline")
    } catch (err) {
      toast.error(err.message || "Failed to reset factory")
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4 rounded-3xl bg-blueprint-overview min-h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="caption-3 font-mono text-white bg-[#1F1F1F] px-2 py-0.5 rounded border border-white/10">
              LINE 01
            </span>
            <span className="caption-3 text-[#9B9B9B] font-mono">3 Connected Stations • Synchronous Flow</span>
          </div>
          <h1 className="heading-4 text-white text-balance">Beyond the Factory Floor</h1>
          <p className="body-6 text-[#9B9B9B] text-pretty mt-1">
            Industrial monitoring, predictive maintenance, and 3D digital twin decision support.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetLine}
            disabled={isSimulating}
            className="flex items-center gap-2 py-2 px-3 rounded-lg glossy-btn text-white button-sm transition-all duration-300"
            title="Reset line to nominal"
          >
            <ArrowsCounterClockwise className="size-4 text-[#9B9B9B]" />
            <span>Reset Line</span>
          </button>
          <button
            onClick={() => navigate("/app/simulation")}
            className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-neutral-200 text-black button-sm font-semibold transition-all duration-300 active:scale-[0.98] shadow-lg shadow-white/10"
          >
            <PlayCircle className="size-4" weight="fill" />
            <span>What If Sandbox</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glossy-card p-4 flex items-center justify-between">
            <div>
              <span className="title-4 text-[#9B9B9B]">Factory Health</span>
              <div className="heading-3 font-mono text-white mt-1">
                {factorySummary ? `${Math.round(factorySummary.factory_health_score)}%` : "98%"}
              </div>
              <span className="caption-4 text-emerald-400 mt-1 block">Optimal operating range</span>
            </div>
            <ScoreRing
              score={factorySummary ? factorySummary.factory_health_score : 98}
              size={64}
              strokeWidth={5}
              label=""
            />
          </div>

          <MetricCard
            title="Line Exit Throughput"
            value={factorySummary ? factorySummary.line_throughput_uph : 120}
            unit="UPH"
            subtitle="Nominal capacity: 120 UPH"
            icon={<Gauge className="size-5" />}
          />

          <MetricCard
            title="Production Loss"
            value={factorySummary ? factorySummary.throughput_loss_percent : 0.0}
            unit="%"
            subtitle={
              factorySummary?.throughput_loss_percent > 0
                ? "Constrained by upstream bottleneck"
                : "Zero bottleneck detected"
            }
            valueClassName={factorySummary?.throughput_loss_percent > 0 ? "text-amber-400" : "text-emerald-400"}
            icon={<Factory className="size-5" />}
          />

          <MetricCard
            title="Active Alerts"
            value={factorySummary ? factorySummary.active_alerts_count : 0}
            subtitle={
              factorySummary?.active_alerts_count > 0
                ? "Requiring technician response"
                : "Zero unacknowledged alarms"
            }
            valueClassName={factorySummary?.active_alerts_count > 0 ? "text-rose-400" : "text-white"}
            icon={<Bell className="size-5" />}
          />
        </div>
      )}

      {/* Hero 3D Digital Twin Viewport with Quick Simulation Dock */}
      <div className="rounded-2xl glossy-panel overflow-hidden flex flex-col shadow-2xl">
        {/* Viewport Control Bar */}
        <div className="px-4 py-3 border-b border-white/10 bg-[#141418]/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cube className="size-5 text-[#9B9B9B]" />
            <h2 className="title-3 text-white">Interactive 3D Digital Twin</h2>
            <span className="caption-3 text-[#9B9B9B] hidden md:inline">
              • Drag to rotate, scroll to zoom, click any machine to inspect
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {/* View Presets */}
            <div className="flex items-center rounded-lg bg-[#1F1F1F] border border-[#313131] p-0.5">
              {[
                { id: "overview", label: "Overview" },
                { id: "isometric", label: "Isometric" },
                { id: "top", label: "Top" },
                { id: "front", label: "Front" },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => {
                    setFocusSelected(false)
                    setCameraPreset(view.id)
                  }}
                  className={cn(
                    "px-2 py-0.5 rounded-md caption-4 transition-all duration-200 active:scale-[0.98]",
                    cameraPreset === view.id && !focusSelected
                      ? "bg-[#272727] text-white font-medium shadow-sm"
                      : "text-[#9B9B9B] hover:text-white"
                  )}
                >
                  {view.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setFocusSelected(true)
                setTimeout(() => setFocusSelected(false), 900)
              }}
              className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#1F1F1F] hover:bg-[#272727] border border-[#313131] text-white caption-3 transition-all duration-300 active:scale-[0.98]"
              title="Focus selected machine"
            >
              <Crosshair className="size-3.5 text-[#9B9B9B]" />
              <span>Focus {selectedMachineId}</span>
            </button>
            <button
              onClick={() => {
                setFocusSelected(false)
                setCameraPreset("overview")
                setResetTrigger((prev) => prev + 1)
              }}
              className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#1F1F1F] hover:bg-[#272727] border border-[#313131] text-white caption-3 transition-all duration-300 active:scale-[0.98]"
              title="Reset camera angle"
            >
              <ArrowsCounterClockwise className="size-3.5 text-[#9B9B9B]" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* 3D Canvas Box */}
        <div className="w-full h-[420px] sm:h-[480px] relative">
          <FactoryScene
            resetTrigger={resetTrigger}
            isFocusingSelected={focusSelected}
            cameraPreset={cameraPreset}
            onSelectPart={setActiveTouchedPart}
          />

          {/* Quick Simulation Trigger Overlay Dock (Bottom Left) */}
          <div className="absolute left-4 bottom-4 z-20 flex flex-wrap items-center gap-2 bg-[#181818]/90 backdrop-blur-md border border-[#313131] p-2.5 rounded-xl shadow-2xl">
            <span className="caption-4 font-mono text-white flex items-center gap-1.5 mr-1 font-semibold">
              <Lightning className="size-3.5 text-amber-400" />
              Quick Test:
            </span>

            <button
              onClick={() => handleQuickInject("bearing_wear", "MCH001")}
              disabled={isSimulating}
              className="px-2.5 py-1 rounded-lg bg-[#1F1F1F] hover:bg-[#272727] border border-[#313131] text-white caption-4 transition-colors duration-300 active:scale-[0.98]"
            >
              Bearing Wear (MCH001)
            </button>

            <button
              onClick={() => handleQuickInject("belt_slip", "MCH002")}
              disabled={isSimulating}
              className="px-2.5 py-1 rounded-lg bg-[#1F1F1F] hover:bg-[#272727] border border-[#313131] text-white caption-4 transition-colors duration-300 active:scale-[0.98]"
            >
              Belt Slip (MCH002)
            </button>

            <button
              onClick={() => handleQuickInject("motor_overheat", "MCH003")}
              disabled={isSimulating}
              className="px-2.5 py-1 rounded-lg bg-[#1F1F1F] hover:bg-[#272727] border border-[#313131] text-white caption-4 transition-colors duration-300 active:scale-[0.98]"
            >
              Motor Overheat (MCH003)
            </button>

            <button
              onClick={handleResetLine}
              disabled={isSimulating}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 caption-4 font-medium transition-colors duration-300 active:scale-[0.98]"
            >
              Reset
            </button>
          </div>

          {/* Active Component 3D Touch Inspector Floating HUD (Bottom Right) */}
          {activeTouchedPart && (
            <div className="absolute right-4 bottom-4 z-20 max-w-sm floating-hud p-3.5 rounded-2xl animate-slide-up flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                <Cpu className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="caption-5 font-mono text-white/50">{activeTouchedPart.machineId} • COMPONENT</span>
                  <button
                    onClick={() => setActiveTouchedPart(null)}
                    className="text-[#9B9B9B] hover:text-white transition-colors p-0.5"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <h4 className="title-4 text-white font-semibold truncate mt-0.5">{activeTouchedPart.name}</h4>
                <p className="caption-4 text-blue-400 font-mono mt-0.5 font-medium">{activeTouchedPart.telemetry}</p>
                <p className="caption-5 text-[#9B9B9B] mt-1 line-clamp-2">{activeTouchedPart.spec}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Production Line Machine Stations Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="heading-6 text-white">Production Line Cell (3 Interconnected Stations)</h2>
          <span className="caption-4 text-[#9B9B9B]">
            Synchronized with live 3D models and sensor telemetry
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonBox className="h-44" />
            <SkeletonBox className="h-44" />
            <SkeletonBox className="h-44" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {machines.map((machine) => {
              const isSelected = selectedMachineId === machine.id

              return (
                <div
                  key={machine.id}
                  onClick={() => selectMachine(machine.id)}
                  className={cn(
                    "glossy-card p-5 cursor-pointer flex flex-col justify-between active:scale-[0.98]",
                    isSelected ? "border-white/50 shadow-2xl ring-1 ring-white/30" : "border-white/10"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="title-4 font-mono text-white font-semibold flex items-center gap-1.5">
                        <Cpu className="size-4 text-[#9B9B9B]" />
                        {machine.id}
                      </span>
                      <StatusBadge status={machine.severity} />
                    </div>

                    <h3 className="title-3 text-white truncate">{machine.name}</h3>
                    <div className="caption-4 text-[#9B9B9B] capitalize mt-0.5">
                      {machine.role_in_line} • {machine.type.replace("_", " ")}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#313131] flex items-center justify-between">
                    <div>
                      <div className="caption-5 text-[#9B9B9B] uppercase tracking-wider">Health</div>
                      <div className="title-2 font-mono text-white font-medium">
                        {Math.round(machine.health_score || 100)}%
                      </div>
                    </div>

                    <div>
                      <div className="caption-5 text-[#9B9B9B] uppercase tracking-wider">Nominal</div>
                      <div className="title-2 font-mono text-white font-medium">
                        {machine.nominal_throughput_uph} <span className="caption-5">UPH</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={cn(
                          "caption-4 inline-flex items-center gap-1 font-medium",
                          isSelected ? "text-white" : "text-[#9B9B9B]"
                        )}
                      >
                        {isSelected ? "Selected" : "Inspect"}
                        <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate("/app/sensors")}
          className="glossy-card p-5 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <Waveform className="size-6 text-white" />
            </div>
            <div>
              <div className="title-3 text-white group-hover:text-neutral-200">Sensor Analytics</div>
              <div className="caption-2 text-[#9B9B9B]">
                8 live streaming channels with continuous thresholds.
              </div>
            </div>
          </div>
          <ArrowRight className="size-5 text-[#9B9B9B] group-hover:translate-x-1 transition-transform duration-300" />
        </div>

        <div
          onClick={() => navigate("/app/dependencies")}
          className="glossy-card p-5 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <Factory className="size-6 text-white" />
            </div>
            <div>
              <div className="title-3 text-white group-hover:text-neutral-200">Dependency Impact</div>
              <div className="caption-2 text-[#9B9B9B]">
                NetworkX graph showing upstream starvation propagation.
              </div>
            </div>
          </div>
          <ArrowRight className="size-5 text-[#9B9B9B] group-hover:translate-x-1 transition-transform duration-300" />
        </div>

        <div
          onClick={() => navigate("/app/resources")}
          className="glossy-card p-5 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <Wrench className="size-6 text-white" />
            </div>
            <div>
              <div className="title-3 text-white group-hover:text-neutral-200">Resource Dispatch</div>
              <div className="caption-2 text-[#9B9B9B]">
                Parts inventory substitutes and certified staff allocation.
              </div>
            </div>
          </div>
          <ArrowRight className="size-5 text-[#9B9B9B] group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </div>
  )
}
