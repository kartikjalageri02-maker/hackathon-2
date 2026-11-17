import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function DependencyLines({ machines = [] }) {
  const pulseGroupRef = useRef()

  const machineMap = {}
  machines.forEach((m) => {
    machineMap[m.id] = m.position
  })

  // Material flow pairs: MCH001 -> MCH002, MCH002 -> MCH003
  const connections = [
    { from: "MCH001", to: "MCH002" },
    { from: "MCH002", to: "MCH003" },
  ]

  useFrame((state) => {
    if (pulseGroupRef.current) {
      const t = state.clock.getElapsedTime()
      pulseGroupRef.current.children.forEach((mesh, index) => {
        const offset = (t * 0.45 + index * 0.25) % 1.0
        const connIndex = Math.floor(index / 2) % connections.length
        const conn = connections[connIndex]
        const p1 = machineMap[conn.from]
        const p2 = machineMap[conn.to]

        if (p1 && p2) {
          mesh.position.x = p1.x + (p2.x - p1.x) * offset
          mesh.position.y = 0.06
          mesh.position.z = p1.z + (p2.z - p1.z) * offset
          const pulseScale = 0.8 + 0.3 * Math.sin(offset * Math.PI)
          mesh.scale.set(pulseScale, pulseScale, pulseScale)
        }
      })
    }
  })

  return (
    <group>
      {connections.map((conn) => {
        const p1 = machineMap[conn.from]
        const p2 = machineMap[conn.to]
        if (!p1 || !p2) return null

        const points = [
          new THREE.Vector3(p1.x, 0.04, p1.z),
          new THREE.Vector3(p2.x, 0.04, p2.z),
        ]
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

        return (
          <group key={`${conn.from}-${conn.to}`}>
            {/* Base pathway line */}
            <line geometry={lineGeometry}>
              <lineBasicMaterial color="#334155" linewidth={2} />
            </line>

            {/* Directional transfer chevrons at 35% and 65% points */}
            {[0.35, 0.65].map((ratio, idx) => (
              <mesh
                key={`chevron-${idx}`}
                position={[
                  p1.x + (p2.x - p1.x) * ratio,
                  0.05,
                  p1.z + (p2.z - p1.z) * ratio,
                ]}
                rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
              >
                <coneGeometry args={[0.16, 0.38, 16]} />
                <meshBasicMaterial color="#64748B" opacity={0.85} transparent />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* Animated Glowing Material Transfer Pulses */}
      <group ref={pulseGroupRef}>
        {[0, 1, 2, 3].map((idx) => (
          <mesh key={`pulse-dot-${idx}`}>
            <sphereGeometry args={[0.09, 14, 14]} />
            <meshStandardMaterial
              color="#38BDF8"
              emissive="#38BDF8"
              emissiveIntensity={2.0}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
