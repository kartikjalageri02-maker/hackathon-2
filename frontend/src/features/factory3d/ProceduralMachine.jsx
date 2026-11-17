import React, { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { getSeverityConfig } from "@/lib/severity"
import {
  Cpu,
  Info,
  CheckCircle,
  WarningCircle,
  X,
  Gauge,
  Thermometer,
  Waveform,
} from "@phosphor-icons/react"

export function ProceduralMachine({
  machine,
  isSelected,
  onSelect,
  isImpactedDownstream = false,
  onSelectPart = null,
  activePartId = null,
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
  const [touchedPart, setTouchedPart] = useState(null)

  const severityConfig = getSeverityConfig(machine.severity || "Normal")
  const statusColor = severityConfig.colorHex
  const isEmergency = machine.severity === "Emergency"
  const isAbnormal = machine.severity && machine.severity !== "Normal"

  // Handler for touching / clicking any specific sub-component
  const handlePartTouch = (e, partData) => {
    e.stopPropagation()
    const partInfo = {
      machineId: machine.id,
      machineName: machine.name,
      ...partData,
    }
    setTouchedPart(partInfo)
    if (onSelectPart) {
      onSelectPart(partInfo)
    }
  }

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
      if (toolheadRef.current) {
        toolheadRef.current.rotation.y += delta * 26.0
      }
      if (spindleCarriageRef.current) {
        spindleCarriageRef.current.position.y = 1.38 + Math.sin(t * 2.2) * 0.12
      }
      if (xTableRef.current) {
        xTableRef.current.position.x = Math.sin(t * 1.4) * 0.34
      }
      if (chipsRef.current) {
        chipsRef.current.rotation.y += delta * 15.0
        chipsRef.current.scale.setScalar(0.9 + 0.2 * Math.sin(t * 20.0))
      }
    }

    // 3. Machine 2: Transfer Conveyor (MCH002)
    if (machine.type === "conveyor") {
      if (driveRollerRef.current) {
        driveRollerRef.current.rotation.x += delta * 8.5
      }
      if (idlerRollerRef.current) {
        idlerRollerRef.current.rotation.x += delta * 8.5
      }
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
      if (pickArmRef.current) {
        pickArmRef.current.position.x = Math.sin(t * 2.1) * 0.38
        pickArmRef.current.position.y = 1.88 + Math.cos(t * 2.1) * 0.16
        pickArmRef.current.rotation.z = Math.sin(t * 2.1) * 0.14
      }
      if (suctionPistonRef.current) {
        suctionPistonRef.current.position.y = -0.15 + Math.sin(t * 4.2) * 0.04
      }
      if (outfeedBoxRef.current) {
        const boxCycle = ((t * 0.65) % 1.5)
        outfeedBoxRef.current.position.x = 1.12 + boxCycle * 0.42
        outfeedBoxRef.current.position.y = 1.02 - boxCycle * 0.12
      }
    }
  })

  const { x = 0, y = 0, z = 0 } = machine.position || {}
  const type = machine.type

  // Clean industrial Black & Grey palette with metallic finishes
  const bedColor = isSelected ? "#333D4B" : isHovered ? "#2D3748" : "#1E2530"
  const frameColor = isSelected ? "#3D4857" : "#28323F"
  const darkCast = "#121720"
  const chromeSteel = "#DDE3EA"
  const cobaltAccent = "#2563EB"
  const safetyYellow = "#EAB308"
  const darkEnclosure = "#161D26"

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
      {/* Heavy Industrial Foundation Pedestal & Anchor Flanges */}
      <mesh
        position={[0, 0.02, 0]}
        onClick={(e) =>
          handlePartTouch(e, {
            id: "foundation_bed",
            name: "Vibration-Damped Foundation Plinth",
            telemetry: "Anchor Torque: 320 Nm • Level < 0.01 mm/m",
            spec: "Cast Meehanite Iron Base with Anti-Vibration Pads",
            health: 100,
            status: "Optimal",
            anchor: [0, 0.6, 0],
          })
        }
      >
        <cylinderGeometry args={[2.3, 2.4, 0.04, 40]} />
        <meshStandardMaterial
          color={isSelected ? "#1E293B" : "#111620"}
          roughness={0.65}
          metalness={0.4}
        />
      </mesh>
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

      {/* Selected Machine Floor Halo */}
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
          {/* Main Vibration-Damped Cast Machine Bed */}
          <mesh
            position={[0, 0.46, 0]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "machine_bed",
                name: "Cast Machine Bed & Sump",
                telemetry: "Thermal Expansion: Nominal • Coolant Flow 45 L/min",
                spec: "High-Rigidity Meehanite Cast Iron Monoblock",
                health: 99,
                status: "Optimal",
                anchor: [0, 0.9, 0],
              })
            }
          >
            <boxGeometry args={[2.6, 0.88, 2.2]} />
            <meshStandardMaterial color={bedColor} roughness={0.4} metalness={0.55} />
          </mesh>

          {/* Machine Y-Axis Precision Ground Box Ways */}
          <mesh
            position={[0, 0.93, -0.46]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "linear_guide",
                name: "Y-Axis Linear Box Guideways",
                telemetry: "Alignment Dev: 0.02 mm • Lubrication: OK",
                spec: "THK High-Preload Recirculating Roller Guideways",
                health: 98,
                status: "Optimal",
                anchor: [0, 1.3, -0.46],
              })
            }
          >
            <boxGeometry args={[2.42, 0.06, 0.16]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.95} roughness={0.12} />
          </mesh>
          <mesh
            position={[0, 0.93, 0.46]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "linear_guide",
                name: "Y-Axis Linear Box Guideways",
                telemetry: "Alignment Dev: 0.02 mm • Lubrication: OK",
                spec: "THK High-Preload Recirculating Roller Guideways",
                health: 98,
                status: "Optimal",
                anchor: [0, 1.3, 0.46],
              })
            }
          >
            <boxGeometry args={[2.42, 0.06, 0.16]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.95} roughness={0.12} />
          </mesh>

          {/* Recirculating Center Ball-Screw Spindle */}
          <mesh
            position={[0, 0.93, 0]}
            rotation={[0, 0, Math.PI / 2]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "ballscrew",
                name: "Z-Axis Recirculating Ground Ball Screw",
                telemetry: "Micro-Movement: 4.5 µm • Backlash < 2 µm",
                spec: "NSK Ground Ball Screw (Class C3, Pitch 10mm)",
                health: 98,
                status: "Optimal",
                anchor: [0, 1.25, 0],
              })
            }
          >
            <cylinderGeometry args={[0.035, 0.035, 2.4, 16]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Moving X/Y Workpiece T-Slot Fixture Table */}
          <group ref={xTableRef} position={[0, 1.01, 0]}>
            <mesh
              position={[0, 0, 0]}
              onClick={(e) =>
                handlePartTouch(e, {
                  id: "fixture_table",
                  name: "Precision Ground T-Slot Fixture Table",
                  telemetry: "Clamping Pressure: 24 kN • Flatness 0.005 mm",
                  spec: "Hardened Stainless Steel Precision Table (1550x1250mm)",
                  health: 100,
                  status: "Optimal",
                  anchor: [0, 1.35, 0],
                })
              }
            >
              <boxGeometry args={[1.55, 0.12, 1.25]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Aerospace Aluminum Billet Workpiece */}
            <mesh
              position={[0, 0.15, 0]}
              onClick={(e) =>
                handlePartTouch(e, {
                  id: "workpiece",
                  name: "Machined Workpiece Billet",
                  telemetry: "Tolerance: ±0.008 mm • 6061-T6 Aerospace Alloy",
                  spec: "High-Precision Structural Manifold Component",
                  health: 100,
                  status: "In Process",
                  anchor: [0, 1.5, 0],
                })
              }
            >
              <boxGeometry args={[0.56, 0.18, 0.56]} />
              <meshStandardMaterial color="#F8FAFC" metalness={0.96} roughness={0.08} />
            </mesh>
            {/* Vise Jaws */}
            <mesh position={[-0.32, 0.12, 0]}>
              <boxGeometry args={[0.08, 0.16, 0.6]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>
            <mesh position={[0.32, 0.12, 0]}>
              <boxGeometry args={[0.08, 0.16, 0.6]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>
          </group>

          {/* Vertical Column */}
          <mesh position={[-0.82, 1.82, 0]}>
            <boxGeometry args={[0.92, 1.84, 1.84]} />
            <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.45} />
          </mesh>

          {/* High-Rigidity Spindle Carriage & Moving Toolhead */}
          <group ref={spindleCarriageRef} position={[0, 1.38, 0]}>
            {/* Spindle AC Servo Motor */}
            <mesh
              position={[0, 0.56, 0]}
              onClick={(e) =>
                handlePartTouch(e, {
                  id: "spindle_motor",
                  name: "Main Drive Spindle Motor",
                  telemetry: "Temp: 54.2°C • Current Draw: 14.8 A",
                  spec: "15 kW Synchronous AC Servo (12,000 RPM Max)",
                  health: 96,
                  status: "Optimal",
                  anchor: [0, 2.2, 0],
                })
              }
            >
              <boxGeometry args={[0.72, 0.82, 0.72]} />
              <meshStandardMaterial color={cobaltAccent} metalness={0.65} roughness={0.25} />
            </mesh>

            {/* Spindle Nose & Ceramic Bearings */}
            <mesh
              position={[0, 0.1, 0]}
              onClick={(e) =>
                handlePartTouch(e, {
                  id: "spindle_bearings",
                  name: "High-Speed Spindle Ceramic Bearings",
                  telemetry: "Vib: 1.24 mm/s RMS • Acoustic: 68 dB",
                  spec: "SKF Hybrid Ceramic Angular Contact Pair (Class P4A)",
                  health: 95,
                  status: "Optimal",
                  anchor: [0, 1.65, 0],
                })
              }
            >
              <cylinderGeometry args={[0.17, 0.15, 0.26, 28]} />
              <meshStandardMaterial color={chromeSteel} metalness={0.96} roughness={0.08} />
            </mesh>

            {/* Rotating Carbide Cutting Tool & Toolholder */}
            <group
              ref={toolheadRef}
              position={[0, -0.09, 0]}
              onClick={(e) =>
                handlePartTouch(e, {
                  id: "toolhead",
                  name: "Solid Carbide End Mill & Toolholder",
                  telemetry: "Tool Runout: <0.003 mm • Feed 850 mm/min",
                  spec: "AlTiN Coated Solid Carbide 4-Flute End Mill (Ø12mm)",
                  health: 99,
                  status: "Active Machining",
                  anchor: [0, 1.3, 0],
                })
              }
            >
              <mesh>
                <cylinderGeometry args={[0.04, 0.04, 0.2, 16]} />
                <meshStandardMaterial color="#FFFFFF" metalness={0.98} roughness={0.05} />
              </mesh>
              <mesh position={[0, 0.08, 0]}>
                <cylinderGeometry args={[0.09, 0.11, 0.06, 20]} />
                <meshStandardMaterial color="#475569" metalness={0.9} />
              </mesh>
              {/* Coolant Spark */}
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

          {/* Polycarbonate Safety Enclosure */}
          <mesh
            position={[0.3, 1.52, 0]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "safety_enclosure",
                name: "Interlocked Polycarbonate Enclosure",
                telemetry: "Door State: Closed & Locked • Safety Cat 4",
                spec: "12mm High-Impact Clear Polycarbonate Shielding",
                health: 100,
                status: "Interlocked",
                anchor: [0.3, 2.3, 0],
              })
            }
          >
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

          {/* CNC Operator Console Pendant */}
          <group
            position={[1.28, 1.52, 0.98]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "cnc_controller",
                name: "Touchscreen CNC Industrial Controller",
                telemetry: "Program: O0104 • Coordinate X:0.00 Y:0.00 Z:+12.4",
                spec: "Siemens Sinumerik IP65 Multi-Touch Operator Console",
                health: 100,
                status: "Online",
                anchor: [1.3, 1.9, 1.0],
              })
            }
          >
            <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.22, 12]} />
              <meshStandardMaterial color={chromeSteel} metalness={0.9} />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[0, -0.42, 0]}>
              <boxGeometry args={[0.38, 0.5, 0.08]} />
              <meshStandardMaterial color="#1E293B" metalness={0.7} />
            </mesh>
            <mesh position={[0, 0, 0.046]} rotation={[0, -0.42, 0]}>
              <planeGeometry args={[0.32, 0.42]} />
              <meshStandardMaterial
                color="#0284C7"
                emissive="#0284C7"
                emissiveIntensity={1.3}
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
          {/* Support Legs */}
          {[-1.4, 1.4].map((lx) =>
            [-0.5, 0.5].map((lz) => (
              <group key={`leg-${lx}-${lz}`} position={[lx, 0.45, lz]}>
                <mesh>
                  <boxGeometry args={[0.12, 0.9, 0.12]} />
                  <meshStandardMaterial color={frameColor} metalness={0.65} roughness={0.3} />
                </mesh>
                <mesh position={[0, -0.44, 0]}>
                  <cylinderGeometry args={[0.11, 0.13, 0.04, 20]} />
                  <meshStandardMaterial color={chromeSteel} metalness={0.92} />
                </mesh>
              </group>
            ))
          )}

          {/* Aluminum Side Rails */}
          <mesh position={[0, 0.9, -0.56]}>
            <boxGeometry args={[3.24, 0.18, 0.12]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.85} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.9, 0.56]}>
            <boxGeometry args={[3.24, 0.18, 0.12]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.85} roughness={0.18} />
          </mesh>

          {/* Multi-Ribbed Rubber Conveyor Belt Bed */}
          <mesh
            position={[0, 0.96, 0]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "conveyor_belt",
                name: "Vulcanized Heavy-Duty Conveyor Belt",
                telemetry: "Linear Speed: 0.85 m/s • Current Draw: 14.1 A",
                spec: "Habasit Multi-Ply Synthetic Rubber Transfer Belt",
                health: 98,
                status: "Optimal",
                anchor: [0, 1.25, 0],
              })
            }
          >
            <boxGeometry args={[3.04, 0.04, 0.98]} />
            <meshStandardMaterial color="#18202F" roughness={0.9} />
          </mesh>

          {/* Drive Head Pulley */}
          <mesh
            ref={driveRollerRef}
            position={[1.46, 0.93, 0]}
            rotation={[0, 0, Math.PI / 2]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "head_pulley",
                name: "Crowned Drive Head Pulley & Bearings",
                telemetry: "Vibration: 1.18 mm/s • Grease Level: OK",
                spec: "Precision Turned Pulley with SKF Flange Bearings",
                health: 97,
                status: "Optimal",
                anchor: [1.5, 1.25, 0],
              })
            }
          >
            <cylinderGeometry args={[0.13, 0.13, 0.98, 28]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.96} roughness={0.1} />
          </mesh>

          {/* Geared Electric Conveyor Drive Motor */}
          <mesh
            position={[1.52, 0.86, 0.78]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "conveyor_motor",
                name: "Geared Electric Conveyor Drive Motor",
                telemetry: "Temp: 48.6°C • Current Draw: 14.1 A",
                spec: "Nord Helical-Bevel 3-Phase Electric Gearmotor (1.5 kW)",
                health: 96,
                status: "Optimal",
                anchor: [1.55, 1.3, 0.8],
              })
            }
          >
            <cylinderGeometry args={[0.18, 0.18, 0.46, 24]} />
            <meshStandardMaterial color={cobaltAccent} metalness={0.65} roughness={0.25} />
          </mesh>

          {/* Moving Workpiece Pallets */}
          {[pallet1Ref, pallet2Ref, pallet3Ref, pallet4Ref].map((pRef, idx) => (
            <group
              key={`pallet-${idx}`}
              ref={pRef}
              position={[0, 1.05, 0]}
              onClick={(e) =>
                handlePartTouch(e, {
                  id: `pallet_${idx + 1}`,
                  name: `Machined Fixture Pallet #${idx + 1}`,
                  telemetry: "Weight: 4.8 kg • RFID Tag Verified",
                  spec: "Anodized Tooling Carrier for Transfer Stage",
                  health: 100,
                  status: "In Transit",
                  anchor: [0, 1.35, 0],
                })
              }
            >
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.42, 0.06, 0.42]} />
                <meshStandardMaterial color={chromeSteel} metalness={0.88} roughness={0.18} />
              </mesh>
              <mesh position={[0, 0.09, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 0.12, 20]} />
                <meshStandardMaterial color="#F8FAFC" metalness={0.95} roughness={0.08} />
              </mesh>
            </group>
          ))}

          {/* Optical Through-Beam Sensors */}
          <mesh
            position={[0, 1.15, -0.6]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "photo_eye",
                name: "Optical Through-Beam Sensor Array",
                telemetry: "Alignment Dev: 0.00 mm • Parts Passed: 1,842",
                spec: "Sick Photoelectric Sensor with Visible Red Beam",
                health: 100,
                status: "Aligned",
                anchor: [0, 1.45, 0],
              })
            }
          >
            <boxGeometry args={[0.09, 0.16, 0.09]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.9} />
          </mesh>
          <mesh
            position={[0, 1.15, 0.6]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "photo_eye",
                name: "Optical Through-Beam Sensor Array",
                telemetry: "Alignment Dev: 0.00 mm • Parts Passed: 1,842",
                spec: "Sick Photoelectric Sensor with Visible Red Beam",
                health: 100,
                status: "Aligned",
                anchor: [0, 1.45, 0],
              })
            }
          >
            <boxGeometry args={[0.09, 0.16, 0.09]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={1.9} />
          </mesh>
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
          {/* Main Enclosed Cabinet */}
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[2.42, 1.42, 2.02]} />
            <meshStandardMaterial color={darkEnclosure} roughness={0.4} metalness={0.45} />
          </mesh>

          {/* Stainless Steel Service Panels */}
          <mesh
            position={[-0.45, 0.72, 1.02]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "service_panels",
                name: "Stainless Steel Service Access Panels",
                telemetry: "Interlocks: Engaged • Safety Cat 4",
                spec: "304 Stainless Steel Dual Maintenance Access Doors",
                health: 100,
                status: "Locked",
                anchor: [0, 1.2, 1.05],
              })
            }
          >
            <planeGeometry args={[0.72, 1.02]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.88} roughness={0.18} />
          </mesh>
          <mesh position={[0.45, 0.72, 1.02]}>
            <planeGeometry args={[0.72, 1.02]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.88} roughness={0.18} />
          </mesh>

          {/* Overhead Machine Gantry Housing Frame */}
          <mesh position={[0, 1.92, 0]}>
            <boxGeometry args={[2.22, 1.02, 1.82]} />
            <meshStandardMaterial color={bedColor} roughness={0.45} metalness={0.5} />
          </mesh>

          {/* Clear Safety Viewing Window into Carton Sealing Chamber */}
          <mesh
            position={[0, 1.86, 0.93]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "sealing_chamber",
                name: "Hot-Melt Carton Forming & Sealing Chamber",
                telemetry: "Hot-Melt Temp: 165°C • Seal Pressure 4.2 bar",
                spec: "Nordson Automatic Adhesive Dispensing & Folding Station",
                health: 97,
                status: "Optimal",
                anchor: [0, 2.25, 0.95],
              })
            }
          >
            <planeGeometry args={[1.62, 0.72]} />
            <meshPhysicalMaterial
              color="#93C5FD"
              transparent
              opacity={0.32}
              roughness={0.06}
              transmission={0.85}
            />
          </mesh>
          <pointLight position={[0, 1.82, 0]} color="#FEF08A" intensity={0.7} distance={2.6} />

          {/* Carton Blank Magazine Chute */}
          <mesh
            position={[-1.26, 1.62, 0]}
            rotation={[0, 0, -0.46]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "carton_magazine",
                name: "Corrugated Carton Blank Feed Magazine",
                telemetry: "Hopper Level: 84/120 Blanks • Feed Servo: Ready",
                spec: "Adjustable Dual-Guide Corrugated Cardboard Feed Chute",
                health: 99,
                status: "Ready",
                anchor: [-1.3, 2.15, 0],
              })
            }
          >
            <boxGeometry args={[0.92, 0.12, 0.82]} />
            <meshStandardMaterial color={safetyYellow} roughness={0.35} />
          </mesh>
          <mesh position={[-1.22, 1.78, 0]} rotation={[0, 0, -0.46]}>
            <boxGeometry args={[0.74, 0.28, 0.74]} />
            <meshStandardMaterial color="#D97706" roughness={0.9} />
          </mesh>

          {/* Articulated Vacuum Pick-and-Place Gantry Arm */}
          <group
            ref={pickArmRef}
            position={[0, 1.88, 0]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "vacuum_arm",
                name: "Pneumatic Pick-and-Place Vacuum Arm",
                telemetry: "Vacuum: -0.82 bar • Cycle: 1.8s per carton",
                spec: "Festo Telescopic Piston with 4x Polyurethane Vacuum Cups",
                health: 98,
                status: "Active Packaging",
                anchor: [0, 2.35, 0],
              })
            }
          >
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.68, 20]} />
              <meshStandardMaterial color={chromeSteel} metalness={0.96} roughness={0.08} />
            </mesh>
            <group ref={suctionPistonRef} position={[0, 0, 0]}>
              <mesh position={[0, -0.38, 0]}>
                <boxGeometry args={[0.54, 0.06, 0.54]} />
                <meshStandardMaterial color="#1E293B" metalness={0.75} />
              </mesh>
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

          {/* Outfeed Gravity Roller Chute */}
          <mesh
            position={[1.36, 0.82, 0]}
            rotation={[0, 0, -0.26]}
            onClick={(e) =>
              handlePartTouch(e, {
                id: "outfeed_table",
                name: "Live Roller Carton Outfeed Discharge",
                telemetry: "Line Exit Rate: 120 UPH • Gate: Clear",
                spec: "Zinc-Plated Gravity Roller Outfeed Bed (760x760mm)",
                health: 100,
                status: "Clear",
                anchor: [1.4, 1.35, 0],
              })
            }
          >
            <boxGeometry args={[0.76, 0.06, 0.76]} />
            <meshStandardMaterial color={chromeSteel} metalness={0.82} />
          </mesh>
          <mesh ref={outfeedBoxRef} position={[1.36, 1.0, 0]}>
            <boxGeometry args={[0.45, 0.36, 0.45]} />
            <meshStandardMaterial color="#D97706" roughness={0.88} />
          </mesh>
        </group>
      )}

      {/* ============================================================ */}
      {/* 4. EMISSIVE 3-TIER ANDON STATUS LIGHT TOWER                  */}
      {/* ============================================================ */}
      <group
        position={[type === "conveyor" ? 1.42 : 1.08, type === "packaging" ? 2.65 : 2.48, 0.78]}
        onClick={(e) =>
          handlePartTouch(e, {
            id: "andon_tower",
            name: "Industrial Optical Andon Light Tower",
            telemetry: `Severity: ${machine.severity || "Normal"} • Audio: Synced`,
            spec: "Patlite 3-Tier Multi-Status Optical Signal Beacon",
            health: 100,
            status: machine.severity || "Normal",
            anchor: [type === "conveyor" ? 1.42 : 1.08, 3.2, 0.78],
          })
        }
      >
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.52, 16]} />
          <meshStandardMaterial color={chromeSteel} metalness={0.85} />
        </mesh>
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
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.09, 20]} />
          <meshStandardMaterial
            color="#F59E0B"
            emissive="#F59E0B"
            emissiveIntensity={machine.severity === "Warning" ? 3.6 : 0.25}
          />
        </mesh>
        <mesh ref={beaconRef} position={[0, 0.43, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.09, 20]} />
          <meshStandardMaterial
            color="#10B981"
            emissive="#10B981"
            emissiveIntensity={machine.severity === "Normal" ? 3.2 : 0.25}
          />
        </mesh>

        <pointLight
          ref={pointLightRef}
          position={[0, 0.56, 0]}
          color={statusColor}
          intensity={0.95}
          distance={3.6}
        />
      </group>

      {/* ============================================================ */}
      {/* 5. FLOATING 3D COMPONENT HUD CALLOUT (WHEN TOUCHED)          */}
      {/* ============================================================ */}
      {touchedPart && (
        <Html
          position={touchedPart.anchor || [0, 2.5, 0]}
          center
          distanceFactor={14}
          className="pointer-events-auto select-none"
        >
          <div className="w-72 bg-[#121212]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 text-white animate-scale-up z-50">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-[#2A2A2A] pb-2.5 mb-2.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="caption-4 font-mono font-bold text-white bg-[#222222] px-1.5 py-0.5 rounded border border-[#333333]">
                    {machine.id}
                  </span>
                  <span className="caption-4 text-emerald-400 font-mono font-medium">
                    {touchedPart.status || "Optimal"}
                  </span>
                </div>
                <h4 className="title-4 text-white font-semibold mt-1 leading-tight">
                  {touchedPart.name}
                </h4>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setTouchedPart(null)
                  if (onSelectPart) onSelectPart(null)
                }}
                className="p-1 rounded-md text-[#9B9B9B] hover:text-white hover:bg-[#222222] transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Diagnostic Telemetry Row */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-2.5 space-y-1 mb-2.5">
              <div className="caption-5 text-[#9B9B9B] uppercase tracking-wider font-semibold">
                Live Sensor Telemetry
              </div>
              <div className="body-5 font-mono text-white flex items-center gap-1.5 font-medium">
                <Waveform className="size-3.5 text-blue-400" />
                <span>{touchedPart.telemetry}</span>
              </div>
            </div>

            {/* Specs & Engineering Description */}
            <div className="caption-4 text-[#9B9B9B] leading-snug">
              {touchedPart.spec}
            </div>

            {/* Action Buttons */}
            <div className="mt-3 pt-2.5 border-t border-[#2A2A2A] flex items-center justify-between">
              <span className="caption-5 font-mono text-white/50">
                Health: {touchedPart.health}%
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(machine.id)
                }}
                className="caption-4 font-semibold text-white hover:text-blue-400 transition-colors"
              >
                Inspect Machine →
              </button>
            </div>
          </div>
        </Html>
      )}

      {/* ============================================================ */}
      {/* 6. FLOATING 3D MACHINE BEACON BADGE                          */}
      {/* ============================================================ */}
      {!touchedPart && (
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
      )}
    </group>
  )
}
