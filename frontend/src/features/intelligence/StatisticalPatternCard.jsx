import React from "react"
import { Brain, ShieldCheck } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function StatisticalPatternCard({ ifReason }) {
  const penalty = ifReason ? Math.abs(ifReason.points) : 0.0
  const isElevated = penalty >= 2.0

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Brain className="size-4" weight="fill" />
            </div>
            <span className="title-4 text-white">Isolation Forest</span>
          </div>
          <span
            className={cn(
              "caption-4 px-2 py-0.5 rounded font-mono font-medium",
              isElevated
                ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
            )}
          >
            {isElevated ? `-${penalty} pts` : "Normal"}
          </span>
        </div>

        <p className="caption-3 text-white font-medium">Statistical pattern check (Isolation Forest)</p>
        <p className="caption-4 text-[#9B9B9B] mt-1">
          {ifReason
            ? ifReason.note
            : "Multivariate feature correlations across all 8 sensor channels match trained normal operating baseline."}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#313131] flex items-center justify-between caption-5 text-[#9B9B9B]">
        <span>Contribution: Max -15.0 pts</span>
        <span className="text-[#9B9B9B]/60">Supporting signal only</span>
      </div>
    </div>
  )
}
