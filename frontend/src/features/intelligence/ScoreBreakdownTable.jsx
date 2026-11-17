import React from "react"
import { ShieldCheck } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function ScoreBreakdownTable({ reasons = [] }) {
  if (!reasons || reasons.length === 0) {
    return (
      <div className="bg-[#181818] border border-[#313131] rounded-xl p-6 text-center">
        <div className="inline-flex p-2.5 rounded-full bg-emerald-500/10 text-emerald-400 mb-2 border border-emerald-500/20">
          <ShieldCheck className="size-6" weight="fill" />
        </div>
        <h3 className="title-4 text-white">Full 100% Health Maintained</h3>
        <p className="caption-2 text-[#9B9B9B] max-w-sm mx-auto mt-1">
          Zero deductions. All sensor channels, multivariate pattern checks, and failure rules are operating inside nominal baseline boundaries.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#313131] flex items-center justify-between bg-[#1F1F1F]">
        <span className="title-4 text-white font-medium">Explainable Score Deductions</span>
        <span className="caption-4 font-mono text-[#9B9B9B]">{reasons.length} active factors</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#313131] bg-[#1F1F1F]/50 caption-4 text-[#9B9B9B]">
              <th className="py-2.5 px-4 font-medium">Diagnostic Factor</th>
              <th className="py-2.5 px-4 font-medium font-mono text-right">Observed</th>
              <th className="py-2.5 px-4 font-medium font-mono text-right">Limit</th>
              <th className="py-2.5 px-4 font-medium font-mono text-right">Penalty</th>
              <th className="py-2.5 px-4 font-medium">Diagnostic Explanation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#313131] body-5">
            {reasons.map((r, i) => (
              <tr key={i} className="hover:bg-[#272727]/50 transition-colors">
                <td className="py-3 px-4 font-medium text-white">{r.factor}</td>
                <td className="py-3 px-4 font-mono text-white text-right">
                  {r.observed} <span className="caption-5 text-[#9B9B9B]">{r.unit}</span>
                </td>
                <td className="py-3 px-4 font-mono text-[#9B9B9B] text-right">
                  {r.limit} <span className="caption-5 text-[#9B9B9B]">{r.unit}</span>
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-rose-400 text-right">
                  {r.points}
                </td>
                <td className="py-3 px-4 caption-2 text-[#9B9B9B] max-w-md">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
