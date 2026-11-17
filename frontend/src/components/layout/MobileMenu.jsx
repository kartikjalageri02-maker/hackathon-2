import React from "react"
import { NavLink } from "react-router-dom"
import { NAV_ITEMS } from "./Sidebar"
import { cn } from "@/lib/utils"

export function MobileMenu({ isOpen, onClose, currentStage = 11 }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-[#131209]/95 backdrop-blur-md animate-fade-in">
      <div className="h-14 border-b border-[#313131] px-4 flex items-center justify-between">
        <span className="title-3 font-semibold text-white">Menu</span>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-[#9B9B9B] hover:text-white hover:bg-[#272727]"
        >
          Close
        </button>
      </div>

      <nav className="p-4 space-y-2 overflow-y-auto flex-1">
        {NAV_ITEMS.map((item, index) => {
          const isEnabled = item.stage <= currentStage
          const delayMs = Math.min(index * 60, 400)

          if (!isEnabled) {
            return (
              <div
                key={item.path}
                aria-disabled="true"
                style={{ animationDelay: `${delayMs}ms` }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#9B9B9B]/30 select-none animate-slide-up"
              >
                {item.icon}
                <span className="body-4">{item.label}</span>
                <span className="caption-4 ml-auto font-mono">Stage {item.stage}</span>
              </div>
            )
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={{ animationDelay: `${delayMs}ms` }}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-300 animate-slide-up",
                  isActive
                    ? "bg-[#272727] text-white font-medium border-l-2 border-white"
                    : "text-[#9B9B9B] hover:text-white hover:bg-[#181818]"
                )
              }
            >
              {item.icon}
              <span className="body-4">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
