import React from 'react'
import { Package, Warning, CheckCircle, Clock } from '@phosphor-icons/react'

export default function SparePartsTable({ parts = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-text-secondary bg-[#181818] border border-[#272727] rounded-lg">
        <span className="b3">Loading inventory catalog...</span>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#272727] bg-[#181818]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#272727] bg-[#1F1F1F]/50 text-text-secondary">
            <th className="py-3 px-4 l2">Part Item</th>
            <th className="py-3 px-4 l2">On Hand Stock</th>
            <th className="py-3 px-4 l2">Reorder Level</th>
            <th className="py-3 px-4 l2">Lead Time</th>
            <th className="py-3 px-4 l2">Alternative Substitute</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#272727]">
          {parts.map((p) => {
            const isOutOfStock = p.quantity === 0
            const isLowStock = p.quantity <= p.reorder_level && !isOutOfStock

            return (
              <tr key={p.id} className="hover:bg-[#1F1F1F]/40 transition-colors duration-150">
                <td className="py-3 px-4">
                  <div className="text-[#FFFFFF] b2 font-medium">{p.name}</div>
                  <div className="text-text-secondary c1 font-mono">{p.id}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="inline-flex items-center gap-1.5">
                    <span className={`font-mono b2 font-semibold ${
                      isOutOfStock
                        ? 'text-status-red'
                        : isLowStock
                        ? 'text-status-yellow'
                        : 'text-status-green'
                    }`}>
                      {p.quantity}
                    </span>
                    <span className="text-text-secondary c1">units</span>
                    {isOutOfStock ? (
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-status-red/20 text-status-red text-[11px] font-mono border border-status-red/40">
                        Out of stock
                      </span>
                    ) : isLowStock ? (
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-status-yellow/20 text-status-yellow text-[11px] font-mono border border-status-yellow/40">
                        Low stock
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-text-secondary font-mono b2">
                    {p.reorder_level} <span className="c1">min</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="inline-flex items-center gap-1 text-[#FFFFFF] font-mono b2">
                    <Clock size={13} className="text-[#9B9B9B]" />
                    <span>{p.lead_time_days} days</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {p.alternative_part_id ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#272727] text-text-secondary text-xs font-mono border border-[#313131]">
                      {p.alternative_part_id}
                    </span>
                  ) : (
                    <span className="text-text-secondary text-xs font-mono">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
