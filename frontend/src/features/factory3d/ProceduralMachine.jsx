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
  const chipsRef = useRef()

  // Machine 2 refs
  const driveRollerRef = useRef()
  const idlerRollerRef = useRef()
  const pallet1Ref = useRef()
  const pallet2Ref = useRef()
  const pallet3Ref = useRef()
  const pallet4Ref = useRef()

  // Machine 3 refs
  const pickArmRef = useRef()
  const suctionPistonRef = useRef()
  const outfeedBoxRef = useRef()

  const [isHovered, setIsHovered] = useState(false)

  const severityConfig = getSeverityConfig(machine.severity || "Normal")
  const statusColor = severityConfig.colorHex
  const isEmergency = machine.severity === "Emergency"
  const isAbnormal = machine.severity && machine.severity !== "Normal"

  // Delta-time regulated kinematic animations
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // 1. Status Beacon & Ambient Glow
    if (beaconRef.current) {
      if (isAbnormal) {
        const pulse = 1.0 + 0.35 * Math.sin(t * 7.5)
        beaconRef.current.scale.set(pulse, pulse, pulse)
      } else {
        beaconRef.current.scale.set(1, 1, 1)
      }
    }
    if (pointLightRef.current) {
      pointLightRef.current.intensity = isEmergency
        ? 2.8 + Math.sin(t * 9.0) * 1.6
        : isAbnormal
        ? 1.6 + Math.sin(t * 5.5) * 0.8
        : 0.95
    }

    // 2. Machine 1: Precision CNC Milling Centre (MCH001)
    if (machine.type === "milling_centre") {
      // Continuous high-speed spindle rotation
      if (toolheadRef.current) {
        toolheadRef.current.rotation.y += delta * 26.0
      }
      // Smooth vertical plunging machining cycle
      if (spindleCarriageRef.current) {
        spindleCarriageRef.current.position.y = 1.38 + Math.sin(t * 2.2) * 0.12
      }
      // Smooth horizontal X-axis table feed motion
      if (xTableRef.current) {
        xTableRef.current.position.x = Math.sin(t * 1.4) * 0.34
      }
      // Subtle coolant mist vibration
      if (chipsRef.current) {
        chipsRef.current.rotation.y += delta * 15.0
        chipsRef.current.scale.setScalar(0.9 + 0.2 * Math.sin(t * 20.0))
      }
    }

    // 3. Machine 2: Transfer Conveyor (MCH002)
    if (machine.type === "conveyor") {
      // Smooth rotating rollers
      if (driveRollerRef.current) {
        driveRollerRef.current.rotation.x += delta * 8.5
      }
      if (idlerRollerRef.current) {
        idlerRollerRef.current.rotation.x += delta * 8.5
      }
      // Moving workpiece pallets along conveyor bed
      const speed = 0.95
      const pallets = [pallet1Ref, pallet2Ref, pallet3Ref, pallet4Ref]
      pallets.forEach((ref, idx) => {
        if (ref.current) {
          const cycle = ((t * speed + idx * 0.75) % 3.0) - 1.5
          ref.current.position.x = cycle
          ref.current.position.y = 1.05 + Math.sin(t * 32.0 + idx) * 0.002
        }
      })
    }

    // 4. Machine 3: Carton Packaging Machine (MCH003)
    if (machine.type === "packaging") {
      // Smooth articulated 2-axis pick-and-place suction arm
      if (pickArmRef.current) {
        pickArmRef.current.position.x = Math.sin(t * 2.1) * 0.38
        pickArmRef.current.position.y = 1.88 + Math.cos(t * 2.1) * 0.16
        pickArmRef.current.rotation.z = Math.sin(t * 2.1) * 0.14
      }
      if (suctionPistonRef.current) {
        suctionPistonRef.current.position.y = -0.15 + Math.sin(t * 4.2) * 0.04
      }
      // Smooth exit box movement on gravity outfeed chute
      if (outfeedBoxRef.current) {
        const boxCycle = ((t * 0.65) % 1.5)
        outfeedBoxRef.current.position.x = 1.12 + boxCycle * 0.42
        outfeedBoxRef.current.position.y = 1.02 - boxCycle * 0.12
      }
    }
  })

  const { x = 0, y = 0, z = 0 } = machine.position || {}
  const type = machine.type

  // Professional industrial material palette
  const bedColor = isSelected ? "#3B4758" : isHovered ? "#334155" : "#243042"
  const frameColor = isSelected ? "#475569" : "#2E3A4B"
  const darkCast = "#1E2633"
  const chromeSteel = "#E2E8F0"
  const cobaltAccent = "#2563EB"
  const safetyYellow = "#EAB308"
  const darkEnclosure = "#1A222E"

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
      {/* Heavy Industrial Foundation Pedestal & Corner Anchor Flanges */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[2.3, 2.4, 0.04, 40]} />
        <meshStandardMaterial
          color={isSelected ? "#1E293B" : "#131822"}
          roughness={0.65}
          metalness={0.4}
        />
      </mesh>
      {/* Flange chamfer rim */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[2.22, 2.22, 0.01, 40]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Downstream Impact Alert Floor Ring */}
      {isImpactedDownstream && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
          <ringGeometry args={[2.42, 2.7, 40]} />
          <meshBasicMaterial color="#F59E0B" opacity={0.8} transparent />
        </mesh>
      )}

      {/* Selected Machine Precision Floor Halo */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[2.75, 2.95, 40]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.95} transparent />
        </mesh>
      )}

      {/* ============================================================ */}
      {/* 1. PRECISION CNC MILLING CENTRE (MCH001)                     */}
      {/* ============================================================ */}
      {type === "milling_centre" && (
        <group>
          {/* Main Vibration-Damped Cast Bed */}
          <mesh position={[0, 0.46, 0]}>
            <boxGeometry args={[2.6, 0.88, 2.2]} />
            <meshStandardMaterial color={bedColor} roughness={0.4} metalness={0.55} />
          </mesh>

          {/* Heavy Cast-Iron Foundation Base Trim */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[2.75, 0.16, 2.35]} />
            <meshStandardMaterial color={darkCast} roughness={0.6} metalness={0.5} />
          </mesh>

          {/* Machine Y-Axis Precision Ground Box Ways */}
          <mesh position={[0, 0.93, -0.46]}>
            <boxGeometry args={[2.42, 0.06, 0.16]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.95} roughness={0.12} />
          </mesh>
          <mesh position={[0, 0.93, 0.46]}>
            <boxGeometry args={[2.42, 0.06, 0.16]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.95} roughness={0.12} />
          </mesh>

          {/* Recirculating Center Ball-Screw Spindle */}
          <mesh position={[0, 0.93, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 2.4, 16]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Moving X/Y Workpiece T-Slot Fixture Table */}
          <group ref={xTableRef} position={[0, 1.01, 0]}>
            {/* Hardened T-slot table top */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.55, 0.12, 1.25]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Precision ground T-slots */}
            {[-0.3, 0, 0.3].map((tz, i) => (
              <mesh key={`tslot-${i}`} position={[0, 0.062, tz]}>
                <boxGeometry args={[1.54, 0.005, 0.04]} />
                <meshStandardMaterial color="#475569" roughness={0.4} />
              </mesh>
            ))}

            {/* Aerospace Aluminum Billet Workpiece */}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.56, 0.18, 0.56]} />
              <meshStandardMaterial color="#F8FAFC" metalness={0.96} roughness={0.08} />
            </mesh>
            {/* Clamping Vise Jaws */}
            <mesh position={[-0.32, 0.12, 0]}>
              <boxGeometry args={[0.08, 0.16, 0.6]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>
            <mesh position={[0.32, 0.12, 0]}>
              <boxGeometry args={[0.08, 0.16, 0.6]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>
          </group>

          {/* Massive Vertical Stator Column (Rear) */}
          <mesh position={[-0.82, 1.82, 0]}>
            <boxGeometry args={[0.92, 1.84, 1.84]} />
            <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.45} />
          </mesh>

          {/* Vertical Precision Z-Axis Column Linear Guide Ways */}
          <mesh position={[-0.35, 1.82, -0.32]}>
            <boxGeometry args={[0.04, 1.76, 0.1]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.95} roughness={0.12} />
          </mesh>
          <mesh position={[-0.35, 1.82, 0.32]}>
            <boxGeometry args={[0.04, 1.76, 0.1]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.95} roughness={0.12} />
          </mesh>

          {/* High-Rigidity Spindle Carriage & Moving Toolhead */}
          <group ref={spindleCarriageRef} position={[0, 1.38, 0]}>
            {/* Spindle Motor Housing with cooling fins */}
            <mesh position={[0, 0.56, 0]}>
              <boxGeometry args={[0.72, 0.82, 0.72]} />
              <meshStandardMaterial color={cobaltAccent} metalness={0.65} roughness={0.25} />
            </mesh>

            {/* Twin Coolant Spray Manifolds */}
            <mesh position={[-0.22, 0.22, 0.24]} rotation={[0.4, 0, -0.3]}>
              <cylinderGeometry args={[0.02, 0.02, 0.16, 12]} />
              <meshStandardMaterial color="#38BDF8" metalness={0.8} />
            </mesh>
            <mesh position={[0.22, 0.22, 0.24]} rotation={[0.4, 0, 0.3]}>
              <cylinderGeometry args={[0.02, 0.02, 0.16, 12]} />
              <meshStandardMaterial color="#38BDF8" metalness={0.8} />
            </mesh>

            {/* High-Speed Cartridge Spindle Nose */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.17, 0.15, 0.26, 28]} />
              <meshStandardMaterial color={chromeSteel} metalness={0.96} roughness={0.08} />
            </mesh>

            {/* Rotating Carbide Cutting Tool & Coolant Vortex */}
            <group ref={toolheadRef} position={[0, -0.09, 0]}>
              <mesh>
                <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
                <meshStandardMaterial color="#FFFFFF" metalness={0.98} roughness={0.05} />
              </mesh>
              {/* Tool Clamping Collar */}
              <mesh position={[0, 0.08, 0]}>
                <cylinderGeometry args={[0.09, 0.11, 0.06, 20]} />
                <meshStandardMaterial color="#475569" metalness={0.9} />
              </mesh>
              {/* Glowing Coolant Mist Particle Center */}
              <group ref={chipsRef} position={[0, -0.1, 0]}>
                <mesh>
                  <sphereGeometry args={[0.045, 12, 12]} />
                  <meshStandardMaterial
                    color="#38BDF8"
                    emissive="#38BDF8"
                    emissiveIntensity={2.0}
                    transparent
                    opacity={0.85}
                  />
                </mesh>
              </group>
            </group>
          </group>

          {/* Polycarbonate Safety Enclosure with Cobalt Frame */}
          <mesh position={[0.3, 1.52, 0]}>
            <boxGeometry args={[1.82, 1.34, 1.94]} />
            <meshPhysicalMaterial
              color="#93C5FD"
              transparent
              opacity={0.22}
              roughness={0.05}
              transmission={0.88}
              thickness={0.4}
            />
          </mesh>
          {/* Top Enclosure Structural Rib */}
          <mesh position={[0.3, 2.2, 0]}>
            <boxGeometry args={[1.85, 0.06, 1.96]} />
            <meshStandardMaterial color={cobaltAccent} metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Stainless Safety Interlock Handle */}
          <mesh position={[1.22, 1.45, 0.35]}>
            <cylinderGeometry args={[0.015, 0.015, 0.28, 12]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.95} />
          </mesh>

          {/* Articulated CNC Touchscreen Operator Console */}
          <group position={[1.28, 1.52, 0.98]}>
            {/* Support Arm */}
            <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.22, 12]} />
              <meshStandardMaterial color={chromeSteel} metalness={0.9} />
            </mesh>
            {/* Screen Bezel */}
            <mesh position={[0, 0, 0]} rotation={[0, -0.42, 0]}>
              <boxGeometry args={[0.38, 0.5, 0.08]} />
              <meshStandardMaterial color="#1E293B" metalness={0.7} />
            </mesh>
            {/* Active Display Panel */}
            <mesh position={[0, 0, 0.046]} rotation={[0, -0.42, 0]}>
              <planeGeometry args={[0.32, 0.42]} />
              <meshStandardMaterial
                color="#0284C7"
                emissive="#0284C7"
                emissiveIntensity={1.3}
              />
            </mesh>
            {/* Emergency Stop Button */}
            <mesh position={[0.12, -0.18, 0.05]} rotation={[0, -0.42, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.03, 16]} />
              <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.2} />
            </mesh>
          </group>
        </group>
      )}

      {/* ============================================================ */}
      {/* 2. TRANSFER CONVEYOR (MCH002)                                */}
      {/* ============================================================ */}
      {type === "conveyor" && (
        <group>
          {/* Welded Heavy Tubular Steel Support Legs */}
          {[-1.4, 1.4].map((lx) =>
            [-0.5, 0.5].map((lz) => (
              <group key={`leg-${lx}-${lz}`} position={[lx, 0.45, lz]}>
                <mesh>
                  <boxGeometry args={[0.12, 0.9, 0.12]} />
                  <meshStandardMaterial color={frameColor} metalness={0.65} roughness={0.3} />
                </mesh>
                {/* Precision Leveling Foot Flange */}
                <mesh position={[0, -0.44, 0]}>
                  <cylinderGeometry args={[0.11, 0.13, 0.04, 20]} />
                  <meshStandardMaterial color={chromeSteel} metalness={0.92} />
                </mesh>
                {/* Diagonal Gusset Bracket */}
                <mesh position={[lx > 0 ? -0.1 : 0.1, 0.35, 0]} rotation={[0, 0, lx > 0 ? 0.6 : -0.6]}>
                  <boxGeometry args={[0.04, 0.22, 0.08]} />
                  <meshStandardMaterial color="#334155" metalness={0.7} />
                </mesh>
              </group>
            ))
          )}

          {/* Lower Rigidity Cross Braces */}
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[2.84, 0.06, 0.92]} />
            <meshStandardMaterial color={darkCast} metalness={0.6} />
          </mesh>

          {/* Heavy Extruded Aluminum Conveyor Bed Side Rails */}
          <mesh position={[0, 0.9, -0.56]}>
            <boxGeometry args={[3.24, 0.18, 0.12]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.85} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.9, 0.56]}>
            <boxGeometry args={[3.24, 0.18, 0.12]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.85} roughness={0.18} />
          </mesh>

          {/* High-Visibility Industrial Safety Yellow Warning Stripes */}
          <mesh position={[0, 0.98, -0.58]}>
            <boxGeometry args={[3.16, 0.04, 0.02]} />
            <meshStandardMaterial color={safetyYellow} metalness={0.3} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.98, 0.58]}>
            <boxGeometry args={[3.16, 0.04, 0.02]} />
            <meshStandardMaterial color={safetyYellow} metalness={0.3} roughness={0.35} />
          </mesh>

          {/* Multi-Ribbed Textured Rubber Conveyor Belt Bed */}
          <mesh position={[0, 0.96, 0]}>
            <boxGeometry args={[3.04, 0.04, 0.98]} />
            <meshStandardMaterial color="#18202F" roughness={0.9} />
          </mesh>

          {/* Crowned Chrome Rotating Drive Roller (Head Pulley) */}
          <mesh ref={driveRollerRef} position={[1.46, 0.93, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.98, 28]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.96} roughness={0.1} />
          </mesh>
          {/* Pillow Block Flange Bearing Head */}
          <mesh position={[1.46, 0.93, 0.56]}>
            <boxGeometry args={[0.22, 0.22, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[1.46, 0.93, -0.56]}>
            <boxGeometry args={[0.22, 0.22, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>

          {/* Rotating Idler Roller (Tail Pulley) */}
          <mesh ref={idlerRollerRef} position={[-1.46, 0.93, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.98, 28]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.96} roughness={0.1} />
          </mesh>

          {/* Geared Electric Conveyor Drive Motor */}
          <mesh position={[1.52, 0.86, 0.78]}>
            <cylinderGeometry args={[0.18, 0.18, 0.46, 24]} />
            <meshStandardMaterial color={cobaltAccent} metalness={0.65} roughness={0.25} />
          </mesh>
          {/* Motor Heat Dissipation Fins */}
          {[-0.1, 0, 0.1].map((fy, i) => (
            <mesh key={`fin-${i}`} position={[1.52, 0.86 + fy, 0.78]}>
              <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
              <meshStandardMaterial color="#1D4ED8" metalness={0.7} />
            </mesh>
          ))}
          {/* IP65 Electrical Conduit Junction Box */}
          <mesh position={[1.52, 0.86, 0.49]}>
            <boxGeometry args={[0.3, 0.3, 0.2]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>

          {/* 4 Continuously Moving Workpiece Pallets Across Belt */}
          {[pallet1Ref, pallet2Ref, pallet3Ref, pallet4Ref].map((pRef, idx) => (
            <group key={`pallet-${idx}`} ref={pRef} position={[0, 1.05, 0]}>
              {/* Precision Pallet Base */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.42, 0.06, 0.42]} />
                <meshStandardMaterial color={chromeSteel} metalness={0.88} roughness={0.18} />
              </mesh>
              {/* Machined Component Payload */}
              <mesh position={[0, 0.09, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 0.12, 20]} />
                <meshStandardMaterial color="#F8FAFC" metalness={0.95} roughness={0.08} />
              </mesh>
            </group>
          ))}

          {/* Photoelectric Sensor Eyes with Mounting Brackets */}
          <mesh position={[0, 1.15, -0.6]}>
            <boxGeometry args={[0.09, 0.16, 0.09]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.9} />
          </mesh>
          <mesh position={[0, 1.15, 0.6]}>
            <boxGeometry args={[0.09, 0.16, 0.09]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={1.9} />
          </mesh>
          {/* Active Optical Alignment Laser Beam */}
          <mesh position={[0, 1.15, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.007, 0.007, 1.18, 8]} />
            <meshBasicMaterial color="#EF4444" opacity={0.65} transparent />
          </mesh>
        </group>
      )}

      {/* ============================================================ */}
      {/* 3. CARTON PACKAGING MACHINE (MCH003)                         */}
      {/* ============================================================ */}
      {type === "packaging" && (
        <group>
          {/* Main Enclosed Machinery Cabinet */}
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[2.42, 1.42, 2.02]} />
            <meshStandardMaterial color={darkEnclosure} roughness={0.4} metalness={0.45} />
          </mesh>

          {/* Stainless Steel Service Inspection Access Panels with Latches */}
          <mesh position={[-0.45, 0.72, 1.02]}>
            <planeGeometry args={[0.72, 1.02]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.88} roughness={0.18} />
          </mesh>
          <mesh position={[0.45, 0.72, 1.02]}>
            <planeGeometry args={[0.72, 1.02]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.88} roughness={0.18} />
          </mesh>
          {/* Recessed Door Latches */}
          <mesh position={[-0.14, 0.72, 1.03]}>
            <boxGeometry args={[0.04, 0.1, 0.02]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} />
          </mesh>
          <mesh position={[0.14, 0.72, 1.03]}>
            <boxGeometry args={[0.04, 0.1, 0.02]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} />
          </mesh>

          {/* Overhead Machine Gantry Housing Frame */}
          <mesh position={[0, 1.92, 0]}>
            <boxGeometry args={[2.22, 1.02, 1.82]} />
            <meshStandardMaterial color={bedColor} roughness={0.45} metalness={0.5} />
          </mesh>

          {/* Clear Safety Viewing Window into Carton Sealing Chamber */}
          <mesh position={[0, 1.86, 0.93]}>
            <planeGeometry args={[1.62, 0.72]} />
            <meshPhysicalMaterial
              color="#93C5FD"
              transparent
              opacity={0.32}
              roughness={0.06}
              transmission={0.85}
            />
          </mesh>
          {/* Interior Sealing Chamber Warm Illumination */}
          <pointLight position={[0, 1.82, 0]} color="#FEF08A" intensity={0.7} distance={2.6} />

          {/* Carton Blank Magazine Chute (Angled Input Guide) */}
          <mesh position={[-1.26, 1.62, 0]} rotation={[0, 0, -0.46]}>
            <boxGeometry args={[0.92, 0.12, 0.82]} />
            <meshStandardMaterial color={safetyYellow} roughness={0.35} />
          </mesh>

          {/* Stack of Die-Cut Corrugated Kraft Carton Blanks */}
          <mesh position={[-1.22, 1.78, 0]} rotation={[0, 0, -0.46]}>
            <boxGeometry args={[0.74, 0.28, 0.74]} />
            <meshStandardMaterial color="#D97706" roughness={0.9} />
          </mesh>

          {/* Articulated Vacuum Pick-and-Place Gantry Arm */}
          <group ref={pickArmRef} position={[0, 1.88, 0]}>
            {/* Telescopic Pneumatic Chrome Piston */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.68, 20]} />
              <meshStandardMaterial color={chromeSteel} metalness={0.96} roughness={0.08} />
            </mesh>
            {/* Telescopic Extension Rod */}
            <group ref={suctionPistonRef} position={[0, 0, 0]}>
              {/* Suction Manifold Plate */}
              <mesh position={[0, -0.38, 0]}>
                <boxGeometry args={[0.54, 0.06, 0.54]} />
                <meshStandardMaterial color="#1E293B" metalness={0.75} />
              </mesh>
              {/* 4 High-Grip Amber Vacuum Suction Cups */}
              {[-0.17, 0.17].map((sx) =>
                [-0.17, 0.17].map((sz) => (
                  <mesh key={`cup-${sx}-${sz}`} position={[sx, -0.44, sz]}>
                    <cylinderGeometry args={[0.045, 0.068, 0.08, 16]} />
                    <meshStandardMaterial color="#F59E0B" roughness={0.6} />
                  </mesh>
                ))
              )}
            </group>
          </group>

          {/* Finished Carton Gravity Roller Outfeed Chute */}
          <mesh position={[1.36, 0.82, 0]} rotation={[0, 0, -0.26]}>
            <boxGeometry args={[0.76, 0.06, 0.76]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.82} />
          </mesh>
          {/* Individual outfeed rollers */}
          {[-0.2, 0, 0.2].map((rx, i) => (
            <mesh key={`roller-${i}`} position={[1.36 + rx * 0.8, 0.85 - rx * 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.72, 16]} />
              <meshStandardMaterial color={chromeSteel} metalness={0.95} />
            </mesh>
          ))}

          {/* Sealed Corrugated Shipping Carton Box on Outfeed */}
          <mesh ref={outfeedBoxRef} position={[1.36, 1.0, 0]}>
            <boxGeometry args={[0.45, 0.36, 0.45]} />
            <meshStandardMaterial color="#D97706" roughness={0.88} />
          </mesh>
        </group>
      )}

      {/* ============================================================ */}
      {/* 4. EMISSIVE 3-TIER ANDON STATUS LIGHT TOWER                  */}
      {/* ============================================================ */}
      <group position={[type === "conveyor" ? 1.42 : 1.08, type === "packaging" ? 2.65 : 2.48, 0.78]}>
        {/* Support Mast Pole */}
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.52, 16]} />
          <meshStandardMaterial color={chromeSteel} metalness={0.85} />
        </mesh>

        {/* 3-Tier Stack Lenses */}
        {/* Top: Red (Critical / Emergency) */}
        <mesh position={[0, 0.67, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.09, 20]} />
          <meshStandardMaterial
            color="#EF4444"
            emissive="#EF4444"
            emissiveIntensity={
              machine.severity === "Critical" || machine.severity === "Emergency"
                ? 3.6
                : 0.25
            }
          />
        </mesh>

        {/* Middle: Amber (Warning / Degraded) */}
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.09, 20]} />
          <meshStandardMaterial
            color="#F59E0B"
            emissive="#F59E0B"
            emissiveIntensity={machine.severity === "Warning" ? 3.6 : 0.25}
          />
        </mesh>

        {/* Bottom: Green (Normal) */}
        <mesh ref={beaconRef} position={[0, 0.43, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.09, 20]} />
          <meshStandardMaterial
            color="#10B981"
            emissive="#10B981"
            emissiveIntensity={machine.severity === "Normal" ? 3.2 : 0.25}
          />
        </mesh>

        {/* Point light casting colored ambient bloom onto machine hood */}
        <pointLight
          ref={pointLightRef}
          position={[0, 0.56, 0]}
          color={statusColor}
          intensity={0.95}
          distance={3.6}
        />
      </group>

      {/* ============================================================ */}
      {/* 5. FLOATING 3D HTML BEACON BADGE                             */}
      {/* ============================================================ */}
      <Html
        position={[0, type === "packaging" ? 3.12 : 2.85, 0]}
        center
        distanceFactor={16.5}
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
              boxShadow: `0 0 10px ${statusColor}`,
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
