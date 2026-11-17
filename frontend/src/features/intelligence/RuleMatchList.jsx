import React from "react"
import { Check, X, ShieldCheck, WarningOctagon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const ALL_RULES = [
  {
    name: "Bearing Deterioration",
    conditions: [
      "Vibration (mm/s) > Warning limit",
      "Acoustic noise (dB) > Warning limit",
      "Micro-movement (µm) > Warning limit"
    ]
  },
  {
    name: "Motor Overheating / Overload",
    conditions: [
      "Temperature (°C) > Warning limit",
      "Infrared Hotspot (°C) > Warning limit",
      "Current draw (A) > Warning limit"
    ]
  },
  {
    name: "Mechanical Misalignment",
    conditions: [
      "Alignment deviation (mm) > Warning limit",
      "Vibration (mm/s) > Warning limit"
    ]
  },
  {
    name: "Conveyor Belt Damage / Slip",
    conditions: [
      "Micro-movement (µm) > Warning limit",
      "Current draw fluctuating > Warning limit",
      "Vibration (mm/s) > Warning limit"
    ]
  }
]

export function RuleMatchList({ hypotheses = [] }) {
  // Map any active hypotheses by name
  const activeMap = {}
  hypotheses.forEach(h => {
    activeMap[h.hypothesis] = h
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="h3 text-[#FFFFFF]">Deterministic Pattern Rules</h3>
        <span className="c1 text-text-secondary">Physical match count (No AI probability)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ALL_RULES.map((rule, idx) => {
          const active = activeMap[rule.name]
          const matchedCount = active ? active.matched_conditions : 0
          const totalCount = rule.conditions.length
          const isTriggered = active && matchedCount >= 2

          return (
            <div
              key={idx}
              className={cn(
                "rounded-lg border p-4 transition-all duration-300",
                isTriggered
                  ? "bg-status-red/10 border-status-red/50 shadow-sm shadow-status-red/20"
                  : matchedCount > 0
                  ? "bg-status-yellow/10 border-status-yellow/40"
                  : "bg-[#181818] border-[#272727]"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="b2 font-medium text-[#FFFFFF]">{rule.name}</h4>
                  <div className="c1 font-mono text-text-secondary mt-0.5">
                    Matched {matchedCount} of {totalCount} conditions
                  </div>
                </div>
                <span
                  className={cn(
                    "c1 px-2 py-0.5 rounded font-mono font-medium border",
                    isTriggered
                      ? "bg-status-red/20 text-status-red border-status-red/40"
                      : matchedCount > 0
                      ? "bg-status-yellow/20 text-status-yellow border-status-yellow/40"
                      : "bg-[#272727] text-text-secondary border-transparent"
                  )}
                >
                  {isTriggered ? "Active Failure" : matchedCount > 0 ? "Elevated" : "Within limits"}
                </span>
              </div>

              {/* Conditions checklist */}
              <div className="space-y-1.5 mt-3 pt-2 border-t border-[#272727]">
                {rule.conditions.map((condText, cIdx) => {
                  let conditionMatched = false
                  if (active && active.conditions) {
                    const found = active.conditions.find(c =>
                      condText.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
                    )
                    if (found && found.matched) conditionMatched = true
                  }

                  return (
                    <div
                      key={cIdx}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#131209]/60 border border-[#272727]/50"
                    >
                      <span className={conditionMatched ? "text-status-red font-medium" : "text-text-secondary"}>
                        {condText}
                      </span>
                      <span
                        className={cn(
                          "font-mono px-1.5 py-0.2 rounded text-[11px] inline-flex items-center gap-1",
                          conditionMatched
                            ? "bg-status-red/20 text-status-red font-semibold"
                            : "bg-[#272727] text-text-secondary"
                        )}
                      >
                        {conditionMatched ? (
                          <>
                            <Check size={11} weight="bold" />
                            <span>Violated</span>
                          </>
                        ) : (
                          <>
                            <X size={11} />
                            <span>Normal</span>
                          </>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="c1 text-text-secondary pt-1">
        *Deterministic physical failure pattern count based on sensor threshold limits. Explicitly non-probabilistic.
      </div>
    </div>
  )
}
