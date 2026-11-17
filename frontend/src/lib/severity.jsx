import React from "react"
import { CheckCircle, Warning, WarningCircle, WarningOctagon, ShieldWarning } from "@phosphor-icons/react"

export function getSeverityConfig(severity = "Normal") {
  const norm = severity.toLowerCase()

  switch (norm) {
    case "emergency":
      return {
        label: "Emergency",
        bgClass: "bg-red-600/20",
        borderClass: "border-red-600",
        textClass: "text-red-400",
        solidBg: "bg-red-600",
        colorHex: "#DC2626",
        icon: <ShieldWarning className="size-4 text-red-400 shrink-0" weight="fill" />
      }
    case "critical":
      return {
        label: "Critical",
        bgClass: "bg-rose-500/20",
        borderClass: "border-rose-500",
        textClass: "text-rose-400",
        solidBg: "bg-rose-500",
        colorHex: "#F43F5E",
        icon: <WarningOctagon className="size-4 text-rose-400 shrink-0" weight="fill" />
      }
    case "high":
      return {
        label: "High",
        bgClass: "bg-orange-500/20",
        borderClass: "border-orange-500",
        textClass: "text-orange-400",
        solidBg: "bg-orange-500",
        colorHex: "#F97316",
        icon: <WarningCircle className="size-4 text-orange-400 shrink-0" weight="fill" />
      }
    case "warning":
      return {
        label: "Warning",
        bgClass: "bg-amber-500/20",
        borderClass: "border-amber-500",
        textClass: "text-amber-400",
        solidBg: "bg-amber-500",
        colorHex: "#F59E0B",
        icon: <Warning className="size-4 text-amber-400 shrink-0" weight="fill" />
      }
    case "normal":
    default:
      return {
        label: "Normal",
        bgClass: "bg-emerald-500/20",
        borderClass: "border-emerald-500",
        textClass: "text-emerald-400",
        solidBg: "bg-emerald-500",
        colorHex: "#10B981",
        icon: <CheckCircle className="size-4 text-emerald-400 shrink-0" weight="fill" />
      }
  }
}
