import React from 'react'
import { Wrench, CalendarBlank, User, FileText } from '@phosphor-icons/react'
import { formatTimestamp } from '@/lib/format'

export default function MaintenanceLogTable({ records, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-text-secondary bg-[#181818] border border-[#272727] rounded-lg">
        <span className="b3">Loading past service records...</span>
      </div>
    )
  }

  if (!records || records.length === 0) {
    return (
      <div className="p-8 text-center text-text-secondary bg-[#181818] border border-[#272727] rounded-lg">
        <span className="b3">No past maintenance records found for this unit.</span>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#272727] bg-[#181818]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#272727] bg-[#1F1F1F]/50 text-text-secondary">
            <th className="py-3 px-4 l2">Performed Date</th>
            <th className="py-3 px-4 l2">Work Type</th>
            <th className="py-3 px-4 l2">Assigned Technician</th>
            <th className="py-3 px-4 l2">Intervention Summary</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#272727]">
          {records.map((rec) => (
            <tr key={rec.id} className="hover:bg-[#1F1F1F]/40 transition-colors duration-150">
              <td className="py-3 px-4 whitespace-nowrap">
                <div className="inline-flex items-center gap-1.5 text-[#FFFFFF] font-mono b2">
                  <CalendarBlank size={14} className="text-[#9B9B9B]" />
                  {formatTimestamp(rec.performed_on)}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#272727] text-[#FFFFFF] text-xs font-medium">
                  <Wrench size={13} className="text-[#9B9B9B]" />
                  {rec.type}
                </span>
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                <div className="inline-flex items-center gap-1.5 text-text-secondary font-mono b2">
                  <User size={14} className="text-[#9B9B9B]" />
                  {rec.technician_id}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="text-text-secondary b3 max-w-lg">
                  {rec.summary}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
