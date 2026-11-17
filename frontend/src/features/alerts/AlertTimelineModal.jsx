import React, { useState, useEffect } from 'react'
import { X, Clock, ShieldWarning, ArrowRight } from '@phosphor-icons/react'
import { getAlertEvents } from '@/lib/api'
import { formatTimestamp } from '@/lib/format'

export default function AlertTimelineModal({ alert, onClose }) {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!alert) return
    setIsLoading(true)
    getAlertEvents(alert.id)
      .then(data => setEvents(data))
      .catch(err => console.error('Failed to load alert events:', err))
      .finally(() => setIsLoading(false))
  }, [alert])

  if (!alert) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#272727] bg-[#181818] shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#272727] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#272727] text-[#FFFFFF]">
                {alert.id}
              </span>
              <span className="text-xs text-text-secondary font-mono">{alert.machine_id}</span>
            </div>
            <h3 className="h3 text-[#FFFFFF] mt-1 truncate max-w-sm">{alert.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-[#FFFFFF] hover:bg-[#272727] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Timeline Events List */}
        <div className="overflow-y-auto space-y-3 flex-1 pr-1">
          {isLoading ? (
            <div className="p-8 text-center text-text-secondary text-sm">
              Loading alert timeline events...
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-sm">
              No lifecycle events recorded for this alert.
            </div>
          ) : (
            events.map((ev, idx) => (
              <div
                key={ev.id || idx}
                className="relative pl-6 pb-3 border-l-2 border-[#272727] last:border-transparent space-y-1"
              >
                {/* Node dot */}
                <div className={`absolute -left-[7px] top-0.5 w-3 h-3 rounded-full border-2 border-[#181818] ${
                  ev.event === 'created'
                    ? 'bg-status-red'
                    : ev.event === 'escalated'
                    ? 'bg-status-orange'
                    : ev.event === 'acknowledged'
                    ? 'bg-status-yellow'
                    : 'bg-status-green'
                }`} />

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-[#FFFFFF] capitalize">
                    <span>{ev.event}</span>
                    {ev.from_severity && (
                      <span className="text-text-secondary text-[11px] font-mono">
                        ({ev.from_severity} → {ev.to_severity})
                      </span>
                    )}
                  </div>
                  <span className="text-text-secondary font-mono text-[11px]">
                    {formatTimestamp(ev.ts)}
                  </span>
                </div>

                <div className="text-xs text-text-secondary leading-normal">
                  {ev.note || `Action executed by ${ev.actor}`}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#272727] pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-3 rounded bg-[#272727] text-xs font-medium text-[#FFFFFF] hover:bg-[#313131] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
