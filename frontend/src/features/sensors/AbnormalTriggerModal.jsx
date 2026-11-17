import React, { useState } from "react"
import { fetchApi } from "@/lib/api"
import { X, Lightning, Check } from "@phosphor-icons/react"

const SENSORS = [
  { key: "vibration_mm_s", label: "Vibration RMS", defaultMag: 3.5, unit: "mm/s" },
  { key: "temperature_c", label: "Spindle Temperature", defaultMag: 25.0, unit: "°C" },
  { key: "current_a", label: "Current Draw", defaultMag: 12.0, unit: "A" },
  { key: "pressure_bar", label: "Pneumatic Pressure", defaultMag: 2.2, unit: "bar" },
  { key: "infrared_c", label: "Infrared Hotspot", defaultMag: 30.0, unit: "°C" },
  { key: "micro_movement_um", label: "Micro Movement", defaultMag: 15.0, unit: "µm" },
  { key: "alignment_dev_mm", label: "Alignment Deviation", defaultMag: 0.08, unit: "mm" },
  { key: "acoustic_db", label: "Acoustic Noise", defaultMag: 18.0, unit: "dB" },
]

export function AbnormalTriggerModal({ machineId, initialSensor = "vibration_mm_s", isOpen, onClose, onSuccess }) {
  const [selectedSensor, setSelectedSensor] = useState(initialSensor)
  const [magnitude, setMagnitude] = useState(() => {
    const s = SENSORS.find((item) => item.key === initialSensor)
    return s ? s.defaultMag : 3.5
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  if (!isOpen) return null

  const handleSensorChange = (key) => {
    setSelectedSensor(key)
    const s = SENSORS.find((item) => item.key === key)
    if (s) setMagnitude(s.defaultMag)
  }

  const handleInject = async () => {
    setSubmitting(true)
    setSuccessMsg(null)
    try {
      await fetchApi("/api/simulation/events", {
        method: "POST",
        body: JSON.stringify({
          machine_id: machineId,
          sensor: selectedSensor,
          magnitude: parseFloat(magnitude),
        }),
      })
      setSuccessMsg(`Injected +${magnitude} spike on ${selectedSensor}`)
      if (onSuccess) onSuccess()
      setTimeout(() => {
        onClose()
        setSuccessMsg(null)
      }, 900)
    } catch {
      // Error handling
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#181818] border border-[#313131] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 border-b border-[#313131] flex items-center justify-between bg-[#1F1F1F]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
              <Lightning className="size-4" weight="fill" />
            </div>
            <div>
              <h3 className="title-3 text-white">Inject Abnormal Reading</h3>
              <p className="caption-4 text-[#9B9B9B]">Target: {machineId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9B9B9B] hover:text-white hover:bg-[#272727] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="caption-3 text-[#9B9B9B] block mb-1.5">Sensor Channel</label>
            <select
              value={selectedSensor}
              onChange={(e) => handleSensorChange(e.target.value)}
              className="w-full bg-[#1F1F1F] border border-[#313131] rounded-lg px-3 py-2 text-white body-5 focus:outline-none focus:border-white transition-colors"
            >
              {SENSORS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label} ({s.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="caption-3 text-[#9B9B9B] block mb-1.5">Spike Magnitude</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                value={magnitude}
                onChange={(e) => setMagnitude(e.target.value)}
                className="w-full bg-[#1F1F1F] border border-[#313131] rounded-lg px-3 py-2 text-white font-mono body-5 focus:outline-none focus:border-white transition-colors"
              />
              <span className="caption-3 font-mono text-[#9B9B9B] shrink-0">
                {SENSORS.find((s) => s.key === selectedSensor)?.unit}
              </span>
            </div>
            <p className="caption-5 text-[#9B9B9B] mt-1">
              Spike will inject instantaneously and decay exponentially over 15 seconds.
            </p>
          </div>

          {successMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 caption-3 flex items-center gap-2">
              <Check className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#313131] flex justify-end gap-2 bg-[#1F1F1F]/50">
          <button
            onClick={onClose}
            className="py-2 px-3 rounded-lg border border-[#313131] text-white button-sm hover:bg-[#272727] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInject}
            disabled={submitting}
            className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white text-black button-sm hover:bg-neutral-200 transition-colors active:scale-[0.98]"
          >
            <Lightning className="size-4 text-black" weight="fill" />
            <span>{submitting ? "Injecting..." : "Inject Spike"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
