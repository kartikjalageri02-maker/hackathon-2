import React, { useState } from "react"
import { useSelectedMachine } from "@/providers/SelectedMachineProvider"
import { useLiveData } from "@/providers/LiveDataProvider"
import { FactoryScene } from "@/features/factory3d/FactoryScene"
import { MachineDetailPanel } from "@/features/factory3d/MachineDetailPanel"
import {
  Crosshair,
  ArrowsCounterClockwise,
  Cube,
  Info,
  Compass,
  X,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function Factory3DPage() {
  const { selectedMachineId } = useSelectedMachine()
  const { machines } = useLiveData()
  const [resetTrigger, setResetTrigger] = useState(0)
  const [focusSelected, setFocusSelected] = useState(false)
  const [cameraPreset, setCameraPreset] = useState("overview")
  const [activeTouchedPart, setActiveTouchedPart] = useState(null)
  const [panelOpen, setPanelOpen] = useState(true)

  const selectedMachine = machines.find((m) => m.id === selectedMachineId)

  const handleResetCamera = () => {
    setFocusSelected(false)
    setCameraPreset("overview")
    setResetTrigger((prev) => prev + 1)
  }

  const handleFocusSelected = () => {
    setFocusSelected(true)
  }

  const handlePresetChange = (presetName) => {
    setFocusSelected(false)
    setCameraPreset(presetName)
  }

  return (
    <div className="relative w-full h-[calc(100vh-6.5rem)] rounded-2xl overflow-hidden border border-[#313131] bg-[#0B0E14] shadow-2xl">
      {/* 3D WebGL Canvas */}
      <FactoryScene
        resetTrigger={resetTrigger}
        isFocusingSelected={focusSelected}
        cameraPreset={cameraPreset}
        onSelectPart={setActiveTouchedPart}
      />

      {/* Floating Active Component HUD Callout */}
      {activeTouchedPart && (
        <div className="absolute left-4 bottom-16 z-30 max-w-sm floating-hud p-3.5 rounded-2xl animate-slide-up flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0 mt-0.5">
            <Cube className="size-5" />
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

      {/* Floating Viewport Toolbar (Top Left) */}
      <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
        <div className="px-3 py-1.5 rounded-lg glossy-panel flex items-center gap-2 text-white">
          <Cube className="size-4 text-[#9B9B9B]" />
          <span className="caption-3 font-semibold">Line 01 Twin</span>
        </div>

        {/* View Presets Pill Group */}
        <div className="flex items-center rounded-lg glossy-panel p-0.5">
          {[
            { id: "overview", label: "Overview" },
            { id: "isometric", label: "Isometric" },
            { id: "top", label: "Top" },
            { id: "front", label: "Front" },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => handlePresetChange(view.id)}
              className={cn(
                "px-2.5 py-1 rounded-md caption-4 transition-all duration-200 active:scale-[0.98]",
                cameraPreset === view.id && !focusSelected
                  ? "bg-white/20 text-white font-medium shadow-sm"
                  : "text-[#9B9B9B] hover:text-white"
              )}
            >
              {view.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleFocusSelected}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg caption-3 transition-all duration-300 active:scale-[0.98]",
            focusSelected
              ? "bg-white text-black font-semibold shadow-lg"
              : "glossy-btn text-white"
          )}
          title="Focus camera on selected machine"
        >
          <Crosshair className="size-3.5" />
          <span>Focus {selectedMachineId}</span>
        </button>

        <button
          onClick={handleResetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glossy-btn active:scale-[0.98] text-white caption-3 transition-colors duration-300"
          title="Reset camera perspective"
        >
          <ArrowsCounterClockwise className="size-3.5 text-[#9B9B9B]" />
          <span>Reset</span>
        </button>

        {!panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181818]/90 hover:bg-[#272727] backdrop-blur-md border border-[#313131] text-white caption-3 transition-all duration-300"
          >
            <Info className="size-3.5 text-[#9B9B9B]" />
            <span>Open Details</span>
          </button>
        )}
      </div>

      {/* Floating Status Legend (Bottom Left) */}
      <div className="absolute left-4 bottom-4 z-20 hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#181818]/90 backdrop-blur-md border border-[#313131] text-[#9B9B9B] caption-4 shadow-xl">
        <span className="font-medium text-white">Status:</span>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
          <span>Warning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-red-600 animate-pulse shadow-sm shadow-red-600/50" />
          <span>Emergency</span>
        </div>
      </div>

      {/* Interactive Machine Detail Panel (Right) */}
      {panelOpen && (
        <MachineDetailPanel
          machineId={selectedMachineId}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  )
}
