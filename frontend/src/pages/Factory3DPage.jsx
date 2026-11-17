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
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function Factory3DPage() {
  const { selectedMachineId } = useSelectedMachine()
  const { machines } = useLiveData()
  const [resetTrigger, setResetTrigger] = useState(0)
  const [focusSelected, setFocusSelected] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)

  const selectedMachine = machines.find((m) => m.id === selectedMachineId)

  const handleResetCamera = () => {
    setFocusSelected(false)
    setResetTrigger((prev) => prev + 1)
  }

  const handleFocusSelected = () => {
    setFocusSelected(true)
  }

  return (
    <div className="relative w-full h-[calc(100vh-6.5rem)] rounded-2xl overflow-hidden border border-[#313131] bg-[#131209]">
      {/* 3D WebGL Canvas */}
      <FactoryScene
        resetTrigger={resetTrigger}
        isFocusingSelected={focusSelected}
      />

      {/* Floating Viewport Toolbar (Top Left) */}
      <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
        <div className="px-3 py-1.5 rounded-lg bg-[#181818]/90 backdrop-blur-md border border-[#313131] flex items-center gap-2 text-white">
          <Cube className="size-4 text-[#9B9B9B]" />
          <span className="caption-3 font-semibold">Line 01 Twin</span>
        </div>

        <button
          onClick={handleFocusSelected}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181818]/90 hover:bg-[#272727] active:scale-[0.98] backdrop-blur-md border border-[#313131] text-white caption-3 transition-colors duration-300"
          title="Focus camera on selected machine"
        >
          <Crosshair className="size-3.5 text-[#9B9B9B]" />
          <span>Focus {selectedMachineId}</span>
        </button>

        <button
          onClick={handleResetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181818]/90 hover:bg-[#272727] active:scale-[0.98] backdrop-blur-md border border-[#313131] text-white caption-3 transition-colors duration-300"
          title="Reset camera perspective"
        >
          <ArrowsCounterClockwise className="size-3.5 text-[#9B9B9B]" />
          <span>Reset View</span>
        </button>

        {!panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181818]/90 hover:bg-[#272727] backdrop-blur-md border border-[#313131] text-white caption-3"
          >
            <Info className="size-3.5 text-[#9B9B9B]" />
            <span>Open Details</span>
          </button>
        )}
      </div>

      {/* Floating Status Legend (Bottom Left) */}
      <div className="absolute left-4 bottom-4 z-20 hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-[#181818]/90 backdrop-blur-md border border-[#313131] text-[#9B9B9B] caption-4">
        <span className="font-medium text-white">Status:</span>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-500" />
          <span>Warning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-rose-500" />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-red-600 animate-pulse" />
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
