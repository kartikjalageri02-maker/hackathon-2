import React, { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { getSeverityConfig } from "@/lib/severity"

export function ProceduralMachine({
  machine,
  isSelected,
  onSelect,
  isImpactedDownstream = false,
}) {
  const groupRef = useRef()
  const beaconRef = useRef()
  const pointLightRef = useRef()

  // Machine 1 refs
  const xTableRef = useRef()
  const spindleCarriageRef = useRef()
  const toolheadRef = useRef()

  // Machine 2 refs
  const driveRollerRef = useRef()
  const idlerRollerRef = useRef()
  const pallet1Ref = useRef()
  const pallet2Ref = useRef()
  const pallet3Ref = useRef()
  const pallet4Ref = useRef()

  // Machine 3 refs
  const pickArmRef = useRef()
  const outfeedBoxRef = useRef()

  const [isHovered, setIsHovered] = useState(false)

  const severityConfig = getSeverityConfig(machine.severity || "Normal")
  const statusColor = severityConfig.colorHex
  const isEmergency = machine.severity === "Emergency"
  const isAbnormal = machine.severity && machine.severity !== "Normal"

  // Silky smooth mechanical animations driven by high-precision delta time
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // 1. Status Beacon & Underglow pulsing
    if (beaconRef.current) {
      if (isAbnormal) {
        const pulse = 1.0 + 0.3 * Math.sin(t * 7.0)
        beaconRef.current.scale.set(pulse, pulse, pulse)
      } else {
        beaconRef.current.scale.set(1, 1, 1)
      }
    }
    if (pointLightRef.current) {
      pointLightRef.current.intensity = isEmergency
        ? 2.5 + Math.sin(t * 8.0) * 1.5
        : isAbnormal
        ? 1.5 + Math.sin(t * 5.0) * 0.8
        : 0.9
    }

    // 2. Machine 1: Precision CNC Milling Centre (MCH001)
    if (machine.type === "milling_centre") {
      // Continuous high-speed spindle rotation
      if (toolheadRef.current) {
        toolheadRef.current.rotation.y += delta * 24.0
      }
      // Smooth vertical plunging machining stroke
      if (spindleCarriageRef.current) {
        spindleCarriageRef.current.position.y = 1.35 + Math.sin(t * 2.2) * 0.12
      }
      // Smooth horizontal X-axis table feed motion
      if (xTableRef.current) {
        xTableRef.current.position.x = Math.sin(t * 1.4) * 0.32
      }
    }

    // 3. Machine 2: Transfer Conveyor (MCH002)
    if (machine.type === "conveyor") {
      // Smooth rotating rollers
      if (driveRollerRef.current) {
        driveRollerRef.current.rotation.x += delta * 8.0
      }
      if (idlerRollerRef.current) {
        idlerRollerRef.current.rotation.x += delta * 8.0
      }
      // Continuous moving workpiece pallets across conveyor bed (-1.4m to +1.4m)
      const speed = 0.9
      const pallets = [pallet1Ref, pallet2Ref, pallet3Ref, pallet4Ref]
      pallets.forEach((ref, idx) => {
        if (ref.current) {
          const cycle = ((t * speed + idx * 0.75) % 3.0) - 1.5
          ref.current.position.x = cycle
          // Subtle vibration during movement
          ref.current.position.y = 1.05 + Math.sin(t * 30.0 + idx) * 0.002
        }
      })
    }

    // 4. Machine 3: Carton Packaging Machine (MCH003)
    if (machine.type === "packaging") {
      // Smooth articulated 2-axis pick-and-place suction arm
      if (pickArmRef.current) {
        pickArmRef.current.position.x = Math.sin(t * 2.0) * 0.36
        pickArmRef.current.position.y = 1.85 + Math.cos(t * 2.0) * 0.16
        pickArmRef.current.rotation.z = Math.sin(t * 2.0) * 0.12
      }
      // Smooth exit box movement on outfeed chute
      if (outfeedBoxRef.current) {
        const boxCycle = ((t * 0.6) % 1.6)
        outfeedBoxRef.current.position.x = 1.1 + boxCycle * 0.4
        outfeedBoxRef.current.position.y = 1.0 - boxCycle * 0.1
      }
    }
  })

  const { x = 0, y = 0, z = 0 } = machine.position || {}
  const type = machine.type

  // Machine color themes: high-visibility modern industrial finishes
  const bedColor = isSelected ? "#3B4758" : isHovered ? "#334155" : "#243042"
  const frameColor = isSelected ? "#475569" : "#334155"
  const metallicTrim = "#CBD5E1"
  const safetyBlue = "#2563EB"
  const safetyYellow = "#EAB308"

  return (
    <group
      ref={groupRef}
      position={[x, y, z]}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(machine.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = "pointer"
        setIsHovered(true)
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default"
        setIsHovered(false)
      }}
    >
      {/* Station Ground Pedestal Anchor Plinth */}
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[2.2, 2.3, 0.03, 36]} />
        <meshStandardMaterial
          color={isSelected ? "#1E293B" : "#131822"}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Downstream Impact Hazard Floor Ring */}
      {isImpactedDownstream && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[2.35, 2.65, 36]} />
          <meshBasicMaterial color="#F59E0B" opacity={0.8} transparent />
        </mesh>
      )}

      {/* Selected Machine Bright Floor Focus Ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[2.7, 2.9, 36]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.95} transparent />
        </mesh>
      )}

      {/* ============================================================ */}
      {/* 1. PRECISION CNC MILLING CENTRE (MCH001)                     */}
      {/* ============================================================ */}
      {type === "milling_centre" && (
        <group>
          {/* Heavy mineral cast bed (Cast steel, high contrast) */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[2.6, 0.9, 2.2]} />
            <meshStandardMaterial
              color={bedColor}
              roughness={0.4}
              metalness={0.5}
            />
          </mesh>

          {/* Machine Y-axis Base Guide Rails (Polished chrome) */}
          <mesh position={[0, 0.93, -0.45]}>
            <boxGeometry args={[2.4, 0.06, 0.16]} />
            <meshStandardMaterial color={metallicTrim} metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.93, 0.45]}>
            <boxGeometry args={[2.4, 0.06, 0.16]} />
            <meshStandardMaterial color={metallicTrim} metalness={0.9} roughness={0.15} />
          </mesh>

          {/* Moving X/Y Workpiece T-slot Fixture Table */}
          <group ref={xTableRef} position={[0, 1.0, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.5, 0.12, 1.2]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.75} roughness={0.25} />
            </mesh>
            {/* Machined aluminum billet workpiece */}
            <mesh position={[0, 0.14, 0]}>
              <boxGeometry args={[0.55, 0.18, 0.55]} />
              <meshStandardMaterial color="#F1F5F9" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>

          {/* Massive Vertical Stator Column (Slate industrial tower) */}
          <mesh position={[-0.8, 1.8, 0]}>
            <boxGeometry args={[0.9, 1.8, 1.8]} />
            <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.4} />
          </mesh>

          {/* Vertical Precision Column Ways */}
          <mesh position={[-0.34, 1.8, -0.3]}>
            <boxGeometry args={[0.04, 1.7, 0.1]} />
            <meshStandardMaterial color={metallicTrim} metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[-0.34, 1.8, 0.3]}>
            <boxGeometry args={[0.04, 1.7, 0.1]} />
            <meshStandardMaterial color={metallicTrim} metalness={0.9} roughness={0.15} />
          </mesh>

          {/* Spindle Carriage & Moving Toolhead */}
          <group ref={spindleCarriageRef} position={[0, 1.35, 0]}>
            {/* Spindle Housing (Vibrant industrial blue) */}
            <mesh position={[0, 0.55, 0]}>
              <boxGeometry args={[0.7, 0.8, 0.7]} />
              <meshStandardMaterial
                color={safetyBlue}
                metalness={0.6}
                roughness={0.3}
              />
            </mesh>
            {/* Coolant manifold ring */}
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.08, 20]} />
              <meshStandardMaterial color="#38BDF8" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* High speed Spindle Nose */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.16, 0.14, 0.24, 24]} />
              <meshStandardMaterial color={metallicTrim} metalness={0.95} roughness={0.1} />
            </mesh>

            {/* Rotating Carbide Cutting Tool */}
            <group ref={toolheadRef} position={[0, -0.08, 0]}>
              <mesh>
                <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
                <meshStandardMaterial color="#FFFFFF" metalness={0.98} roughness={0.08} />
              </mesh>
              {/* Glowing coolant tip spark */}
              <mesh position={[0, -0.1, 0]}>
                <sphereGeometry args={[0.035, 12, 12]} />
                <meshStandardMaterial
                  color="#38BDF8"
                  emissive="#38BDF8"
                  emissiveIntensity={1.8}
                />
              </mesh>
            </group>
          </group>

          {/* Crystal-Clear Acrylic Safety Shield with High Visibility Struts */}
          <mesh position={[0.3, 1.5, 0]}>
            <boxGeometry args={[1.8, 1.3, 1.9]} />
            <meshPhysicalMaterial
              color="#93C5FD"
              transparent
              opacity={0.22}
              roughness={0.05}
              transmission={0.85}
              thickness={0.4}
            />
          </mesh>
          {/* Machine frame structural borders */}
          <mesh position={[0.3, 2.15, 0]}>
            <boxGeometry args={[1.82, 0.06, 1.92]} />
            <meshStandardMaterial color={safetyBlue} metalness={0.5} roughness={0.3} />
          </mesh>

          {/* CNC Operator Control Pendant Console */}
          <group position={[1.25, 1.5, 1.0]}>
            <mesh position={[0, 0, 0]} rotation={[0, -0.4, 0]}>
              <boxGeometry args={[0.36, 0.48, 0.08]} />
              <meshStandardMaterial color="#1E293B" metalness={0.6} />
            </mesh>
            <mesh position={[0, 0, 0.046]} rotation={[0, -0.4, 0]}>
              <planeGeometry args={[0.3, 0.4]} />
              <meshStandardMaterial
                color="#0284C7"
                emissive="#0284C7"
                emissiveIntensity={1.2}
              />
            </mesh>
          </group>
        </group>
      )}

      {/* ============================================================ */}
      {/* 2. TRANSFER CONVEYOR (MCH002)                                */}
      {/* ============================================================ */}
      {type === "conveyor" && (
        <group>
          {/* Heavy Structural Steel Support Legs */}
          {[-1.4, 1.4].map((lx) =>
            [-0.5, 0.5].map((lz) => (
              <group key={`leg-${lx}-${lz}`} position={[lx, 0.45, lz]}>
                <mesh>
                  <boxGeometry args={[0.12, 0.9, 0.12]} />
                  <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Leveling foot plate */}
                <mesh position={[0, -0.44, 0]}>
                  <cylinderGeometry args={[0.1, 0.12, 0.04, 16]} />
                  <meshStandardMaterial color={metallicTrim} metalness={0.9} />
                </mesh>
              </group>
            ))
          )}

          {/* Lower Structural Cross Braces */}
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[2.8, 0.06, 0.9]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>

          {/* Conveyor Bed Aluminum Side Frame Channels */}
          <mesh position={[0, 0.9, -0.55]}>
            <boxGeometry args={[3.2, 0.18, 0.12]} />
            <meshStandardMaterial color={metallicTrim} metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.9, 0.55]}>
            <boxGeometry args={[3.2, 0.18, 0.12]} />
            <meshStandardMaterial color={metallicTrim} metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Safety Hazard Warning Accent Stripes */}
          <mesh position={[0, 0.98, -0.57]}>
            <boxGeometry args={[3.1, 0.04, 0.02]} />
            <meshStandardMaterial color={safetyYellow} metalness={0.3} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.98, 0.57]}>
            <boxGeometry args={[3.1, 0.04, 0.02]} />
            <meshStandardMaterial color={safetyYellow} metalness={0.3} roughness={0.4} />
          </mesh>

          {/* Textured Rubber Conveyor Belt Bed */}
          <mesh position={[0, 0.96, 0]}>
            <boxGeometry args={[3.0, 0.04, 0.98]} />
            <meshStandardMaterial color="#1E293B" roughness={0.9} />
          </mesh>

          {/* Polished Rotating Drive Roller (Head Pulley) */}
          <mesh ref={driveRollerRef} position={[1.45, 0.93, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.98, 24]} />
            <meshStandardMaterial color={metallicTrim} metalness={0.95} roughness={0.15} />
          </mesh>

          {/* Rotating Idler Roller (Tail Pulley) */}
          <mesh ref={idlerRollerRef} position={[-1.45, 0.93, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.98, 24]} />
            <meshStandardMaterial color={metallicTrim} metalness={0.95} roughness={0.15} />
          </mesh>

          {/* Geared Electric Drive Motor (Mounted at outfeed) */}
          <mesh position={[1.5, 0.86, 0.76]}>
            <cylinderGeometry args={[0.18, 0.18, 0.44, 20]} />
            <meshStandardMaterial color={safetyBlue} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[1.5, 0.86, 0.48]}>
            <boxGeometry args={[0.3, 0.3, 0.2]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>

          {/* 4 Moving Workpiece Pallets Seamlessly Traveling Across Belt */}
          {[pallet1Ref, pallet2Ref, pallet3Ref, pallet4Ref].map((pRef, idx) => (
            <group key={`pallet-${idx}`} ref={pRef} position={[0, 1.05, 0]}>
              {/* Pallet base */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.42, 0.06, 0.42]} />
                <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.2} />
              </mesh>
              {/* Machined component payload */}
              <mesh position={[0, 0.08, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 0.12, 16]} />
                <meshStandardMaterial color="#F1F5F9" metalness={0.95} roughness={0.1} />
              </mesh>
            </group>
          ))}

          {/* Optical Laser Alignment Beam Sensor Eyes */}
          <mesh position={[0, 1.15, -0.6]}>
            <boxGeometry args={[0.09, 0.16, 0.09]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.8} />
          </mesh>
          <mesh position={[0, 1.15, 0.6]}>
            <boxGeometry args={[0.09, 0.16, 0.09]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={1.8} />
          </mesh>
          {/* Subtle glowing laser beam across belt */}
          <mesh position={[0, 1.15, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 1.18, 8]} />
            <meshBasicMaterial color="#EF4444" opacity={0.6} transparent />
          </mesh>
        </group>
      )}

      {/* ============================================================ */}
      {/* 3. CARTON PACKAGING MACHINE (MCH003)                         */}
      {/* ============================================================ */}
      {type === "packaging" && (
        <group>
          {/* Main Enclosed Machinery Cabinet (Modern light industrial grey) */}
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[2.4, 1.4, 2.0]} />
            <meshStandardMaterial
              color={frameColor}
              roughness={0.4}
              metalness={0.4}
            />
          </mesh>

          {/* Stainless Steel Service Inspection Access Panels */}
          <mesh position={[-0.45, 0.7, 1.01]}>
            <planeGeometry args={[0.7, 1.0]} />
            <meshStandardMaterial color={metallicTrim} metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0.45, 0.7, 1.01]}>
            <planeGeometry args={[0.7, 1.0]} />
            <meshStandardMaterial color={metallicTrim} metalness={0.85} roughness={0.2} />
          </mesh>

          {/* Upper Machine Gantry Housing Frame */}
          <mesh position={[0, 1.9, 0]}>
            <boxGeometry args={[2.2, 1.0, 1.8]} />
            <meshStandardMaterial color={bedColor} roughness={0.5} metalness={0.5} />
          </mesh>

          {/* Clear Viewing Window into Folding Chamber */}
          <mesh position={[0, 1.85, 0.92]}>
            <planeGeometry args={[1.6, 0.7]} />
            <meshPhysicalMaterial
              color="#93C5FD"
              transparent
              opacity={0.35}
              roughness={0.08}
              transmission={0.8}
            />
          </mesh>
          {/* Window illumination glow inside packaging chamber */}
          <pointLight position={[0, 1.8, 0]} color="#FEF08A" intensity={0.6} distance={2.5} />

          {/* Carton Blank Feeder Magazine (Angled Chute on input side) */}
          <mesh position={[-1.25, 1.6, 0]} rotation={[0, 0, -0.45]}>
            <boxGeometry args={[0.9, 0.12, 0.8]} />
            <meshStandardMaterial color={safetyYellow} roughness={0.4} />
          </mesh>

          {/* Stack of Flat Corrugated Kraft Carton Blanks */}
          <mesh position={[-1.2, 1.76, 0]} rotation={[0, 0, -0.45]}>
            <boxGeometry args={[0.72, 0.28, 0.72]} />
            <meshStandardMaterial color="#D97706" roughness={0.9} />
          </mesh>

          {/* Articulated Vacuum Pick-and-Place Robotic Arm */}
          <group ref={pickArmRef} position={[0, 1.85, 0]}>
            {/* Telescopic Pneumatic Piston */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.65, 16]} />
              <meshStandardMaterial color={metallicTrim} metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Suction Manifold Plate */}
            <mesh position={[0, -0.36, 0]}>
              <boxGeometry args={[0.52, 0.06, 0.52]} />
              <meshStandardMaterial color="#1E293B" metalness={0.7} />
            </mesh>
            {/* 4 High-Grip Amber Rubber Suction Cups */}
            {[-0.16, 0.16].map((sx) =>
              [-0.16, 0.16].map((sz) => (
                <mesh key={`cup-${sx}-${sz}`} position={[sx, -0.42, sz]}>
                  <cylinderGeometry args={[0.045, 0.065, 0.08, 12]} />
                  <meshStandardMaterial color="#F59E0B" roughness={0.6} />
                </mesh>
              ))
            )}
          </group>

          {/* Finished Carton Outfeed Gravity Roller Chute */}
          <mesh position={[1.35, 0.8, 0]} rotation={[0, 0, -0.25]}>
            <boxGeometry args={[0.75, 0.06, 0.75]} />
            <meshStandardMaterial color={metallicTrim} metalness={0.8} />
          </mesh>

          {/* Packed Corrugated Box Sliding on Outfeed */}
          <mesh ref={outfeedBoxRef} position={[1.35, 0.98, 0]}>
            <boxGeometry args={[0.44, 0.36, 0.44]} />
            <meshStandardMaterial color="#D97706" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* ============================================================ */}
      {/* 4. EMISSIVE 3-TIER ANDON STATUS LIGHT TOWER                  */}
      {/* ============================================================ */}
      <group position={[type === "conveyor" ? 1.4 : 1.05, type === "packaging" ? 2.6 : 2.45, 0.75]}>
        {/* Support mast */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 12]} />
          <meshStandardMaterial color={metallicTrim} metalness={0.8} />
        </mesh>

        {/* 3-Tier Light Stack */}
        {/* Top: Red */}
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.09, 16]} />
          <meshStandardMaterial
            color="#EF4444"
            emissive="#EF4444"
            emissiveIntensity={
              machine.severity === "Critical" || machine.severity === "Emergency"
                ? 3.5
                : 0.2
            }
          />
        </mesh>

        {/* Middle: Amber */}
        <mesh position={[0, 0.54, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.09, 16]} />
          <meshStandardMaterial
            color="#F59E0B"
            emissive="#F59E0B"
            emissiveIntensity={machine.severity === "Warning" ? 3.5 : 0.2}
          />
        </mesh>

        {/* Bottom: Green */}
        <mesh ref={beaconRef} position={[0, 0.43, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.09, 16]} />
          <meshStandardMaterial
            color="#10B981"
            emissive="#10B981"
            emissiveIntensity={machine.severity === "Normal" ? 3.0 : 0.2}
          />
        </mesh>

        {/* Point light casting colored ambient bloom onto top hood */}
        <pointLight
          ref={pointLightRef}
          position={[0, 0.55, 0]}
          color={statusColor}
          intensity={0.9}
          distance={3.5}
        />
      </group>

      {/* ============================================================ */}
      {/* 5. FLOATING 3D HTML BEACON BADGE                             */}
      {/* ============================================================ */}
      <Html
        position={[0, type === "packaging" ? 3.05 : 2.8, 0]}
        center
        distanceFactor={17}
        className="pointer-events-none select-none"
      >
        <div
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all duration-300 shadow-2xl ${
            isSelected
              ? "bg-[#181818]/95 border-white ring-2 ring-white/40 scale-105"
              : isAbnormal
              ? "bg-[#181818]/95 border-amber-500 shadow-amber-500/20"
              : "bg-[#181818]/90 border-[#313131] hover:border-[#4B5563]"
          }`}
        >
          {/* Glowing Status Dot */}
          <span
            className="size-2.5 rounded-full shrink-0 transition-transform duration-300"
            style={{
              backgroundColor: statusColor,
              boxShadow: `0 0 8px ${statusColor}`,
            }}
          />

          <div className="flex flex-col text-left leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-white tracking-wide">
                {machine.id}
              </span>
              <span
                className="text-[10px] font-mono font-semibold px-1 py-0.2 rounded"
                style={{
                  color: statusColor,
                  backgroundColor: `${statusColor}22`,
                }}
              >
                {Math.round(machine.health_score || 100)}%
              </span>
            </div>
            <span className="text-[11px] text-[#9B9B9B] truncate max-w-[130px] font-medium mt-0.5">
              {machine.name}
            </span>
          </div>
        </div>
      </Html>
    </group>
  )
}
