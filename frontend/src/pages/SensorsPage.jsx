import React, { useEffect, useState, useRef } from "react"
import { useSelectedMachine } from "@/providers/SelectedMachineProvider"
import { useLiveData } from "@/providers/LiveDataProvider"
import { fetchApi } from "@/lib/api"
import { SensorChartCard } from "@/features/sensors/SensorChartCard"
import { AbnormalTriggerModal } from "@/features/sensors/AbnormalTriggerModal"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SkeletonBox } from "@/components/shared/Skeletons"
import {
  Waveform,
  Lightning,
  Clock,
  Cpu,
  ArrowsClockwise,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const SENSOR_METADATA = [
  { key: "vibration_mm_s", label: "Vibration RMS", unit: "mm/s" },
  { key: "temperature_c", label: "Motor Temperature", unit: "°C" },
  { key: "current_a", label: "Current Draw", unit: "A" },
  { key: "pressure_bar", label: "Pneumatic Pressure", unit: "bar" },
  { key: "infrared_c", label: "Infrared Hotspot", unit: "°C" },
  { key: "micro_movement_um", label: "Micro Movement", unit: "µm" },
  { key: "alignment_dev_mm", label: "Alignment Deviation", unit: "mm" },
  { key: "acoustic_db", label: "Acoustic Noise", unit: "dB" },
]

export function SensorsPage() {
  const { selectedMachineId } = useSelectedMachine()
  const { machines, latestTelemetry } = useLiveData()

  const [thresholds, setThresholds] = useState([])
  const [historyData, setHistoryData] = useState([])
  const [timeRange, setTimeRange] = useState(15) // minutes
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSensorForSpike, setSelectedSensorForSpike] = useState("vibration_mm_s")

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || {
    id: selectedMachineId,
    name: "Precision CNC Milling",
    role_in_line: "upstream",
    severity: "Normal",
    health_score: 98,
  }

  // Load initial threshold limits and history
  const loadData = async () => {
    try {
      const [threshList, hist] = await Promise.all([
        fetchApi(`/api/machines/${selectedMachineId}/thresholds`),
        fetchApi(`/api/machines/${selectedMachineId}/sensors/history?minutes=${timeRange}`),
      ])
      setThresholds(threshList)
      setHistoryData(hist.series || [])
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadData()
  }, [selectedMachineId, timeRange])

  // Real time WebSocket stream update
  useEffect(() => {
    const liveFrame = latestTelemetry[selectedMachineId]
    if (liveFrame && liveFrame.readings) {
      setHistoryData((prev) => {
        const point = {
          ts: liveFrame.ts,
          ...liveFrame.readings,
        }
        // Keep last 120 points for smooth rolling chart
        const nextSeries = [...prev, point]
        return nextSeries.slice(-120)
      })
    }
  }, [latestTelemetry, selectedMachineId])

  // Threshold map helper
  const thresholdMap = {}
  thresholds.forEach((t) => {
    thresholdMap[t.sensor] = t
  })

  // Live readings helper
  const currentReadings = latestTelemetry[selectedMachineId]?.readings || {}

  const handleOpenSpikeModal = (sensorKey) => {
    setSelectedSensorForSpike(sensorKey)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="caption-3 font-mono text-white bg-[#1F1F1F] px-2 py-0.5 rounded border border-[#313131]">
              {selectedMachineId}
            </span>
            <StatusBadge status={selectedMachine.severity} />
          </div>
          <h1 className="heading-4 text-white">{selectedMachine.name}</h1>
          <p className="body-6 text-[#9B9B9B] mt-0.5 capitalize">
            {selectedMachine.role_in_line} • Continuous Telemetry (8 Channels)
          </p>
        </div>

        {/* Toolbar: Time Range & Spike Trigger */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Selector */}
          <div className="flex items-center bg-[#181818] border border-[#313131] rounded-lg p-0.5">
            {[5, 15, 30, 60].map((m) => (
              <button
                key={m}
                onClick={() => setTimeRange(m)}
                className={cn(
                  "px-2.5 py-1 rounded-md caption-4 font-mono transition-colors",
                  timeRange === m
                    ? "bg-[#272727] text-white font-medium"
                    : "text-[#9B9B9B] hover:text-white"
                )}
              >
                {m}m
              </button>
            ))}
          </div>

          <button
            onClick={() => handleOpenSpikeModal("vibration_mm_s")}
            className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-neutral-200 text-black button-sm transition-colors duration-300 active:scale-[0.98]"
          >
            <Lightning className="size-4 text-black" weight="fill" />
            <span>Inject Spike</span>
          </button>
        </div>
      </div>

      {/* Sensor Small Multiples Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBox key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SENSOR_METADATA.map((s) => {
            const thresh = thresholdMap[s.key]
            const currentVal = currentReadings[s.key] ?? (historyData.length ? historyData[historyData.length - 1][s.key] : thresh?.normal_low)

            return (
              <SensorChartCard
                key={s.key}
                sensorKey={s.key}
                label={s.label}
                unit={s.unit}
                currentValue={currentVal}
                thresholds={thresh}
                historyData={historyData}
                onInjectSpike={handleOpenSpikeModal}
              />
            )
          })}
        </div>
      )}

      {/* Manual Abnormal Event Trigger Modal */}
      <AbnormalTriggerModal
        machineId={selectedMachineId}
        initialSensor={selectedSensorForSpike}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          // Live stream will receive and plot spike
        }}
      />
    </div>
  )
}
