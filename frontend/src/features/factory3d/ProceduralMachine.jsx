import React, { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { getSeverityConfig } from "@/lib/severity"
import { Cpu, Warning, CheckCircle } from "@phosphor-icons/react"

export function ProceduralMachine({
  machine,
  isSelected,
  onSelect,
  isImpactedDownstream = false,
}) {
  const groupRef = useRef()
  const beaconRef = useRef()
  const movingPartRef = useRef()
  const [isHovered, setIsHovered] = useState(false)

  const severityConfig = getSeverityConfig(machine.severity || "Normal")
  const statusColor = severityConfig.colorHex

  // Real-time animation: beacon pulse + moving parts animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // Status Beacon Pulsing
    if (beaconRef.current) {
      if (machine.severity && machine.severity !== "Normal") {
        const pulse = 1.0 + 0.35 * Math.sin(t * 6.0)
        beaconRef.current.scale.set(pulse, pulse, pulse)
      } else {
        beaconRef.current.scale.set(1, 1, 1)
      }
    }

    // Moving mechanism animation
    if (movingPartRef.current) {
      if (machine.type === "milling_centre") {
        // Spindle spin + subtle Z oscillation
        movingPartRef.current.rotation.y = t * 12.0
        movingPartRef.current.position.y = 1.25 + 0.08 * Math.sin(t * 2.0)
      } else if (machine.type === "conveyor") {
        // Conveyor belt roller spin
        movingPartRef.current.rotation.x = t * 4.0
      } else if (machine.type === "packaging") {
        // Packaging rotary arm oscillation
        movingPartRef.current.rotation.z = 0.25 * Math.sin(t * 3.0)
      }
    }
  })

  const { x = 0, y = 0, z = 0 } = machine.position || {}
  const type = machine.type

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
      {/* Downstream Impact Floor Ring */}
      {isImpactedDownstream && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[2.4, 2.7, 32]} />
          <meshBasicMaterial color="#F59E0B" opacity={0.7} transparent />
        </mesh>
      )}

      {/* Selected Machine Floor Marker */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[2.8, 2.95, 32]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.95} transparent />
        </mesh>
      )}

      {/* ============================================================ */}
      {/* MACHINE 1: PRECISION CNC MILLING CENTRE (MCH001)            */}
      {/* ============================================================ */}
      {type === "milling_centre" && (
        <group>
          {/* Heavy mineral cast bed (Dark industrial grey) */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[2.6, 0.9, 2.2]} />
            <meshStandardMaterial
              color={isSelected ? "#313131" : isHovered ? "#272727" : "#1A1A1A"}
              roughness={0.7}
              metalness={0.2}
            />
          </mesh>

          {/* Machine Y-axis Base Guide Rails */}
          <mesh position={[0, 0.92, -0.4]}>
            <boxGeometry args={[2.4, 0.06, 0.15]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.92, 0.4]}>
            <boxGeometry args={[2.4, 0.06, 0.15]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Workpiece T-slot Fixture Table */}
          <mesh position={[0, 1.0, 0]}>
            <boxGeometry args={[1.5, 0.12, 1.2]} />
            <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
          </mesh>

          {/* Precision machined aluminum workpiece block on table */}
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[0.5, 0.18, 0.5]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Massive Vertical Stator Column (Rear) */}
          <mesh position={[-0.8, 1.8, 0]}>
            <boxGeometry args={[0.9, 1.8, 1.8]} />
            <meshStandardMaterial color="#222222" roughness={0.6} />
          </mesh>

          {/* Spindle Carriage & Moving Toolhead */}
          <group ref={movingPartRef} position={[0, 1.25, 0]}>
            {/* Spindle Motor Housing */}
            <mesh position={[0, 0.55, 0]}>
              <boxGeometry args={[0.7, 0.8, 0.7]} />
              <meshStandardMaterial
                color={machine.severity !== "Normal" ? "#2B1A1A" : "#2E2E2E"}
                metalness={0.5}
                roughness={0.4}
              />
            </mesh>
            {/* High speed Spindle Nose */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.16, 0.14, 0.3, 24]} />
              <meshStandardMaterial color="#AAAAAA" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Carbide End Mill Tool */}
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.18, 16]} />
              <meshStandardMaterial color="#E0E0E0" metalness={0.95} roughness={0.15} />
            </mesh>
          </group>

          {/* Transparent Acrylic Safety Enclosure */}
          <mesh position={[0.3, 1.5, 0]}>
            <boxGeometry args={[1.8, 1.3, 1.9]} />
            <meshPhysicalMaterial
              color="#3B82F6"
              transparent
              opacity={0.15}
              roughness={0.1}
              transmission={0.8}
              thickness={0.5}
            />
          </mesh>
          {/* Blue safety frame borders */}
          <mesh position={[0.3, 2.15, 0]}>
            <boxGeometry args={[1.82, 0.05, 1.92]} />
            <meshStandardMaterial color="#2563EB" roughness={0.4} />
          </mesh>

          {/* CNC Operator Control Pendant Touchscreen */}
          <group position={[1.25, 1.5, 1.0]}>
            <mesh position={[0, 0, 0]} rotation={[0, -0.4, 0]}>
              <boxGeometry args={[0.35, 0.45, 0.08]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
            <mesh position={[0, 0, 0.045]} rotation={[0, -0.4, 0]}>
              <planeGeometry args={[0.3, 0.38]} />
              <meshBasicMaterial color="#0284C7" />
            </mesh>
          </group>
        </group>
      )}

      {/* ============================================================ */}
      {/* MACHINE 2: TRANSFER CONVEYOR (MCH002)                        */}
      {/* ============================================================ */}
      {type === "conveyor" && (
        <group>
          {/* Heavy Structural Steel Support Legs */}
          <mesh position={[-1.4, 0.45, -0.5]}>
            <boxGeometry args={[0.1, 0.9, 0.1]} />
            <meshStandardMaterial color="#222222" metalness={0.7} />
          </mesh>
          <mesh position={[-1.4, 0.45, 0.5]}>
            <boxGeometry args={[0.1, 0.9, 0.1]} />
            <meshStandardMaterial color="#222222" metalness={0.7} />
          </mesh>
          <mesh position={[1.4, 0.45, -0.5]}>
            <boxGeometry args={[0.1, 0.9, 0.1]} />
            <meshStandardMaterial color="#222222" metalness={0.7} />
          </mesh>
          <mesh position={[1.4, 0.45, 0.5]}>
            <boxGeometry args={[0.1, 0.9, 0.1]} />
            <meshStandardMaterial color="#222222" metalness={0.7} />
          </mesh>

          {/* Lower cross braces */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[2.8, 0.06, 0.9]} />
            <meshStandardMaterial color="#1A1A1A" />
          </mesh>

          {/* Conveyor Aluminum Bed Side Channels */}
          <mesh position={[0, 0.9, -0.55]}>
            <boxGeometry args={[3.2, 0.16, 0.1]} />
            <meshStandardMaterial
              color={isSelected ? "#404040" : isHovered ? "#333333" : "#282828"}
              metalness={0.6}
            />
          </mesh>
          <mesh position={[0, 0.9, 0.55]}>
            <boxGeometry args={[3.2, 0.16, 0.1]} />
            <meshStandardMaterial
              color={isSelected ? "#404040" : isHovered ? "#333333" : "#282828"}
              metalness={0.6}
            />
          </mesh>

          {/* Main Heavy Rubber Conveyor Belt Surface */}
          <mesh position={[0, 0.96, 0]}>
            <boxGeometry args={[3.0, 0.04, 0.95]} />
            <meshStandardMaterial color="#171717" roughness={0.9} />
          </mesh>

          {/* Rotating Drive Roller (End Pulley) */}
          <mesh ref={movingPartRef} position={[1.45, 0.93, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.95, 24]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Idler Roller */}
          <mesh position={[-1.45, 0.93, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.95, 24]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Geared Electric Drive Motor (Mounted at end of conveyor) */}
          <mesh position={[1.5, 0.85, 0.75]}>
            <cylinderGeometry args={[0.18, 0.18, 0.45, 20]} />
            <meshStandardMaterial
              color={machine.severity !== "Normal" ? "#382314" : "#222222"}
              metalness={0.6}
            />
          </mesh>
          <mesh position={[1.5, 0.85, 0.48]}>
            <boxGeometry args={[0.3, 0.3, 0.2]} />
            <meshStandardMaterial color="#333333" metalness={0.7} />
          </mesh>

          {/* Pneumatic Tensioning Cylinder */}
          <mesh position={[-1.3, 0.65, 0.55]} rotation={[0, 0, 0.2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
            <meshStandardMaterial color="#0284C7" metalness={0.8} />
          </mesh>

          {/* In transit parts travelling along conveyor */}
          <mesh position={[-0.8, 1.06, 0]}>
            <boxGeometry args={[0.4, 0.16, 0.4]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0.4, 1.06, 0]}>
            <boxGeometry args={[0.4, 0.16, 0.4]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.85} roughness={0.3} />
          </mesh>

          {/* Optical Beam Transceivers (Through-beam photo-eyes) */}
          <mesh position={[0, 1.15, -0.6]}>
            <boxGeometry args={[0.08, 0.15, 0.08]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 1.15, 0.6]}>
            <boxGeometry args={[0.08, 0.15, 0.08]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}

      {/* ============================================================ */}
      {/* MACHINE 3: CARTON PACKAGING MACHINE (MCH003)                  */}
      {/* ============================================================ */}
      {type === "packaging" && (
        <group>
          {/* Main Enclosed Chassis Box */}
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[2.4, 1.4, 2.0]} />
            <meshStandardMaterial
              color={isSelected ? "#313131" : isHovered ? "#272727" : "#1B1B1B"}
              roughness={0.6}
            />
          </mesh>

          {/* Upper Machine Gantry Frame */}
          <mesh position={[0, 1.9, 0]}>
            <boxGeometry args={[2.2, 1.0, 1.8]} />
            <meshStandardMaterial
              color={isSelected ? "#2B2B2B" : "#202020"}
              roughness={0.5}
            />
          </mesh>

          {/* Clear Viewing Window into Carton Sealing Chamber */}
          <mesh position={[0, 1.85, 0.92]}>
            <planeGeometry args={[1.6, 0.7]} />
            <meshPhysicalMaterial
              color="#3B82F6"
              transparent
              opacity={0.3}
              roughness={0.1}
            />
          </mesh>

          {/* Carton Feed Magazine (Angled Chute on side) */}
          <mesh position={[-1.25, 1.6, 0]} rotation={[0, 0, -0.45]}>
            <boxGeometry args={[0.9, 0.12, 0.8]} />
            <meshStandardMaterial color="#D97706" roughness={0.7} />
          </mesh>

          {/* Stack of flat corrugated carton blanks */}
          <mesh position={[-1.2, 1.75, 0]} rotation={[0, 0, -0.45]}>
            <boxGeometry args={[0.7, 0.25, 0.7]} />
            <meshStandardMaterial color="#B45309" roughness={0.9} />
          </mesh>

          {/* Vacuum Pick-and-Place Cup Arm (Oscillating) */}
          <group ref={movingPartRef} position={[0, 1.9, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} />
              <meshStandardMaterial color="#888888" metalness={0.8} />
            </mesh>
            {/* Suction manifold plate */}
            <mesh position={[0, -0.5, 0]}>
              <boxGeometry args={[0.5, 0.06, 0.5]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
            {/* Rubber suction cups */}
            <mesh position={[-0.15, -0.56, -0.15]}>
              <cylinderGeometry args={[0.04, 0.06, 0.08, 12]} />
              <meshStandardMaterial color="#F59E0B" />
            </mesh>
            <mesh position={[0.15, -0.56, -0.15]}>
              <cylinderGeometry args={[0.04, 0.06, 0.08, 12]} />
              <meshStandardMaterial color="#F59E0B" />
            </mesh>
            <mesh position={[-0.15, -0.56, 0.15]}>
              <cylinderGeometry args={[0.04, 0.06, 0.08, 12]} />
              <meshStandardMaterial color="#F59E0B" />
            </mesh>
            <mesh position={[0.15, -0.56, 0.15]}>
              <cylinderGeometry args={[0.04, 0.06, 0.08, 12]} />
              <meshStandardMaterial color="#F59E0B" />
            </mesh>
          </group>

          {/* Finished Carton Outfeed Chute (Right side) */}
          <mesh position={[1.3, 0.8, 0]} rotation={[0, 0, -0.25]}>
            <boxGeometry args={[0.7, 0.06, 0.7]} />
            <meshStandardMaterial color="#333333" metalness={0.5} />
          </mesh>
          {/* Packed cardboard box on exit chute */}
          <mesh position={[1.35, 0.98, 0]}>
            <boxGeometry args={[0.42, 0.35, 0.42]} />
            <meshStandardMaterial color="#C2884A" roughness={0.85} />
          </mesh>
        </group>
      )}

      {/* ============================================================ */}
      {/* EMISSIVE INDUSTRIAL STATUS LIGHT TOWER (ALL MACHINES)        */}
      {/* ============================================================ */}
      <group position={[type === "conveyor" ? 1.4 : 1.0, type === "packaging" ? 2.6 : 2.4, 0.7]}>
        {/* Support mast pole */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 12]} />
          <meshStandardMaterial color="#111111" metalness={0.7} />
        </mesh>

        {/* Emissive Signal Beacon Lamp */}
        <mesh ref={beaconRef} position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.18, 16]} />
          <meshStandardMaterial
            color={statusColor}
            emissive={statusColor}
            emissiveIntensity={machine.severity !== "Normal" ? 2.5 : 1.2}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* FLOATING 3D HTML TAG (DREI HTML)                            */}
      {/* ============================================================ */}
      <Html
        position={[0, type === "packaging" ? 3.0 : 2.7, 0]}
        center
        distanceFactor={18}
        className="pointer-events-none select-none"
      >
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all duration-300 shadow-xl ${
            isSelected
              ? "bg-[#181818]/95 border-white ring-2 ring-white/30"
              : machine.severity !== "Normal"
              ? "bg-[#181818]/95 border-amber-500 shadow-amber-500/10"
              : "bg-[#181818]/90 border-[#313131]"
          }`}
        >
          {/* Severity Icon Indicator */}
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-white">
                {machine.id}
              </span>
              <span
                className="text-[10px] font-mono px-1 rounded font-medium"
                style={{
                  color: statusColor,
                  backgroundColor: `${statusColor}18`,
                }}
              >
                {Math.round(machine.health_score || 100)}%
              </span>
            </div>
            <span className="text-[11px] text-[#9B9B9B] truncate max-w-[130px] font-medium leading-tight">
              {machine.name}
            </span>
          </div>
        </div>
      </Html>
    </group>
  )
}
