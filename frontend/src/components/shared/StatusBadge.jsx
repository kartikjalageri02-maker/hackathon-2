import React from "react"
import { getSeverityConfig } from "@/lib/severity"
import { cn } from "@/lib/utils"

export function StatusBadge({ status = "Normal", className }) {
  const config = getSeverityConfig(status)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border",
        config.bgClass,
        config.borderClass,
        config.textClass,
        "caption-3",
        className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  )
}
