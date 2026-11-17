import React, { useEffect, useState } from "react"
import { useSelectedMachine } from "@/providers/SelectedMachineProvider"
import { useLiveData } from "@/providers/LiveDataProvider"
import { fetchApi } from "@/lib/api"
import { ScoreBreakdownTable } from "@/features/intelligence/ScoreBreakdownTable"
import { RuleMatchList } from "@/features/intelligence/RuleMatchList"
import { StatisticalPatternCard } from "@/features/intelligence/StatisticalPatternCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ScoreRing } from "@/components/shared/ScoreRing"
import { MetricCard } from "@/components/shared/MetricCard"
import { SkeletonBox } from "@/components/shared/Skeletons"
import {
  Brain,
  Gauge,
  WarningCircle,
  Lightning,
  ShieldCheck,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function IntelligencePage() {
  const { selectedMachineId } = useSelectedMachine()
  const { machines, latestAnalysis } = useLiveData()

  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || {
    id: selectedMachineId,
    name: "Precision CNC Milling",
    role_in_line: "upstream",
    severity: "Normal",
    health_score: 98,
  }

  // Initial fetch
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    async function loadAnalysis() {
      try {
        const data = await fetchApi(`/api/machines/${selectedMachineId}/analysis`)
        if (isMounted) {
          setAnalysis(data)
          setLoading(false)
        }
      } catch {
        if (isMounted) setLoading(false)
      }
    }

    loadAnalysis()
    return () => {
      isMounted = false
    }
  }, [selectedMachineId])

  // Live WebSocket sync
  useEffect(() => {
    const liveUpdate = latestAnalysis[selectedMachineId]
    if (liveUpdate) {
      setAnalysis((prev) => ({
        ...prev,
        machine_id: selectedMachineId,
        health_score: liveUpdate.health_score,
        risk_score: liveUpdate.risk_score,
        severity: liveUpdate.severity,
        reasons: liveUpdate.reasons || [],
        hypotheses: liveUpdate.hypotheses || [],
      }))
    }
  }, [latestAnalysis, selectedMachineId])

  const healthScore = analysis?.health_score ?? selectedMachine.health_score ?? 100
  const riskScore = analysis?.risk_score ?? selectedMachine.risk_score ?? 0
  const severity = analysis?.severity ?? selectedMachine.severity ?? "Normal"
  const reasons = analysis?.reasons || []
  const hypotheses = analysis?.hypotheses || []

  const ifReason = reasons.find((r) => r.factor.includes("Isolation Forest"))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="caption-3 font-mono text-white bg-[#1F1F1F] px-2 py-0.5 rounded border border-[#313131]">
              {selectedMachineId}
            </span>
            <StatusBadge status={severity} />
          </div>
          <h1 className="heading-4 text-white">{selectedMachine.name}</h1>
          <p className="body-6 text-[#9B9B9B] mt-0.5 capitalize">
            {selectedMachine.role_in_line} • Explainable Diagnostic Intelligence & Continuous Grading
          </p>
        </div>

        <div className="flex items-center gap-2 caption-3 text-[#9B9B9B] bg-[#181818] px-3 py-1.5 rounded-lg border border-[#313131]">
          <ShieldCheck className="size-4 text-emerald-400" />
          <span>Deterministic + Statistical Check (No LLM / Black Box)</span>
        </div>
      </div>

      {/* Top Intelligence KPIs */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonBox className="h-32" />
          <SkeletonBox className="h-32" />
          <SkeletonBox className="h-32" />
          <SkeletonBox className="h-32" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#181818] border border-[#313131] rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="title-4 text-[#9B9B9B]">Health Score</span>
              <div className="heading-3 font-mono text-white mt-1">
                {Math.round(healthScore)}%
              </div>
              <span className="caption-4 text-[#9B9B9B] mt-1 block">Baseline: 100.0</span>
            </div>
            <ScoreRing score={healthScore} size={64} strokeWidth={5} label="" />
          </div>

          <MetricCard
            title="Operational Risk"
            value={`${Math.round(riskScore)}/100`}
            subtitle={
              riskScore > 40
                ? "Immediate intervention suggested"
                : "Inside safe operating limits"
            }
            icon={<WarningCircle className="size-5" />}
          />

          <MetricCard
            title="Active Deductions"
            value={reasons.length}
            subtitle={
              reasons.length > 0
                ? "Itemized penalty factors"
                : "Zero threshold violations"
            }
            icon={<Gauge className="size-5" />}
          />

          <MetricCard
            title="Failure Hypotheses"
            value={hypotheses.length}
            subtitle={
              hypotheses.length > 0
                ? "Matched pattern rule signature"
                : "No matching failure rules"
            }
            icon={<Brain className="size-5" />}
          />
        </div>
      )}

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Itemized Explainable Deductions Table */}
        <div className="lg:col-span-2 space-y-4">
          <ScoreBreakdownTable reasons={reasons} />
        </div>

        {/* Right 1 Col: Rule Hypotheses & Isolation Forest */}
        <div className="space-y-4">
          <StatisticalPatternCard ifReason={ifReason} />
          <RuleMatchList hypotheses={hypotheses} />
        </div>
      </div>
    </div>
  )
}
