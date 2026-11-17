import React from 'react'
import {
  Warning,
  CheckCircle,
  ClockAfternoon,
  Gauge,
  ArrowsClockwise
} from '@phosphor-icons/react'

export default function ComponentLifecycleTable({ components, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-text-secondary bg-[#181818] border border-[#272727] rounded-lg">
        <ArrowsClockwise size={24} className="animate-spin mx-auto mb-2 text-[#9B9B9B]" />
        <span className="b3">Loading machine components and lifecycle telemetry...</span>
      </div>
    )
  }

  if (!components || components.length === 0) {
    return (
      <div className="p-8 text-center text-text-secondary bg-[#181818] border border-[#272727] rounded-lg">
        <span className="b3">No components registered for this machine.</span>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#272727] bg-[#181818]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#272727] bg-[#1F1F1F]/50 text-text-secondary">
            <th className="py-3 px-4 l2">Component</th>
            <th className="py-3 px-4 l2">Linked Sensor</th>
            <th className="py-3 px-4 l2">Calendar RUL</th>
            <th className="py-3 px-4 l2">Effective RUL</th>
            <th className="py-3 px-4 l2">Life Used</th>
            <th className="py-3 px-4 l2">Condition</th>
            <th className="py-3 px-4 l2">Diagnostic Flags</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#272727]">
          {components.map((comp) => {
            const hasEarlyDet = comp.early_deterioration
            const isDue = comp.flag_replacement_due
            const isOverdue = comp.inspection_overdue
            const isHighUsage = comp.flag_high_usage

            return (
              <tr key={comp.id} className="hover:bg-[#1F1F1F]/40 transition-colors duration-150">
                <td className="py-3 px-4">
                  <div className="text-[#FFFFFF] b2 font-medium">{comp.name}</div>
                  <div className="text-text-secondary c1 font-mono">{comp.id}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#131209] border border-[#272727] font-mono c1 text-[#FFFFFF]">
                    <Gauge size={13} className="text-[#9B9B9B]" />
                    {comp.linked_sensor}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-[#FFFFFF] font-mono b2">
                    {comp.calendar_life_remaining_days} <span className="text-text-secondary c1">days</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono b2 font-medium ${
                      comp.effective_life_remaining_days < 30
                        ? 'text-status-red'
                        : comp.effective_life_remaining_days < 90
                        ? 'text-status-yellow'
                        : 'text-status-green'
                    }`}>
                      {comp.effective_life_remaining_days}
                    </span>
                    <span className="text-text-secondary c1">days</span>
                    {comp.sensor_stress_multiplier > 1.1 && (
                      <span className="px-1.5 py-0.5 rounded bg-status-orange/10 border border-status-orange/30 text-status-orange font-mono c1">
                        {comp.sensor_stress_multiplier}x stress
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 min-w-[130px]">
                  <div className="flex items-center justify-between text-text-secondary c1 mb-1">
                    <span>{comp.life_used_ratio}%</span>
                    <span>{comp.service_life_days}d total</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#272727] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        comp.life_used_ratio > 85
                          ? 'bg-status-red'
                          : comp.life_used_ratio > 70
                          ? 'bg-status-yellow'
                          : 'bg-status-green'
                      }`}
                      style={{ width: `${Math.min(100, comp.life_used_ratio)}%` }}
                    />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                    comp.condition === 'Optimal'
                      ? 'bg-status-green/10 text-status-green border-status-green/30'
                      : comp.condition === 'Degraded'
                      ? 'bg-status-yellow/10 text-status-yellow border-status-yellow/30'
                      : 'bg-status-red/10 text-status-red border-status-red/30'
                  }`}>
                    {comp.condition}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    {hasEarlyDet && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-status-orange/15 border border-status-orange/40 text-status-orange text-xs">
                        <Warning size={13} weight="bold" />
                        <span>Early deterioration</span>
                      </div>
                    )}
                    {isDue && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-status-red/15 border border-status-red/40 text-status-red text-xs">
                        <ClockAfternoon size={13} weight="bold" />
                        <span>Replacement due (&le;30d)</span>
                      </div>
                    )}
                    {isOverdue && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-status-yellow/15 border border-status-yellow/40 text-status-yellow text-xs">
                        <Warning size={13} weight="bold" />
                        <span>Inspection overdue</span>
                      </div>
                    )}
                    {isHighUsage && !isDue && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#272727] text-text-secondary text-xs">
                        <span>High usage (&gt;85%)</span>
                      </div>
                    )}
                    {!hasEarlyDet && !isDue && !isOverdue && !isHighUsage && (
                      <div className="inline-flex items-center gap-1 text-text-secondary text-xs">
                        <CheckCircle size={13} className="text-status-green" />
                        <span>Nominal</span>
                      </div>
                    )}
                    {hasEarlyDet && comp.deterioration_reason && (
                      <div className="text-xs text-text-secondary mt-1 max-w-xs leading-tight">
                        {comp.deterioration_reason}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
