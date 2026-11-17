import React from "react"
import { ResponsiveContainer, LineChart, Line, YAxis, ReferenceLine, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

export function SensorChartCard({
  sensorKey,
  label,
  unit,
  currentValue,
  thresholds,
  historyData = [],
  onInjectSpike,
}) {
  const warnThresh = thresholds?.warning
  const critThresh = thresholds?.critical
  const normHigh = thresholds?.normal_high

  // Determine current threshold grading
  let status = "Normal"
  let statusBadgeClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
  if (critThresh && currentValue >= critThresh) {
    status = "Critical"
    statusBadgeClass = "text-rose-400 bg-rose-500/10 border-rose-500/30"
  } else if (warnThresh && currentValue >= warnThresh) {
    status = "Warning"
    statusBadgeClass = "text-amber-400 bg-amber-500/10 border-amber-500/30"
  }

  // Format Y-axis domain
  const values = historyData.map((d) => d[sensorKey]).filter((v) => typeof v === "number")
  const minVal = values.length ? Math.min(...values) : (thresholds?.normal_low || 0)
  const maxVal = values.length ? Math.max(...values, critThresh || 0) : (critThresh || 100)
  const padding = (maxVal - minVal) * 0.15 || 2.0
  const yDomain = [Math.max(0, Math.floor(minVal - padding)), Math.ceil(maxVal + padding)]

  return (
    <div className="bg-[#181818] border border-[#313131] rounded-xl p-4 flex flex-col justify-between transition-colors duration-300 hover:border-[#444444]">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="title-4 text-[#9B9B9B]">{label}</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="heading-4 font-mono text-white font-semibold">
              {typeof currentValue === "number" ? currentValue : "--"}
            </span>
            <span className="caption-3 font-mono text-[#9B9B9B]">{unit}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn("caption-4 px-2 py-0.5 rounded border font-medium", statusBadgeClass)}>
            {status}
          </span>
          {onInjectSpike && (
            <button
              onClick={() => onInjectSpike(sensorKey)}
              title={`Trigger abnormal spike on ${label}`}
              className="p-1 rounded hover:bg-[#272727] text-[#9B9B9B] hover:text-white transition-colors"
            >
              <span className="caption-4">+Spike</span>
            </button>
          )}
        </div>
      </div>

      {/* Small Multiples Telemetry Chart */}
      <div className="h-28 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 10, fill: "#9B9B9B", fontFamily: "Geist Mono Variable" }}
              stroke="#313131"
              tickLine={false}
              width={35}
            />
            {warnThresh && (
              <ReferenceLine
                y={warnThresh}
                stroke="#F59E0B"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            )}
            {critThresh && (
              <ReferenceLine
                y={critThresh}
                stroke="#F43F5E"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            )}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value
                  return (
                    <div className="bg-[#1F1F1F] border border-[#313131] px-2 py-1 rounded caption-4 font-mono text-white shadow-xl">
                      {val} {unit}
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey={sensorKey}
              stroke="#FFFFFF"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false} // Prevent layout jitter during live 1s updates
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Threshold Reference Footer */}
      <div className="mt-2 pt-2 border-t border-[#313131] flex items-center justify-between caption-5 text-[#9B9B9B] font-mono">
        <span>Norm: {thresholds?.normal_low} to {normHigh}</span>
        <span className="text-amber-400">Warn: {warnThresh}</span>
        <span className="text-rose-400">Crit: {critThresh}</span>
      </div>
    </div>
  )
}
