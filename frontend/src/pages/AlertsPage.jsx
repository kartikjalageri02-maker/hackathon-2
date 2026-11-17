import React, { useState, useEffect } from 'react'
import {
  ShieldWarning,
  Warning,
  CheckCircle,
  BellSimpleRinging,
  ArrowsClockwise,
  Funnel
} from '@phosphor-icons/react'
import { getAlerts, acknowledgeAlert, resolveAlert } from '@/lib/api'
import { useLiveData } from '@/providers/LiveDataProvider'
import { useDemoRole } from '@/providers/DemoRoleProvider'
import AlertCard from '@/features/alerts/AlertCard'
import AlertTimelineModal from '@/features/alerts/AlertTimelineModal'
import { MetricCard } from '@/components/shared/MetricCard'
import { toast } from 'sonner'
import { alarmEngine } from '@/lib/alarm'

export default function AlertsPage() {
  const { role } = useDemoRole()
  const { latestAnalysis } = useLiveData()

  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAlertForTimeline, setSelectedAlertForTimeline] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all') // all, active, acknowledged, resolved
  const [severityFilter, setSeverityFilter] = useState('all') // all, Emergency, Critical, High, Warning

  const fetchAlertData = async () => {
    setIsLoading(true)
    try {
      const data = await getAlerts()
      setAlerts(data)
    } catch (err) {
      console.error('Failed to load alerts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAlertData()
    const timer = setInterval(fetchAlertData, 5000)
    return () => clearInterval(timer)
  }, [])

  // Emergency Alarm Sound management: check if any alert is active Emergency
  useEffect(() => {
    const hasActiveEmergency = alerts.some(
      a => a.status === 'active' && (a.severity === 'Emergency' || a.severity === 'Critical')
    )
    if (hasActiveEmergency) {
      alarmEngine.startAlarm()
    } else {
      alarmEngine.stopAlarm()
    }
  }, [alerts])

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAlert(id)
      toast.success(`Alert ${id} acknowledged`)
      alarmEngine.stopAlarm()
      fetchAlertData()
    } catch (err) {
      toast.error(err.message || 'Failed to acknowledge alert')
    }
  }

  const handleResolve = async (id) => {
    try {
      await resolveAlert(id)
      toast.success(`Alert ${id} resolved successfully`)
      fetchAlertData()
    } catch (err) {
      toast.error(err.message || 'Failed to resolve alert')
    }
  }

  // Filtering
  const filteredAlerts = alerts.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false
    return true
  })

  const activeCount = alerts.filter(a => a.status === 'active').length
  const criticalCount = alerts.filter(a => (a.severity === 'Critical' || a.severity === 'Emergency') && a.status === 'active').length
  const ackCount = alerts.filter(a => a.status === 'acknowledged').length
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#272727] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1F1F1F] text-text-secondary border border-[#272727]">
              MODULE 6
            </span>
            <span className="c1 text-text-secondary font-mono">Central Alarm Dispatch</span>
          </div>
          <h1 className="h2 text-[#FFFFFF] text-balance">Alerts & Emergency Response Center</h1>
          <p className="b2 text-text-secondary text-pretty mt-1">
            Hysteresis-based severity state machine, in-place escalation, and role-enforced incident remediation.
          </p>
        </div>

        <button
          onClick={fetchAlertData}
          className="self-start md:self-auto p-2 rounded bg-[#1F1F1F] border border-[#272727] text-text-secondary hover:text-[#FFFFFF] hover:border-[#313131] transition-all"
          title="Refresh alerts"
        >
          <ArrowsClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Alerts"
          value={activeCount.toString()}
          subtitle="Requiring response"
          valueClassName={activeCount > 0 ? "text-status-red" : "text-status-green"}
          icon={<BellSimpleRinging size={20} className={activeCount > 0 ? "text-status-red" : "text-status-green"} />}
        />
        <MetricCard
          title="Critical / Emergency"
          value={criticalCount.toString()}
          subtitle="Immediate hazard"
          valueClassName={criticalCount > 0 ? "text-status-red" : "text-[#FFFFFF]"}
          icon={<Warning size={20} className={criticalCount > 0 ? "text-status-red" : "text-[#9B9B9B]"} />}
        />
        <MetricCard
          title="Acknowledged"
          value={ackCount.toString()}
          subtitle="Technician dispatched"
          valueClassName={ackCount > 0 ? "text-status-yellow" : "text-[#FFFFFF]"}
          icon={<ShieldWarning size={20} className={ackCount > 0 ? "text-status-yellow" : "text-[#9B9B9B]"} />}
        />
        <MetricCard
          title="Resolved Records"
          value={resolvedCount.toString()}
          subtitle="Cleared from queue"
          valueClassName="text-[#FFFFFF]"
          icon={<CheckCircle size={20} className="text-status-green" />}
        />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-lg bg-[#181818] border border-[#272727]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-text-secondary font-mono mr-1">Status:</span>
          {['all', 'active', 'acknowledged', 'resolved'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#FFFFFF] text-[#000000]'
                  : 'bg-[#272727] text-text-secondary hover:text-[#FFFFFF]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-text-secondary font-mono mr-1">Severity:</span>
          {['all', 'Emergency', 'Critical', 'High', 'Warning'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-[#FFFFFF] text-[#000000]'
                  : 'bg-[#272727] text-text-secondary hover:text-[#FFFFFF]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {isLoading && alerts.length === 0 ? (
          <div className="p-12 text-center text-text-secondary bg-[#181818] border border-[#272727] rounded-xl">
            <ArrowsClockwise size={24} className="animate-spin mx-auto mb-2 text-[#9B9B9B]" />
            <span className="b3">Checking alarm telemetry status...</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-text-secondary bg-[#181818] border border-[#272727] rounded-xl">
            <CheckCircle size={32} className="mx-auto mb-2 text-status-green" />
            <h3 className="h3 text-[#FFFFFF]">No Matching Alerts in Queue</h3>
            <p className="b3 text-text-secondary mt-1 max-w-sm mx-auto">
              All machines operating nominally or filter criteria did not match any stored records.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
              onOpenTimeline={setSelectedAlertForTimeline}
            />
          ))
        )}
      </div>

      {/* Modal for Event History */}
      {selectedAlertForTimeline && (
        <AlertTimelineModal
          alert={selectedAlertForTimeline}
          onClose={() => setSelectedAlertForTimeline(null)}
        />
      )}
    </div>
  )
}
