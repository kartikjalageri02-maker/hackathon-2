import React, { useEffect, useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

export function CameraControls({
  focusPosition = null,
  resetTrigger = 0,
}) {
  const controlsRef = useRef()
  const { camera } = useThree()
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const targetCamPos = useRef(new THREE.Vector3(0, 8, 14))
  const isEasing = useRef(false)

  // Reset to initial wide angle view
  useEffect(() => {
    if (resetTrigger > 0 && controlsRef.current) {
      targetLookAt.current.set(0, 0, 0)
      targetCamPos.current.set(0, 8, 14)
      isEasing.current = true
    }
  }, [resetTrigger])

  // Focus on selected machine
  useEffect(() => {
    if (focusPosition && controlsRef.current) {
      targetLookAt.current.set(focusPosition.x, 1.0, focusPosition.z)
      targetCamPos.current.set(focusPosition.x, 5.0, focusPosition.z + 8.0)
      isEasing.current = true
    }
  }, [focusPosition])

  useFrame(() => {
    if (isEasing.current && controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.08)
      camera.position.lerp(targetCamPos.current, 0.08)

      if (
        controlsRef.current.target.distanceTo(targetLookAt.current) < 0.05 &&
        camera.position.distanceTo(targetCamPos.current) < 0.05
      ) {
        isEasing.current = false
      }
      controlsRef.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.08}
      minDistance={5}
      maxDistance={28}
      maxPolarAngle={Math.PI / 2.05} // Prevents looking below floor
      minPolarAngle={Math.PI / 8}
    />
  )
}
