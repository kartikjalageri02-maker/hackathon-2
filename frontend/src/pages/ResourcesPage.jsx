import React, { useState, useEffect } from 'react'
import {
  Package,
  Users,
  Wrench,
  CheckCircle,
  Warning,
  ArrowsClockwise
} from '@phosphor-icons/react'
import {
  getSpareParts,
  getTechnicians,
  getRecommendations,
  approveRecommendation
} from '@/lib/api'
import { useDemoRole } from '@/providers/DemoRoleProvider'
import SparePartsTable from '@/features/resources/SparePartsTable'
import TechniciansRoster from '@/features/resources/TechniciansRoster'
import WorkOrderRecommendationCard from '@/features/resources/WorkOrderRecommendationCard'
import { MetricCard } from '@/components/shared/MetricCard'
import { toast } from 'sonner'

export default function ResourcesPage() {
  const { role } = useDemoRole()

  const [parts, setParts] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [approvingId, setApprovingId] = useState(null)
  const [activeTab, setActiveTab] = useState('recommendations') // recommendations, parts, technicians

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [partsData, techsData, recsData] = await Promise.all([
        getSpareParts().catch(() => []),
        getTechnicians().catch(() => []),
        getRecommendations().catch(() => [])
      ])
      setParts(partsData)
      setTechnicians(techsData)
      setRecommendations(recsData)
    } catch (err) {
      console.error('Failed to load resource data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, 8000)
    return () => clearInterval(timer)
  }, [])

  const handleApprove = async (id) => {
    setApprovingId(id)
    try {
      const res = await approveRecommendation(id)
      toast.success(`Work order ${res.task_id} approved! Technician ${res.assigned_technician} dispatched.`)
      fetchData()
    } catch (err) {
      toast.error(err.message || 'Failed to approve recommendation')
    } finally {
      setApprovingId(null)
    }
  }

  const outOfStockCount = parts.filter(p => p.quantity === 0).length
  const lowStockCount = parts.filter(p => p.quantity > 0 && p.quantity <= p.reorder_level).length
  const availableTechsCount = technicians.filter(t => t.availability === 'Available').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4 rounded-3xl bg-resources-matrix min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1F1F1F] text-text-secondary border border-white/10">
              MODULE 7
            </span>
            <span className="c1 text-text-secondary font-mono">Prescriptive Resource Dispatch</span>
          </div>
          <h1 className="h2 text-[#FFFFFF] text-balance">Spare Parts, Technicians & Work Orders</h1>
          <p className="b2 text-text-secondary text-pretty mt-1">
            Explainable decision support with parts inventory, certified staff dispatch, and alternative contingency planning.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start md:self-auto p-2 rounded-lg glossy-btn text-white transition-all"
          title="Refresh resources"
        >
          <ArrowsClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Recommendations"
          value={recommendations.length.toString()}
          subtitle="Awaiting authorization"
          valueClassName={recommendations.length > 0 ? "text-status-yellow" : "text-[#FFFFFF]"}
          icon={<Wrench size={20} className={recommendations.length > 0 ? "text-status-yellow" : "text-[#9B9B9B]"} />}
        />
        <MetricCard
          title="Available Technicians"
          value={`${availableTechsCount} / ${technicians.length}`}
          subtitle="On shift & ready"
          valueClassName={availableTechsCount > 0 ? "text-status-green" : "text-status-red"}
          icon={<Users size={20} className={availableTechsCount > 0 ? "text-status-green" : "text-[#9B9B9B]"} />}
        />
        <MetricCard
          title="Stock-Out Items"
          value={outOfStockCount.toString()}
          subtitle="Requiring alternatives"
          valueClassName={outOfStockCount > 0 ? "text-status-red" : "text-status-green"}
          icon={<Package size={20} className={outOfStockCount > 0 ? "text-status-red" : "text-[#9B9B9B]"} />}
        />
        <MetricCard
          title="Low Stock Warning"
          value={lowStockCount.toString()}
          subtitle="Below reorder threshold"
          valueClassName={lowStockCount > 0 ? "text-status-yellow" : "text-[#FFFFFF]"}
          icon={<Warning size={20} className={lowStockCount > 0 ? "text-status-yellow" : "text-[#9B9B9B]"} />}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'recommendations'
              ? 'bg-white/15 text-[#FFFFFF] shadow-sm'
              : 'text-text-secondary hover:text-[#FFFFFF]'
          }`}
        >
          Prescriptive Work Orders ({recommendations.length})
        </button>
        <button
          onClick={() => setActiveTab('parts')}
          className={`py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'parts'
              ? 'bg-white/15 text-[#FFFFFF] shadow-sm'
              : 'text-text-secondary hover:text-[#FFFFFF]'
          }`}
        >
          Spare Parts Catalog ({parts.length})
        </button>
        <button
          onClick={() => setActiveTab('technicians')}
          className={`py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'technicians'
              ? 'bg-white/15 text-[#FFFFFF] shadow-sm'
              : 'text-text-secondary hover:text-[#FFFFFF]'
          }`}
        >
          Maintenance Staff Roster ({technicians.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'recommendations' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="h3 text-[#FFFFFF]">Prescribed Actions & Resource Allocations</h2>
            <span className="c1 text-text-secondary">
              Generated from physical symptoms and downstream bottlenecks
            </span>
          </div>

          {recommendations.length === 0 ? (
            <div className="p-12 text-center text-text-secondary bg-[#181818] border border-[#272727] rounded-xl">
              <CheckCircle size={32} className="mx-auto mb-2 text-status-green" />
              <h3 className="h3 text-[#FFFFFF]">Zero Active Maintenance Interventions</h3>
              <p className="b3 text-text-secondary mt-1 max-w-sm mx-auto">
                All production line stations are operating within healthy parameters. No corrective work orders required.
              </p>
            </div>
          ) : (
            recommendations.map(rec => (
              <WorkOrderRecommendationCard
                key={rec.id}
                recommendation={rec}
                onApprove={handleApprove}
                isApproving={approvingId === rec.id}
              />
            ))
          )}
        </div>
      ) : activeTab === 'parts' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="h3 text-[#FFFFFF]">Spare Parts Inventory & Alternatives</h2>
            <span className="c1 text-text-secondary">
              Includes lead time tracking and direct substitute mappings
            </span>
          </div>
          <SparePartsTable parts={parts} isLoading={isLoading} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="h3 text-[#FFFFFF]">Certified Field Technicians Roster</h2>
            <span className="c1 text-text-secondary">
              Shift availability and station qualifications
            </span>
          </div>
          <TechniciansRoster technicians={technicians} isLoading={isLoading} />
        </div>
      )}
    </div>
  )
}
