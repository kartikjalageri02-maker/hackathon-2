import React, { useEffect, useState, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Grid } from "@react-three/drei"
import { fetchApi } from "@/lib/api"
import { useLiveData } from "@/providers/LiveDataProvider"
import { useSelectedMachine } from "@/providers/SelectedMachineProvider"
import { ProceduralMachine } from "./ProceduralMachine"
import { DependencyLines } from "./DependencyLines"
import { CameraControls } from "./CameraControls"

export function FactoryScene({ resetTrigger = 0, isFocusingSelected = false }) {
  const [layout, setLayout] = useState([])
  const { machines: liveMachines } = useLiveData()
  const { selectedMachineId, selectMachine } = useSelectedMachine()

  // Load layout from backend
  useEffect(() => {
    async function loadLayout() {
      try {
        const data = await fetchApi("/api/factory/layout")
        setLayout(data.machines || [])
      } catch {
        // Fallback default coordinates if offline
        setLayout([
          { id: "MCH001", name: "Precision CNC Milling", type: "milling_centre", position: { x: -6.0, y: 0, z: 0 } },
          { id: "MCH002", name: "Transfer Conveyor", type: "conveyor", position: { x: 0.0, y: 0, z: 0 } },
          { id: "MCH003", name: "Carton Packaging", type: "packaging", position: { x: 6.0, y: 0, z: 0 } },
        ])
      }
    }
    loadLayout()
  }, [])

  // Merge layout with live machine statuses
  const mergedMachines = layout.map((lMachine) => {
    const live = liveMachines.find((m) => m.id === lMachine.id)
    return {
      ...lMachine,
      health_score: live?.health_score ?? 100,
      severity: live?.severity ?? "Normal",
      nominal_throughput_uph: live?.nominal_throughput_uph ?? 120,
    }
  })

  const selectedMachine = mergedMachines.find((m) => m.id === selectedMachineId)
  const focusPos = isFocusingSelected && selectedMachine ? selectedMachine.position : null

  return (
    <div className="w-full h-full relative bg-[#0D0F14] select-none">
      <Canvas
        camera={{ position: [0, 7.5, 13.5], fov: 44 }}
        dpr={[1, 2]} // Clamped DPR per specification
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        className="w-full h-full"
      >
        {/* Deep Industrial Digital Twin Studio Canvas */}
        <color attach="background" args={["#0D0F14"]} />

        {/* High Definition Multi-Point Studio Lighting */}
        <ambientLight intensity={1.2} />
        {/* Main Sun/Key Light */}
        <directionalLight
          position={[12, 18, 10]}
          intensity={2.6}
          castShadow={false}
        />
        {/* Cool Industrial Blue Fill Light */}
        <directionalLight
          position={[-12, 14, -6]}
          intensity={1.5}
          color="#93C5FD"
        />
        {/* White Silhouette Edge/Rim Backlight */}
        <directionalLight
          position={[0, 16, -14]}
          intensity={2.2}
          color="#FFFFFF"
        />
        {/* Soft Floor Upward Bounce */}
        <directionalLight
          position={[0, -4, 8]}
          intensity={0.6}
          color="#E2E8F0"
        />

        {/* Studio Floor Grid */}
        <Grid
          position={[0, 0, 0]}
          args={[45, 45]}
          cellSize={1}
          cellThickness={0.9}
          cellColor="#1E293B"
          sectionSize={5}
          sectionThickness={1.4}
          sectionColor="#334155"
          fadeDistance={36}
          fadeStrength={1.5}
        />

        <Suspense fallback={null}>
          {/* 3 Procedural Machine Stations */}
          {mergedMachines.map((m) => (
            <ProceduralMachine
              key={m.id}
              machine={m}
              isSelected={m.id === selectedMachineId}
              onSelect={selectMachine}
              isImpactedDownstream={
                (m.id === "MCH002" || m.id === "MCH003") &&
                liveMachines.some((lm) => lm.id === "MCH001" && lm.severity !== "Normal")
              }
            />
          ))}

          {/* Animated Line Material Flow & Dependency Links */}
          <DependencyLines machines={mergedMachines} />
        </Suspense>

        {/* Ultra-Smooth Damped Camera Controls */}
        <CameraControls
          focusPosition={focusPos}
          resetTrigger={resetTrigger}
        />
      </Canvas>
    </div>
  )
}
