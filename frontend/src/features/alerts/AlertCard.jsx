import React from 'react'
import {
  Warning,
  CheckCircle,
  Clock,
  ShieldWarning,
  ListNumbers,
  Check,
  ArrowClockwise
} from '@phosphor-icons/react'
import { useDemoRole } from '@/providers/DemoRoleProvider'
import { formatTimestamp } from '@/lib/format'

export default function AlertCard({ alert, onAcknowledge, onResolve, onOpenTimeline }) {
  const { role } = useDemoRole()

  const isOperatorOrSupervisor = role === 'Operator' || role === 'Supervisor'
  const isSupervisor = role === 'Supervisor'

  const isEmergency = alert.severity === 'Emergency'
  const isCritical = alert.severity === 'Critical'
  const isHigh = alert.severity === 'High'
  const isWarning = alert.severity === 'Warning'

  const severityColor = isEmergency
    ? 'border-status-red bg-status-red/10 text-status-red'
    : isCritical
    ? 'border-status-orange bg-status-orange/10 text-status-orange'
    : isHigh
    ? 'border-status-yellow bg-status-yellow/10 text-status-yellow'
    : 'border-status-yellow/60 bg-status-yellow/5 text-status-yellow'

  return (
    <div className={`rounded-xl border p-5 transition-all duration-300 ${
      alert.status === 'active'
        ? isEmergency
          ? 'border-status-red bg-[#181818] shadow-lg shadow-status-red/10'
          : 'border-[#272727] bg-[#181818] hover:border-[#313131]'
        : alert.status === 'acknowledged'
        ? 'border-status-yellow/30 bg-[#181818]'
        : 'border-[#272727] bg-[#181818]/60 opacity-80'
    }`}>
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded font-mono text-xs font-semibold border ${severityColor}`}>
            {alert.severity}
          </span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#272727] text-[#FFFFFF]">
            {alert.machine_id}
          </span>
          <span className="font-mono text-[11px] text-text-secondary">
            {alert.id}
          </span>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize border ${
            alert.status === 'active'
              ? 'bg-status-red/20 text-status-red border-status-red/40 animate-pulse'
              : alert.status === 'acknowledged'
              ? 'bg-status-yellow/20 text-status-yellow border-status-yellow/40'
              : 'bg-status-green/20 text-status-green border-status-green/40'
          }`}>
            {alert.status}
          </span>
          <span className="font-mono text-xs text-text-secondary">
            Risk: {alert.risk_score}
          </span>
        </div>
      </div>

      {/* Title & Reason */}
      <div className="space-y-1 mb-4">
        <h3 className="h3 text-[#FFFFFF]">{alert.title}</h3>
        <p className="b3 text-text-secondary leading-relaxed">
          {alert.reason}
        </p>
      </div>

      {/* Metadata & Actions Bottom Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#272727] text-xs">
        <div className="flex items-center gap-3 text-text-secondary flex-wrap">
          <span className="inline-flex items-center gap-1 font-mono">
            <Clock size={13} />
            {formatTimestamp(alert.created_at)}
          </span>
          {alert.acknowledged_by && (
            <span className="font-mono text-[11px]">
              Ack: {alert.acknowledged_by}
            </span>
          )}
          {alert.resolved_by && (
            <span className="font-mono text-[11px]">
              Resolved: {alert.resolved_by}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => onOpenTimeline(alert)}
            className="px-2.5 py-1.5 rounded bg-[#1F1F1F] border border-[#272727] text-text-secondary hover:text-[#FFFFFF] transition-colors inline-flex items-center gap-1 text-xs"
          >
            <ListNumbers size={14} />
            <span>History</span>
          </button>

          {alert.status === 'active' && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              disabled={!isOperatorOrSupervisor}
              title={!isOperatorOrSupervisor ? "Requires Operator or Supervisor role" : ""}
              className={`px-3 py-1.5 rounded font-medium text-xs inline-flex items-center gap-1 transition-all active:scale-[0.98] ${
                isOperatorOrSupervisor
                  ? 'bg-status-yellow text-[#000000] hover:bg-yellow-400'
                  : 'bg-[#272727] text-[#9B9B9B] cursor-not-allowed opacity-60'
              }`}
            >
              <Check size={14} weight="bold" />
              <span>Acknowledge</span>
            </button>
          )}

          {alert.status === 'acknowledged' && (
            <button
              onClick={() => onResolve(alert.id)}
              disabled={!isSupervisor}
              title={!isSupervisor ? "Requires Supervisor role" : ""}
              className={`px-3 py-1.5 rounded font-medium text-xs inline-flex items-center gap-1 transition-all active:scale-[0.98] ${
                isSupervisor
                  ? 'bg-status-green text-[#000000] hover:bg-emerald-400'
                  : 'bg-[#272727] text-[#9B9B9B] cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle size={14} weight="bold" />
              <span>Resolve Alert</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
