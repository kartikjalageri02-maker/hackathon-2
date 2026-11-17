import React from 'react'
import {
  Wrench,
  Package,
  User,
  Clock,
  CheckCircle,
  Warning,
  ListChecks,
  ArrowsClockwise
} from '@phosphor-icons/react'
import { useDemoRole } from '@/providers/DemoRoleProvider'

export default function WorkOrderRecommendationCard({ recommendation, onApprove, isApproving }) {
  const { role } = useDemoRole()
  const isSupervisor = role === 'Supervisor'

  const priorityColor = recommendation.priority === 'Urgent'
    ? 'border-status-red bg-status-red/15 text-status-red'
    : recommendation.priority === 'High'
    ? 'border-status-orange bg-status-orange/15 text-status-orange'
    : 'border-status-yellow bg-status-yellow/15 text-status-yellow'

  return (
    <div className="rounded-xl border border-white/10 glossy-card p-5 space-y-4 hover:border-white/20 transition-all">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded font-mono text-xs font-semibold border ${priorityColor}`}>
            {recommendation.priority} Priority
          </span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#272727] text-[#FFFFFF]">
            {recommendation.machine_id}
          </span>
          <span className="font-mono text-xs text-text-secondary">
            {recommendation.id}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs text-text-secondary font-mono">
          <Clock size={14} className="text-[#9B9B9B]" />
          <span>Est. Downtime: {recommendation.estimated_downtime_minutes} mins</span>
        </div>
      </div>

      {/* Problem Statement */}
      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-text-secondary">
          Prescribed Diagnostic Intervention
        </div>
        <h3 className="h3 text-[#FFFFFF] mt-0.5">{recommendation.problem_statement}</h3>
      </div>

      {/* Grid: Assigned Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Spare Part */}
        <div className="rounded-lg border border-[#272727] bg-[#131209] p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-secondary uppercase font-mono flex items-center gap-1">
              <Package size={13} />
              Assigned Replacement Part
            </span>
            {recommendation.assigned_part?.is_substitute && (
              <span className="px-1.5 py-0.2 rounded bg-status-yellow/20 text-status-yellow text-[10px] font-mono border border-status-yellow/30">
                Alternative Substitute
              </span>
            )}
          </div>
          <div className="text-[#FFFFFF] text-xs font-medium">
            {recommendation.assigned_part?.name || 'Standard Service Kit'}
          </div>
          <div className="text-text-secondary text-[11px] font-mono">
            On hand: {recommendation.assigned_part?.quantity ?? 0} units available in stock
          </div>
        </div>

        {/* Technician */}
        <div className="rounded-lg border border-[#272727] bg-[#131209] p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-secondary uppercase font-mono flex items-center gap-1">
              <User size={13} />
              Assigned Lead Technician
            </span>
            {recommendation.assigned_technician?.is_cross_qualified && (
              <span className="px-1.5 py-0.2 rounded bg-status-orange/20 text-status-orange text-[10px] font-mono border border-status-orange/30">
                Cross-qualified
              </span>
            )}
          </div>
          <div className="text-[#FFFFFF] text-xs font-medium">
            {recommendation.assigned_technician?.name || 'TCH001'}
          </div>
          <div className="text-text-secondary text-[11px] font-mono">
            {recommendation.assigned_technician?.specialisation || 'Mechatronics'} • {recommendation.assigned_technician?.shift || 'Morning'} Shift
          </div>
        </div>
      </div>

      {/* Recommended Inspection Steps */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-text-secondary uppercase font-mono flex items-center gap-1">
          <ListChecks size={13} />
          Standard Operating Procedure Steps
        </span>
        <div className="space-y-1.5">
          {recommendation.inspection_steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2 rounded bg-[#131209]/80 border border-[#272727] text-xs"
            >
              <span className="font-mono text-text-secondary font-bold shrink-0">{idx + 1}.</span>
              <span className="text-text-secondary leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contingency Plan */}
      {recommendation.contingency_plan && (
        <div className="p-3 rounded-lg bg-[#131209] border border-[#272727] flex items-start gap-2 text-xs">
          <Warning size={15} className="text-status-yellow shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#FFFFFF] mr-1">Operational Contingency:</span>
            <span className="text-text-secondary">{recommendation.contingency_plan}</span>
          </div>
        </div>
      )}

      {/* Why Chain (Itemized Deductions & Reasoning) */}
      <div className="p-3 rounded-lg bg-[#131209]/50 border border-[#272727] space-y-1.5">
        <div className="text-[11px] font-mono uppercase text-text-secondary">
          Explainable Recommendation Rationale (Why Chain)
        </div>
        <div className="space-y-1">
          {recommendation.why.map((item, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-xs">
              <span className="font-mono text-text-secondary font-semibold min-w-[140px] shrink-0">
                {item.factor}:
              </span>
              <span className="text-text-secondary">{item.justification}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Approve Button */}
      <div className="pt-2 flex items-center justify-between">
        <span className="text-[11px] text-text-secondary">
          Requires Supervisor authorization to dispatch technician and reserve inventory.
        </span>

        <button
          onClick={() => onApprove(recommendation.id)}
          disabled={!isSupervisor || isApproving}
          title={!isSupervisor ? "Requires Supervisor role" : ""}
          className={`py-2 px-4 rounded font-medium text-xs inline-flex items-center gap-1.5 transition-all active:scale-[0.98] ${
            isSupervisor
              ? 'bg-[#FFFFFF] text-[#000000] hover:bg-neutral-200'
              : 'bg-[#272727] text-[#9B9B9B] cursor-not-allowed opacity-60'
          }`}
        >
          {isApproving ? (
            <>
              <ArrowsClockwise size={14} className="animate-spin" />
              <span>Dispatching...</span>
            </>
          ) : (
            <>
              <CheckCircle size={14} weight="bold" />
              <span>Approve & Dispatch Work Order</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
