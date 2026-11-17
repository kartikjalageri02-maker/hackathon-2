import React from 'react'
import { User, CheckCircle, Clock, Wrench } from '@phosphor-icons/react'

export default function TechniciansRoster({ technicians = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-text-secondary bg-[#181818] border border-[#272727] rounded-lg">
        <span className="b3">Loading technician roster...</span>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#272727] bg-[#181818]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#272727] bg-[#1F1F1F]/50 text-text-secondary">
            <th className="py-3 px-4 l2">Technician</th>
            <th className="py-3 px-4 l2">Specialisation</th>
            <th className="py-3 px-4 l2">Shift</th>
            <th className="py-3 px-4 l2">Availability</th>
            <th className="py-3 px-4 l2">Station Certifications</th>
            <th className="py-3 px-4 l2">Active Assignment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#272727]">
          {technicians.map((t) => {
            const isAvailable = t.availability === 'Available'
            const isOnDuty = t.availability === 'On Duty'

            return (
              <tr key={t.id} className="hover:bg-[#1F1F1F]/40 transition-colors duration-150">
                <td className="py-3 px-4">
                  <div className="text-[#FFFFFF] b2 font-medium">{t.name}</div>
                  <div className="text-text-secondary c1 font-mono">{t.id}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#131209] border border-[#272727] text-xs text-[#FFFFFF]">
                    <Wrench size={12} className="text-[#9B9B9B]" />
                    {t.specialisation}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-[#FFFFFF] text-xs font-medium">
                    {t.shift} Shift
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                    isAvailable
                      ? 'bg-status-green/10 text-status-green border-status-green/30'
                      : isOnDuty
                      ? 'bg-status-yellow/10 text-status-yellow border-status-yellow/30'
                      : 'bg-[#272727] text-text-secondary border-transparent'
                  }`}>
                    {isAvailable && <CheckCircle size={12} />}
                    {isOnDuty && <Clock size={12} />}
                    <span>{t.availability}</span>
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {t.qualifications && t.qualifications.length > 0 ? (
                      t.qualifications.map((q, qIdx) => (
                        <span
                          key={qIdx}
                          className="px-1.5 py-0.5 rounded bg-[#272727] text-[11px] font-mono text-text-secondary"
                        >
                          {q.machine_id || q.machine_type} L{q.level}
                        </span>
                      ))
                    ) : (
                      <span className="text-text-secondary text-xs">General Maintenance</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {t.current_task_id ? (
                    <span className="font-mono text-xs text-status-yellow">
                      {t.current_task_id}
                    </span>
                  ) : (
                    <span className="text-text-secondary text-xs font-mono">Unassigned</span>
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
