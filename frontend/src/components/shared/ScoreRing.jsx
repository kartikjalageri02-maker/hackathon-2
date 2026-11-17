import React from "react"
import { cn } from "@/lib/utils"

export function ScoreRing({ score = 100, size = 80, strokeWidth = 6, label = "Health" }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const strokeDashoffset = circumference - (clamped / 100) * circumference

  let strokeColor = "#10B981" // emerald
  if (clamped < 60) {
    strokeColor = "#F43F5E" // critical red
  } else if (clamped < 80) {
    strokeColor = "#F59E0B" // warning amber
  }

  return (
    <div className="relative inline-flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#272727"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="title-2 font-mono font-semibold text-white">{Math.round(clamped)}</span>
        {label && <span className="caption-5 text-[#9B9B9B] uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  )
}
