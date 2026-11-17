import React from 'react'
import { useSelectedMachine } from '@/providers/SelectedMachineProvider'
import { Warning, CheckCircle, ArrowRight } from '@phosphor-icons/react'

export default function DependencyGraphSvg({ nodes = [], edges = [], rootCauseId }) {
  const { selectedMachineId, selectMachine } = useSelectedMachine()

  // Node position coordinates for SVG
  const nodePositions = {
    MCH001: { x: 80, y: 50, width: 220, height: 140 },
    MCH002: { x: 380, y: 50, width: 220, height: 140 },
    MCH003: { x: 680, y: 50, width: 220, height: 140 },
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#272727] bg-[#181818] p-6">
      <div className="min-w-[920px]">
        <svg viewBox="0 0 980 240" className="w-full h-auto">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#9B9B9B" />
            </marker>
            <marker
              id="arrowhead-active"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#EAB308" />
            </marker>
          </defs>

          {/* Connection Arrows / Edges */}
          {/* MCH001 -> MCH002 */}
          <line
            x1="300"
            y1="120"
            x2="372"
            y2="120"
            stroke="#9B9B9B"
            strokeWidth="2"
            strokeDasharray="4 4"
            markerEnd="url(#arrowhead)"
            className="animate-pulse"
          />
          <text x="340" y="105" fill="#9B9B9B" fontSize="11" textAnchor="middle" fontFamily="monospace">
            1.0x flow
          </text>

          {/* MCH002 -> MCH003 */}
          <line
            x1="600"
            y1="120"
            x2="672"
            y2="120"
            stroke="#9B9B9B"
            strokeWidth="2"
            strokeDasharray="4 4"
            markerEnd="url(#arrowhead)"
            className="animate-pulse"
          />
          <text x="640" y="105" fill="#9B9B9B" fontSize="11" textAnchor="middle" fontFamily="monospace">
            1.0x flow
          </text>

          {/* Machine Nodes rendered as foreignObjects for rich HTML & tailwind styling */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id] || { x: 80, y: 50, width: 220, height: 140 }
            const isSelected = selectedMachineId === node.id
            const isRootCause = rootCauseId === node.id && node.health_score < 90

            return (
              <foreignObject
                key={node.id}
                x={pos.x}
                y={pos.y}
                width={pos.width}
                height={pos.height}
              >
                <div
                  onClick={() => selectMachine(node.id)}
                  className={`h-full w-full rounded-xl border p-3 flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-[#FFFFFF] bg-[#1F1F1F] shadow-lg shadow-white/5'
                      : isRootCause
                      ? 'border-status-red bg-status-red/10'
                      : 'border-[#272727] bg-[#131209] hover:border-[#313131]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#272727] text-[#FFFFFF]">
                          {node.id}
                        </span>
                        <span className="text-[11px] text-text-secondary uppercase">
                          {node.role_in_line}
                        </span>
                      </div>
                      <div className="text-[#FFFFFF] text-xs font-semibold mt-1 truncate max-w-[130px]">
                        {node.name}
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium border ${
                      node.severity === 'Normal'
                        ? 'bg-status-green/10 text-status-green border-status-green/30'
                        : 'bg-status-red/10 text-status-red border-status-red/30'
                    }`}>
                      {node.severity}
                    </span>
                  </div>

                  {/* Throughput & Health */}
                  <div className="grid grid-cols-2 gap-2 my-1 pt-1.5 border-t border-[#272727]">
                    <div>
                      <div className="text-[10px] text-text-secondary">Effective</div>
                      <div className="font-mono text-sm font-semibold text-[#FFFFFF]">
                        {node.effective_uph} <span className="text-[10px] font-normal text-text-secondary">UPH</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-text-secondary">Health</div>
                      <div className={`font-mono text-sm font-semibold ${
                        node.health_score < 70
                          ? 'text-status-red'
                          : node.health_score < 90
                          ? 'text-status-yellow'
                          : 'text-status-green'
                      }`}>
                        {Math.round(node.health_score)}%
                      </div>
                    </div>
                  </div>

                  {/* Root cause or starvation pill */}
                  <div>
                    {isRootCause ? (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-status-red text-white text-[10px] font-semibold w-full justify-center">
                        <Warning size={12} weight="bold" />
                        <span>Root Cause Bottleneck</span>
                      </div>
                    ) : node.starved_by ? (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-status-yellow/20 text-status-yellow text-[10px] font-medium w-full justify-center">
                        <ArrowRight size={12} />
                        <span>Starved by {node.starved_by}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 text-text-secondary text-[10px] w-full justify-center">
                        <CheckCircle size={12} className="text-status-green" />
                        <span>Operating Nominal</span>
                      </div>
                    )}
                  </div>
                </div>
              </foreignObject>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
