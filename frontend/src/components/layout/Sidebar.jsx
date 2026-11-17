import React from "react"
import { NavLink } from "react-router-dom"
import {
  Gauge,
  Cube,
  Waveform,
  Brain,
  TreeStructure,
  Wrench,
  Package,
  Bell,
  PlayCircle,
  Factory,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export const NAV_ITEMS = [
  { path: "/app/overview", label: "Overview", icon: <Gauge className="size-5 shrink-0" />, stage: 2 },
  { path: "/app/factory", label: "3D Factory", icon: <Cube className="size-5 shrink-0" />, stage: 3 },
  { path: "/app/sensors", label: "Sensors", icon: <Waveform className="size-5 shrink-0" />, stage: 4 },
  { path: "/app/intelligence", label: "Intelligence", icon: <Brain className="size-5 shrink-0" />, stage: 5 },
  { path: "/app/dependencies", label: "Dependencies", icon: <TreeStructure className="size-5 shrink-0" />, stage: 7 },
  { path: "/app/maintenance", label: "Maintenance", icon: <Wrench className="size-5 shrink-0" />, stage: 6 },
  { path: "/app/resources", label: "Resources", icon: <Package className="size-5 shrink-0" />, stage: 9 },
  { path: "/app/alerts", label: "Alerts", icon: <Bell className="size-5 shrink-0" />, stage: 8 },
  { path: "/app/simulation", label: "What If Simulation", icon: <PlayCircle className="size-5 shrink-0" />, stage: 10 },
]

export function Sidebar({ currentStage = 11 }) {
  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 bg-[#131209] border-r border-[#313131] shrink-0 h-full">
      <div>
        {/* Brand Header */}
        <div className="h-14 border-b border-[#313131] px-5 flex items-center gap-2.5">
          <Factory className="size-6 text-white shrink-0" weight="fill" />
          <span className="title-3 font-semibold text-white tracking-tight truncate">
            Beyond Factory Floor
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isEnabled = item.stage <= currentStage

            if (!isEnabled) {
              return (
                <div
                  key={item.path}
                  aria-disabled="true"
                  title="Available in upcoming stage"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#9B9B9B]/40 cursor-not-allowed select-none"
                >
                  {item.icon}
                  <span className="body-5">{item.label}</span>
                  <span className="caption-5 ml-auto font-mono text-[#9B9B9B]/30">Stage {item.stage}</span>
                </div>
              )
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-300",
                    isActive
                      ? "bg-[#272727] text-white font-medium border-l-2 border-white"
                      : "text-[#9B9B9B] hover:text-white hover:bg-[#181818]"
                  )
                }
              >
                {item.icon}
                <span className="body-5">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#313131]">
        <div className="caption-4 text-[#9B9B9B]">Factory Digital Twin</div>
        <div className="caption-5 text-[#9B9B9B]/60 mt-0.5">3 Connected Machines • Line 01</div>
      </div>
    </aside>
  )
}
