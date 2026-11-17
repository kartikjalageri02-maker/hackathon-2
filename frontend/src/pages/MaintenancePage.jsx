import React, { useState, useEffect } from 'react'
import {
  Wrench,
  ClockAfternoon,
  Warning,
  CheckCircle,
  Plus,
  ArrowRight,
  ArrowsClockwise
} from '@phosphor-icons/react'
import { useSelectedMachine } from '@/providers/SelectedMachineProvider'
import { useDemoRole } from '@/providers/DemoRoleProvider'
import { getMachineComponents, getMachineMaintenanceHistory, getMaintenanceOverview } from '@/lib/api'
import ComponentLifecycleTable from '@/features/maintenance/ComponentLifecycleTable'
import MaintenanceLogTable from '@/features/maintenance/MaintenanceLogTable'
import { MetricCard } from '@/components/shared/MetricCard'
import { toast } from 'sonner'

export default function MaintenancePage() {
  const { selectedMachineId, selectMachine } = useSelectedMachine()
  const { role } = useDemoRole()

  const [overview, setOverview] = useState(null)
  const [components, setComponents] = useState([])
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('components') // 'components' | 'history'

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [overviewData, compData, histData] = await Promise.all([
        getMaintenanceOverview().catch(() => null),
        getMachineComponents(selectedMachineId).catch(() => []),
        getMachineMaintenanceHistory(selectedMachineId).catch(() => [])
      ])
      setOverview(overviewData)
      setComponents(compData)
      setRecords(histData)
    } catch (err) {
      console.error('Failed to load maintenance data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, 8000)
    return () => clearInterval(timer)
  }, [selectedMachineId])

  const earlyDetCount = components.filter(c => c.early_deterioration).length
  const dueCount = components.filter(c => c.flag_replacement_due).length
  const overdueCount = components.filter(c => c.inspection_overdue).length

  const handleCreateTask = () => {
    if (role === 'Viewer') {
      toast.error('Viewer role cannot create maintenance orders. Switch to Operator or Supervisor.')
      return
    }
    toast.success(`Preventive maintenance ticket created for ${selectedMachineId}`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#272727] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1F1F1F] text-text-secondary border border-[#272727]">
              MODULE 4
            </span>
            <span className="c1 text-text-secondary font-mono">{selectedMachineId}</span>
          </div>
          <h1 className="h2 text-[#FFFFFF] text-balance">Lifecycle & Predictive Maintenance</h1>
          <p className="b2 text-text-secondary text-pretty mt-1">
            Component wear telemetry, calendar vs effective remaining useful life, and service history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded bg-[#1F1F1F] border border-[#272727] text-text-secondary hover:text-[#FFFFFF] hover:border-[#313131] transition-all"
            title="Refresh telemetry"
          >
            <ArrowsClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleCreateTask}
            className="inline-flex items-center gap-2 py-2 px-3 rounded bg-[#FFFFFF] text-[#000000] b3 font-medium hover:bg-neutral-200 transition-all active:scale-[0.98]"
          >
            <Plus size={16} weight="bold" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tracked Components"
          value={components.length.toString()}
          subtitle={`${overview?.total_tracked_components || 12} across production line`}
          icon={<Wrench size={20} className="text-[#9B9B9B]" />}
        />
        <MetricCard
          title="Early Deterioration"
          value={earlyDetCount.toString()}
          subtitle={earlyDetCount > 0 ? "Sensor stressed vs calendar" : "Sensors match calendar"}
          valueClassName={earlyDetCount > 0 ? "text-status-orange" : "text-status-green"}
          icon={<Warning size={20} className={earlyDetCount > 0 ? "text-status-orange" : "text-[#9B9B9B]"} />}
        />
        <MetricCard
          title="Due for Replacement"
          value={dueCount.toString()}
          subtitle="Remaining life <= 30 days"
          valueClassName={dueCount > 0 ? "text-status-red" : "text-[#FFFFFF]"}
          icon={<ClockAfternoon size={20} className={dueCount > 0 ? "text-status-red" : "text-[#9B9B9B]"} />}
        />
        <MetricCard
          title="Overdue Inspections"
          value={overdueCount.toString()}
          subtitle="Exceeded service interval"
          valueClassName={overdueCount > 0 ? "text-status-yellow" : "text-[#FFFFFF]"}
          icon={<Warning size={20} className={overdueCount > 0 ? "text-status-yellow" : "text-[#9B9B9B]"} />}
        />
      </div>

      {/* Tabs / Section Switcher */}
      <div className="flex items-center gap-2 border-b border-[#272727] pb-2">
        <button
          onClick={() => setActiveTab('components')}
          className={`py-1.5 px-3 rounded text-sm font-medium transition-colors ${
            activeTab === 'components'
              ? 'bg-[#272727] text-[#FFFFFF]'
              : 'text-text-secondary hover:text-[#FFFFFF]'
          }`}
        >
          Component Lifecycle & Telemetry ({components.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-1.5 px-3 rounded text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-[#272727] text-[#FFFFFF]'
              : 'text-text-secondary hover:text-[#FFFFFF]'
          }`}
        >
          Past Maintenance Records ({records.length})
        </button>
      </div>

      {/* Content Body */}
      {activeTab === 'components' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="h3 text-[#FFFFFF]">Sub-assemblies & Remaining Useful Life</h2>
            <span className="c1 text-text-secondary">
              Updated from real time sensor telemetry
            </span>
          </div>
          <ComponentLifecycleTable components={components} isLoading={isLoading} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="h3 text-[#FFFFFF]">Historical Interventions & Service Log</h2>
            <span className="c1 text-text-secondary">
              Logged records for {selectedMachineId}
            </span>
          </div>
          <MaintenanceLogTable records={records} isLoading={isLoading} />
        </div>
      )}
    </div>
  )
}
