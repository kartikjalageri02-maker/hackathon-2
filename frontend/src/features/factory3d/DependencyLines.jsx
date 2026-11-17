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
      // Move pulse indicator along the line
      pulseGroupRef.current.children.forEach((mesh, index) => {
        const offset = (t * 0.4 + index * 0.5) % 1.0
        const conn = connections[index % connections.length]
        const p1 = machineMap[conn.from]
        const p2 = machineMap[conn.to]

        if (p1 && p2) {
          mesh.position.x = p1.x + (p2.x - p1.x) * offset
          mesh.position.y = 0.05
          mesh.position.z = p1.z + (p2.z - p1.z) * offset
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
            {/* Base connection line */}
            <line geometry={lineGeometry}>
              <lineBasicMaterial color="#313131" linewidth={2} />
            </line>

            {/* Chevron directional arrows at midpoint */}
            <mesh
              position={[(p1.x + p2.x) / 2, 0.04, (p1.z + p2.z) / 2]}
              rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
            >
              <coneGeometry args={[0.15, 0.35, 12]} />
              <meshBasicMaterial color="#9B9B9B" opacity={0.7} transparent />
            </mesh>
          </group>
        )
      })}

      {/* Animated flow pulse markers */}
      <group ref={pulseGroupRef}>
        <mesh>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.9} transparent />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#FFFFFF" opacity={0.9} transparent />
        </mesh>
      </group>
    </group>
  )
}
