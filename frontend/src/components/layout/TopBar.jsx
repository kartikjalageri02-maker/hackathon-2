import React, { useState, useEffect } from "react"
import { useSelectedMachine } from "@/providers/SelectedMachineProvider"
import { useDemoRole } from "@/providers/DemoRoleProvider"
import { useLiveData } from "@/providers/LiveDataProvider"
import {
  SpeakerHigh,
  SpeakerSlash,
  CaretDown,
  List,
  X,
  Cpu,
  Circle,
  ShieldCheck,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function TopBar({ onToggleMobileMenu, mobileMenuOpen }) {
  const { selectedMachineId, selectMachine } = useSelectedMachine()
  const { role, setRole } = useDemoRole()
  const { machines, factorySummary, connectionStatus } = useLiveData()

  const [alarmEnabled, setAlarmEnabled] = useState(() => {
    return localStorage.getItem("factory_alarm_enabled") === "true"
  })
  const [machineDropdownOpen, setMachineDropdownOpen] = useState(false)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || {
    id: selectedMachineId,
    name: "Precision CNC Milling",
  }

  const toggleAlarm = () => {
    const next = !alarmEnabled
    setAlarmEnabled(next)
    localStorage.setItem("factory_alarm_enabled", next ? "true" : "false")
  }

  return (
    <header className="sticky top-0 z-40 h-14 bg-[#131209] border-b border-[#313131] px-4 flex items-center justify-between">
      {/* Left side: Mobile Toggle & Machine Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="lg:hidden p-1.5 rounded-md hover:bg-[#272727] active:scale-[0.98] transition-colors duration-300"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <List className="size-5" />}
        </button>

        {/* Selected Machine Pill with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMachineDropdownOpen(!machineDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#272727] border border-[#313131] transition-colors duration-300 active:scale-[0.98]"
          >
            <Cpu className="size-4 text-[#9B9B9B]" />
            <span className="title-4 font-mono font-medium text-white">{selectedMachine.id}</span>
            <span className="caption-2 text-[#9B9B9B] hidden sm:inline truncate max-w-[140px]">
              {selectedMachine.name}
            </span>
            <CaretDown className="size-3 text-[#9B9B9B]" />
          </button>

          {machineDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMachineDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-64 bg-[#181818]/95 border border-[#313131] rounded-xl shadow-2xl z-50 py-1 backdrop-blur-md animate-dropdown-fade">
                <div className="px-3 py-1.5 caption-4 text-[#9B9B9B] border-b border-[#313131]">
                  Select machine in line
                </div>
                {machines.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      selectMachine(m.id)
                      setMachineDropdownOpen(false)
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#272727] transition-colors duration-300",
                      selectedMachineId === m.id && "bg-[#272727]"
                    )}
                  >
                    <div>
                      <div className="body-5 font-mono text-white">{m.id}</div>
                      <div className="caption-2 text-[#9B9B9B] truncate">{m.name}</div>
                    </div>
                    <span
                      className={cn(
                        "caption-4 font-mono px-1.5 py-0.5 rounded",
                        m.severity === "Normal"
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-amber-400 bg-amber-500/10"
                      )}
                    >
                      {Math.round(m.health_score || 100)}%
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Simulated Data Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1F1F1F] border border-[#313131] caption-3 text-[#9B9B9B]">
          <ShieldCheck className="size-3.5 text-blue-400" />
          <span>Simulated data</span>
        </div>
      </div>

      {/* Right side: Health, Connection, Alarm & Demo Role */}
      <div className="flex items-center gap-3">
        {/* Factory Health Summary */}
        <div className="hidden sm:flex items-center gap-2 caption-2 text-[#9B9B9B]">
          <span>Line health:</span>
          <span className="font-mono text-white font-medium">
            {factorySummary ? `${factorySummary.factory_health_score}%` : "98.5%"}
          </span>
        </div>

        {/* Live WebSocket Connection Pill */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#1F1F1F] border border-[#313131] caption-4">
          <Circle
            className={cn(
              "size-2 shrink-0",
              connectionStatus === "connected"
                ? "text-emerald-400 fill-emerald-400"
                : "text-amber-400 fill-amber-400"
            )}
          />
          <span className="text-[#9B9B9B] hidden md:inline">
            {connectionStatus === "connected" ? "Live" : "Reconnecting"}
          </span>
        </div>

        {/* Emergency Alarm Audio Toggle */}
        <button
          onClick={toggleAlarm}
          title={alarmEnabled ? "Emergency audio alarm enabled" : "Emergency audio alarm muted"}
          className={cn(
            "p-2 rounded-lg border transition-colors duration-300 active:scale-[0.98]",
            alarmEnabled
              ? "bg-[#1F1F1F] border-red-500/40 text-red-400"
              : "bg-[#181818] border-[#313131] text-[#9B9B9B] hover:text-white"
          )}
        >
          {alarmEnabled ? <SpeakerHigh className="size-4" /> : <SpeakerSlash className="size-4" />}
        </button>

        {/* Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#272727] border border-[#313131] transition-colors duration-300 active:scale-[0.98]"
          >
            <span className="caption-4 text-[#9B9B9B] hidden sm:inline">Role:</span>
            <span className="body-5 text-white">{role}</span>
            <CaretDown className="size-3 text-[#9B9B9B]" />
          </button>

          {roleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setRoleDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-44 bg-[#181818]/95 border border-[#313131] rounded-xl shadow-2xl z-50 py-1 backdrop-blur-md animate-dropdown-fade">
                <div className="px-3 py-1.5 caption-4 text-[#9B9B9B] border-b border-[#313131]">
                  Switch demo role
                </div>
                {["Viewer", "Operator", "Supervisor"].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r)
                      setRoleDropdownOpen(false)
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left body-5 text-white hover:bg-[#272727] transition-colors duration-300",
                      role === r && "bg-[#272727] font-semibold"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
