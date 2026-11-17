import React, { useEffect, useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

export function CameraControls({
  focusPosition = null,
  resetTrigger = 0,
  preset = null, // "overview", "isometric", "top", "front"
}) {
  const controlsRef = useRef()
  const { camera } = useThree()
  const targetLookAt = useRef(new THREE.Vector3(0, 0.8, 0))
  const targetCamPos = useRef(new THREE.Vector3(0, 7.5, 13.5))
  const isEasing = useRef(false)

  // Camera preset positions
  const PRESETS = {
    overview: { pos: new THREE.Vector3(0, 7.5, 13.5), look: new THREE.Vector3(0, 0.8, 0) },
    isometric: { pos: new THREE.Vector3(12, 9, 15), look: new THREE.Vector3(0, 0.8, 0) },
    top: { pos: new THREE.Vector3(0, 19, 0.01), look: new THREE.Vector3(0, 0, 0) },
    front: { pos: new THREE.Vector3(0, 3.8, 14), look: new THREE.Vector3(0, 1.0, 0) },
  }

  // Handle Preset changes
  useEffect(() => {
    if (preset && PRESETS[preset] && controlsRef.current) {
      targetCamPos.current.copy(PRESETS[preset].pos)
      targetLookAt.current.copy(PRESETS[preset].look)
      isEasing.current = true
    }
  }, [preset])

  // Handle Reset to initial wide angle view
  useEffect(() => {
    if (resetTrigger > 0 && controlsRef.current) {
      targetLookAt.current.set(0, 0.8, 0)
      targetCamPos.current.set(0, 7.5, 13.5)
      isEasing.current = true
    }
  }, [resetTrigger])

  // Handle Focus on selected machine with smooth perspective framing
  useEffect(() => {
    if (focusPosition && controlsRef.current) {
      targetLookAt.current.set(focusPosition.x, 1.2, focusPosition.z)
      targetCamPos.current.set(focusPosition.x, 4.6, focusPosition.z + 7.6)
      isEasing.current = true
    }
  }, [focusPosition])

  // Frame-rate independent exponential interpolation for silky smooth camera gliding
  useFrame((_, delta) => {
    if (isEasing.current && controlsRef.current) {
      const alpha = 1.0 - Math.exp(-6.5 * delta)
      controlsRef.current.target.lerp(targetLookAt.current, alpha)
      camera.position.lerp(targetCamPos.current, alpha)

      if (
        controlsRef.current.target.distanceTo(targetLookAt.current) < 0.02 &&
        camera.position.distanceTo(targetCamPos.current) < 0.02
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
      dampingFactor={0.06}
      rotateSpeed={0.75}
      zoomSpeed={0.85}
      panSpeed={0.75}
      minDistance={3.5}
      maxDistance={30}
      maxPolarAngle={Math.PI / 2.04} // Prevents camera dipping under floor
      minPolarAngle={Math.PI / 12}
    />
  )
}
