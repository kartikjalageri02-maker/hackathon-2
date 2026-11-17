import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchApi } from "@/lib/api"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ScoreRing } from "@/components/shared/ScoreRing"
import { SkeletonBox } from "@/components/shared/Skeletons"
import {
  X,
  Waveform,
  Wrench,
  PlayCircle,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function MachineDetailPanel({ machineId, onClose }) {
  const [detail, setDetail] = useState(null)
  const [components, setComponents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    async function loadData() {
      try {
        const [mDetail, comps] = await Promise.all([
          fetchApi(`/api/machines/${machineId}`),
          fetchApi(`/api/machines/${machineId}/components`).catch(() => []),
        ])
        if (isMounted) {
          setDetail(mDetail)
          setComponents(comps)
          setLoading(false)
        }
      } catch {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [machineId])

  if (!machineId) return null

  return (
    <div className="absolute right-4 top-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] bg-[#181818]/95 backdrop-blur-md border border-[#313131] rounded-2xl shadow-2xl flex flex-col z-30 overflow-hidden animate-slide-left">
      {/* Header */}
      <div className="p-4 border-b border-[#313131] flex items-start justify-between bg-[#1F1F1F]/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="caption-3 font-mono text-white bg-[#272727] px-2 py-0.5 rounded border border-[#313131]">
              {machineId}
            </span>
            {detail && <StatusBadge status={detail.severity} />}
          </div>
          <h2 className="title-3 text-white truncate max-w-[240px]">
            {detail ? detail.name : `Machine ${machineId}`}
          </h2>
          <div className="caption-4 text-[#9B9B9B] capitalize mt-0.5">
            {detail?.role_in_line} • {detail?.type?.replace("_", " ")}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#9B9B9B] hover:text-white hover:bg-[#272727] transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {loading ? (
          <div className="space-y-4">
            <SkeletonBox className="h-24 w-full" />
            <SkeletonBox className="h-16 w-full" />
            <SkeletonBox className="h-32 w-full" />
          </div>
        ) : (
          <>
            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1F1F1F] border border-[#313131] rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="caption-5 text-[#9B9B9B] uppercase tracking-wider">Health</span>
                  <div className="title-1 font-mono text-white mt-0.5">
                    {Math.round(detail?.health_score || 100)}%
                  </div>
                </div>
                <ScoreRing
                  score={detail?.health_score || 100}
                  size={44}
                  strokeWidth={4}
                  label=""
                />
              </div>

              <div className="bg-[#1F1F1F] border border-[#313131] rounded-xl p-3 flex flex-col justify-between">
                <span className="caption-5 text-[#9B9B9B] uppercase tracking-wider">Risk Index</span>
                <div className="title-1 font-mono text-white">
                  {Math.round(detail?.risk_score || 0)}/100
                </div>
                <span className="caption-5 text-[#9B9B9B]">Operating deficit</span>
              </div>
            </div>

            {/* Operational Metrics */}
            <div className="bg-[#1F1F1F] border border-[#313131] rounded-xl p-3 space-y-2">
              <div className="flex justify-between caption-4">
                <span className="text-[#9B9B9B]">Nominal Throughput</span>
                <span className="font-mono text-white">{detail?.nominal_throughput_uph} UPH</span>
              </div>
              <div className="flex justify-between caption-4">
                <span className="text-[#9B9B9B]">Criticality Weight</span>
                <span className="font-mono text-white">{detail?.criticality_weight}</span>
              </div>
              <div className="flex justify-between caption-4">
                <span className="text-[#9B9B9B]">Active Alerts</span>
                <span
                  className={cn(
                    "font-mono font-medium",
                    detail?.active_alerts_count > 0 ? "text-amber-400" : "text-emerald-400"
                  )}
                >
                  {detail?.active_alerts_count || 0}
                </span>
              </div>
            </div>

            {/* Components Lifecycle Summary */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="title-4 text-white">Tracked Components</span>
                <span className="caption-5 text-[#9B9B9B]">{components.length} subassemblies</span>
              </div>

              <div className="space-y-2">
                {components.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-lg bg-[#1F1F1F] border border-[#313131] flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="body-5 text-white truncate">{c.name}</div>
                      <div className="caption-5 text-[#9B9B9B]">
                        Sensor: <span className="font-mono">{c.linked_sensor}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={cn(
                          "caption-4 px-1.5 py-0.5 rounded font-mono",
                          c.condition === "Good"
                            ? "text-emerald-400 bg-emerald-500/10"
                            : c.condition === "Fair"
                            ? "text-amber-400 bg-amber-500/10"
                            : "text-rose-400 bg-rose-500/10"
                        )}
                      >
                        {c.condition}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => navigate(`/app/sensors?machine=${machineId}`)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-[#272727] hover:bg-[#313131] text-white button-sm transition-colors duration-300"
              >
                <div className="flex items-center gap-2">
                  <Waveform className="size-4 text-[#9B9B9B]" />
                  <span>Inspect Sensor Telemetry</span>
                </div>
                <ArrowRight className="size-4" />
              </button>

              <button
                onClick={() => navigate(`/app/simulation?machine=${machineId}`)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-white hover:bg-neutral-200 text-black button-sm transition-colors duration-300"
              >
                <div className="flex items-center gap-2">
                  <PlayCircle className="size-4 text-black" weight="fill" />
                  <span>Simulate Fault Scenario</span>
                </div>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
