import React from "react"
import { cn } from "@/lib/utils"

export function MetricCard({ title, value, unit, change, status, icon, subtitle, className }) {
  return (
    <div
      className={cn(
        "glossy-card p-4 flex flex-col justify-between shadow-lg",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="title-4 text-[#9B9B9B]">{title}</span>
        {icon && <span className="text-[#9B9B9B] shrink-0">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="heading-3 font-mono text-white tracking-tight">{value}</span>
        {unit && <span className="caption-3 font-mono text-[#9B9B9B]">{unit}</span>}
      </div>

      {(subtitle || change) && (
        <div className="mt-2 flex items-center justify-between caption-4 text-[#9B9B9B]">
          {subtitle && <span>{subtitle}</span>}
          {change && <span className={cn(change.startsWith("+") ? "text-emerald-400" : "text-amber-400")}>{change}</span>}
        </div>
      )}
    </div>
  )
}
