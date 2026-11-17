import React, { useEffect, useState, Suspense } from "react"
import * as THREE from "three"
import { Canvas } from "@react-three/fiber"
import { Grid } from "@react-three/drei"
import { fetchApi } from "@/lib/api"
import { useLiveData } from "@/providers/LiveDataProvider"
import { useSelectedMachine } from "@/providers/SelectedMachineProvider"
import { ProceduralMachine } from "./ProceduralMachine"
import { DependencyLines } from "./DependencyLines"
import { CameraControls } from "./CameraControls"

export function FactoryScene({
  resetTrigger = 0,
  isFocusingSelected = false,
  cameraPreset = null,
  onSelectPart = null,
}) {
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
    <div className="w-full h-full relative bg-[#0B0E14] select-none">
      <Canvas
        camera={{ position: [0, 7.5, 13.5], fov: 44 }}
        dpr={[1, 2]} // Clamped DPR per specification
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        className="w-full h-full"
      >
        {/* Deep Industrial Digital Twin Canvas */}
        <color attach="background" args={["#0B0E14"]} />

        {/* High-Definition Multi-Point Studio Lighting */}
        <ambientLight intensity={1.25} />
        {/* Main Sun/Key Light */}
        <directionalLight
          position={[14, 20, 12]}
          intensity={2.8}
          castShadow={false}
        />
        {/* Cool Industrial Blue Fill Light */}
        <directionalLight
          position={[-14, 14, -8]}
          intensity={1.6}
          color="#93C5FD"
        />
        {/* Silhouette Edge/Rim Backlight */}
        <directionalLight
          position={[0, 18, -16]}
          intensity={2.4}
          color="#FFFFFF"
        />
        {/* Soft Floor Upward Bounce */}
        <directionalLight
          position={[0, -4, 10]}
          intensity={0.7}
          color="#E2E8F0"
        />

        {/* Station Spotlights */}
        {[-6, 0, 6].map((sx, i) => (
          <spotLight
            key={`spot-${i}`}
            position={[sx, 6.5, 1.5]}
            target-position={[sx, 0, 0]}
            intensity={1.2}
            angle={0.65}
            penumbra={0.8}
            color="#F8FAFC"
          />
        ))}

        {/* Factory Floor Grid with Clean Contrast */}
        <Grid
          position={[0, 0, 0]}
          args={[48, 48]}
          cellSize={1}
          cellThickness={0.9}
          cellColor="#1E293B"
          sectionSize={5}
          sectionThickness={1.4}
          sectionColor="#334155"
          fadeDistance={38}
          fadeStrength={1.5}
        />

        {/* Factory Environment: Safety Markings & Perimeter Railings */}
        <group position={[0, 0, 0]}>
          {/* Station Operating Envelope Demarcation Boxes (Safety Yellow) */}
          {[-6, 0, 6].map((bx, i) => (
            <group key={`demarcation-${i}`} position={[bx, 0.012, 0]}>
              {/* Outer boundary frame */}
              <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(4.2, 0.005, 3.8)]} />
                <lineBasicMaterial color="#EAB308" linewidth={1.5} opacity={0.6} transparent />
              </lineSegments>
            </group>
          ))}

          {/* Rear Industrial Safety Stanchion Guard Railing */}
          <group position={[0, 0, -2.4]}>
            {/* Posts */}
            {[-9, -6, -3, 0, 3, 6, 9].map((rx, idx) => (
              <group key={`post-rear-${idx}`} position={[rx, 0.5, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.035, 0.035, 1.0, 12]} />
                  <meshStandardMaterial color="#EAB308" roughness={0.3} />
                </mesh>
                {/* Base flange */}
                <mesh position={[0, -0.48, 0]}>
                  <cylinderGeometry args={[0.08, 0.09, 0.04, 12]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>
              </group>
            ))}
            {/* Horizontal safety crossbars */}
            <mesh position={[0, 0.85, 0]}>
              <boxGeometry args={[18.2, 0.04, 0.04]} />
              <meshStandardMaterial color="#EAB308" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[18.2, 0.04, 0.04]} />
              <meshStandardMaterial color="#EAB308" roughness={0.3} />
            </mesh>
          </group>

          {/* Overhead Lighting Truss Structure (Suspended at y=6.8) */}
          <group position={[0, 6.8, 0]}>
            {/* Main Longitude Rails */}
            <mesh position={[0, 0, -1.2]}>
              <boxGeometry args={[20.0, 0.08, 0.08]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, 1.2]}>
              <boxGeometry args={[20.0, 0.08, 0.08]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            {/* Cross Struts */}
            {[-9, -6, -3, 0, 3, 6, 9].map((tx, idx) => (
              <mesh key={`truss-${idx}`} position={[tx, 0, 0]}>
                <boxGeometry args={[0.06, 0.06, 2.4]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
            ))}
          </group>
        </group>

        <Suspense fallback={null}>
          {/* 3 Procedural Machine Stations */}
          {mergedMachines.map((m) => (
            <ProceduralMachine
              key={m.id}
              machine={m}
              isSelected={m.id === selectedMachineId}
              onSelect={selectMachine}
              onSelectPart={onSelectPart}
              isImpactedDownstream={
                (m.id === "MCH002" || m.id === "MCH003") &&
                liveMachines.some((lm) => lm.id === "MCH001" && lm.severity !== "Normal")
              }
            />
          ))}

          {/* Animated Material Flow & Dependency Links */}
          <DependencyLines machines={mergedMachines} />
        </Suspense>

        {/* Smooth Damped Camera Controls with Presets */}
        <CameraControls
          focusPosition={focusPos}
          resetTrigger={resetTrigger}
          preset={cameraPreset}
        />
      </Canvas>
    </div>
  )
}
