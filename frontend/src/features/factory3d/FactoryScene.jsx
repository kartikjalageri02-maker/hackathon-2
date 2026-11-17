import React, { useEffect, useState, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Grid } from "@react-three/drei"
import { fetchApi } from "@/lib/api"
import { useLiveData } from "@/providers/LiveDataProvider"
import { useSelectedMachine } from "@/providers/SelectedMachineProvider"
import { ProceduralMachine } from "./ProceduralMachine"
import { DependencyLines } from "./DependencyLines"
import { CameraControls } from "./CameraControls"
import { SkeletonBox } from "@/components/shared/Skeletons"

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
    <div className="w-full h-full relative bg-[#131209]">
      <Canvas
        camera={{ position: [0, 8, 14], fov: 45 }}
        dpr={[1, 2]} // Clamped DPR per specification
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full"
      >
        {/* Flat scene background */}
        <color attach="background" args={["#131209"]} />

        {/* Studio Lighting (No external HDR/CDN) */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.2}
          castShadow={false}
        />
        <directionalLight position={[-10, 10, -5]} intensity={0.4} />

        {/* Floor Grid with design token colors */}
        <Grid
          position={[0, 0, 0]}
          args={[40, 40]}
          cellSize={1}
          cellThickness={0.8}
          cellColor="#1F1F1F"
          sectionSize={5}
          sectionThickness={1.2}
          sectionColor="#272727"
          fadeDistance={30}
          fadeStrength={1.5}
        />

        <Suspense fallback={null}>
          {/* Machines */}
          {mergedMachines.map((m) => (
            <ProceduralMachine
              key={m.id}
              machine={m}
              isSelected={m.id === selectedMachineId}
              onSelect={selectMachine}
              isImpactedDownstream={
                // MCH002 or MCH003 highlighted if MCH001 has fault
                (m.id === "MCH002" || m.id === "MCH003") &&
                liveMachines.some((lm) => lm.id === "MCH001" && lm.severity !== "Normal")
              }
            />
          ))}

          {/* Dependency Routing Lines */}
          <DependencyLines machines={mergedMachines} />
        </Suspense>

        {/* Interactive Camera Controls */}
        <CameraControls
          focusPosition={focusPos}
          resetTrigger={resetTrigger}
        />
      </Canvas>
    </div>
  )
}
