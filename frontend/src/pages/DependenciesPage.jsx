import React, { useState, useEffect } from 'react'
import {
  Graph,
  ArrowsClockwise,
  FlowArrow,
  SlidersHorizontal
} from '@phosphor-icons/react'
import { getDependencyImpact } from '@/lib/api'
import DependencyGraphSvg from '@/features/dependencies/DependencyGraphSvg'
import BottleneckSummary from '@/features/dependencies/BottleneckSummary'

export default function DependenciesPage() {
  const [impact, setImpact] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const data = await getDependencyImpact()
      setImpact(data)
    } catch (err) {
      console.error('Failed to load dependency impact:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#272727] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1F1F1F] text-text-secondary border border-[#272727]">
              MODULE 5
            </span>
            <span className="c1 text-text-secondary font-mono">NetworkX Topology DiGraph</span>
          </div>
          <h1 className="h2 text-[#FFFFFF] text-balance">Dependency Graph & Production Impact</h1>
          <p className="b2 text-text-secondary text-pretty mt-1">
            Upstream starvation propagation, line exit bottleneck identification, and gross production loss.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start md:self-auto p-2 rounded bg-[#1F1F1F] border border-[#272727] text-text-secondary hover:text-[#FFFFFF] hover:border-[#313131] transition-all"
          title="Refresh dependencies"
        >
          <ArrowsClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Handcrafted Line Flow Diagram */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlowArrow size={18} className="text-[#9B9B9B]" />
            <h2 className="h3 text-[#FFFFFF]">Synchronous Line Topology & Material Flow</h2>
          </div>
          <span className="c1 text-text-secondary">Click machine card to select</span>
        </div>

        <DependencyGraphSvg
          nodes={impact?.nodes || []}
          edges={impact?.edges || []}
          rootCauseId={impact?.root_cause_machine_id}
        />
      </div>

      {/* Bottleneck & Impact Calculations */}
      <BottleneckSummary impact={impact} />
    </div>
  )
}
