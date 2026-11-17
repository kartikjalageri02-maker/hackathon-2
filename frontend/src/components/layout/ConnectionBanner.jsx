import React from "react"
import { useLiveData } from "@/providers/LiveDataProvider"
import { ArrowsClockwise, WarningCircle } from "@phosphor-icons/react"

export function ConnectionBanner() {
  const { connectionStatus } = useLiveData()

  if (connectionStatus === "connected") return null

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-2 text-amber-400 caption-2">
        {connectionStatus === "reconnecting" ? (
          <ArrowsClockwise className="size-4 animate-spin shrink-0" />
        ) : (
          <WarningCircle className="size-4 shrink-0" />
        )}
        <span>
          {connectionStatus === "reconnecting"
            ? "Reconnecting live WebSocket stream. Telemetry is using cached data."
            : "Backend connection offline. Falling back to background polling."}
        </span>
      </div>
      <span className="caption-4 text-amber-400/80 hidden sm:inline">Automatic retry active</span>
    </div>
  )
}
