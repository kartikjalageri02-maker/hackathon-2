import React from 'react'
import {
  Warning,
  CheckCircle,
  TrendDown,
  CurrencyDollar,
  ArrowsClockwise,
  ListNumbers
} from '@phosphor-icons/react'
import { MetricCard } from '@/components/shared/MetricCard'

export default function BottleneckSummary({ impact }) {
  if (!impact) return null

  const isDegraded = impact.lost_uph > 0

  return (
    <div className="space-y-6">
      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Line Exit Throughput"
          value={`${impact.effective_line_uph}`}
          unit="UPH"
          subtitle={`Nominal baseline: ${impact.baseline_line_uph} UPH`}
          valueClassName={isDegraded ? "text-status-yellow" : "text-[#FFFFFF]"}
        />
        <MetricCard
          title="Production Loss"
          value={`-${impact.lost_uph}`}
          unit="UPH"
          subtitle={`${impact.loss_percentage}% capacity derate`}
          valueClassName={isDegraded ? "text-status-red" : "text-status-green"}
          icon={<TrendDown size={20} className={isDegraded ? "text-status-red" : "text-status-green"} />}
        />
        <MetricCard
          title="Est. Hourly Revenue Loss"
          value={`$${impact.estimated_hourly_loss_usd}`}
          subtitle="At $45.00 gross margin / unit"
          valueClassName={isDegraded ? "text-status-red" : "text-[#FFFFFF]"}
          icon={<CurrencyDollar size={20} className={isDegraded ? "text-status-red" : "text-[#9B9B9B]"} />}
        />
        <MetricCard
          title="Bottleneck Root Cause"
          value={impact.root_cause_machine_id || "None"}
          subtitle={impact.root_cause_machine_name || "Line operating balanced"}
          valueClassName={isDegraded ? "text-status-orange" : "text-status-green"}
          icon={<Warning size={20} className={isDegraded ? "text-status-orange" : "text-status-green"} />}
        />
      </div>

      {/* Action Recommendation Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 backdrop-blur-md transition-all ${
        isDegraded
          ? 'bg-status-red/10 border-status-red/30 text-[#FFFFFF] shadow-lg'
          : 'glossy-panel text-text-secondary'
      }`}>
        {isDegraded ? (
          <Warning size={22} className="text-status-red shrink-0 mt-0.5" weight="bold" />
        ) : (
          <CheckCircle size={22} className="text-status-green shrink-0 mt-0.5" weight="bold" />
        )}
        <div>
          <div className="text-xs uppercase font-mono tracking-wider font-semibold text-text-secondary">
            Operational Priority
          </div>
          <div className="text-sm font-medium text-[#FFFFFF] mt-0.5">
            {impact.first_action_recommendation}
          </div>
        </div>
      </div>

      {/* Propagation Chain & Engineering Assumptions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Propagation Chain */}
        <div className="glossy-panel rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ListNumbers size={18} className="text-[#9B9B9B]" />
            <h3 className="h3 text-[#FFFFFF]">Loss Propagation Chain</h3>
          </div>

          {impact.propagation_chain && impact.propagation_chain.length > 0 ? (
            <div className="space-y-2">
              {impact.propagation_chain.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-[#141418] border border-white/10 text-xs"
                >
                  <span className="font-mono text-status-orange font-bold shrink-0">
                    Step {idx + 1}:
                  </span>
                  <span className="text-text-secondary leading-relaxed">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[#141418] border border-white/5 text-center text-text-secondary text-xs">
              No starvation or throughput constraints active along the production line.
            </div>
          )}
        </div>

        {/* Engineering Assumptions */}
        <div className="glossy-panel rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ArrowsClockwise size={18} className="text-[#9B9B9B]" />
            <h3 className="h3 text-[#FFFFFF]">Modeling Assumptions</h3>
          </div>

          <div className="space-y-2">
            {impact.assumptions && impact.assumptions.map((assump, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-[#141418] border border-white/10 text-xs text-text-secondary"
              >
                <span className="text-[#FFFFFF] font-mono">•</span>
                <span>{assump}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
