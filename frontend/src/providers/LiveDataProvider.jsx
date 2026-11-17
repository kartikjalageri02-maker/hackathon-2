import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { fetchApi } from "@/lib/api"
import { alarmEngine } from "@/lib/alarm"
import { generateSensorReading, MOCK_MACHINES } from "@/lib/mockBackend"

const LiveDataContext = createContext(null)

export function LiveDataProvider({ children }) {
  const [connectionStatus, setConnectionStatus] = useState("connected") // connected, reconnecting, offline
  const [machines, setMachines] = useState(MOCK_MACHINES)
  const [factorySummary, setFactorySummary] = useState(null)
  const [activeAlerts, setActiveAlerts] = useState([])
  const [latestTelemetry, setLatestTelemetry] = useState({})
  const [latestAnalysis, setLatestAnalysis] = useState({})

  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const pollIntervalRef = useRef(null)
  const simTickerRef = useRef(null)
  const tickCountRef = useRef(0)

  // Start smooth client-side live simulation stream for static / GitHub Pages deployment
  const startClientSimStream = () => {
    if (simTickerRef.current) return
    setConnectionStatus("connected")
    simTickerRef.current = setInterval(() => {
      tickCountRef.current += 1
      const tick = tickCountRef.current
      const machineIds = ["MCH001", "MCH002", "MCH003"]
      const newTelem = {}
      machineIds.forEach((id) => {
        newTelem[id] = generateSensorReading(id, tick)
      })
      setLatestTelemetry((prev) => ({ ...prev, ...newTelem }))
    }, 1000)
  }

  // Fetch initial REST snapshot
  const loadInitialData = async () => {
    try {
      const [machinesData, summaryData] = await Promise.all([
        fetchApi("/api/machines"),
        fetchApi("/api/factory/summary"),
      ])
      setMachines(machinesData)
      setFactorySummary(summaryData)
    } catch {
      // Backend may be booting up
    }
  }

  // WebSocket connection logic
  const connectWebSocket = () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return
    }

    // On GitHub Pages or static host, activate instant client live stream
    if (window.location.hostname.endsWith("github.io")) {
      startClientSimStream()
      return
    }

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = import.meta.env.VITE_WS_URL || `${wsProtocol}//${window.location.host}/ws/live`

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionStatus("connected")
        if (simTickerRef.current) {
          clearInterval(simTickerRef.current)
          simTickerRef.current = null
        }
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
      }

      ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data)
          const { type, machine_id, payload } = envelope

          switch (type) {
            case "snapshot":
              if (payload.machines) setMachines(payload.machines)
              if (payload.factory_summary) setFactorySummary(payload.factory_summary)
              if (payload.active_alerts) setActiveAlerts(payload.active_alerts)
              break
            case "sensor.update":
              if (machine_id && payload) {
                setLatestTelemetry((prev) => ({ ...prev, [machine_id]: payload }))
              }
              break
            case "analysis.update":
              if (machine_id && payload) {
                setLatestAnalysis((prev) => ({ ...prev, [machine_id]: payload }))
                // Also update machines array
                setMachines((prev) =>
                  prev.map((m) =>
                    m.id === machine_id
                      ? {
                          ...m,
                          health_score: payload.health_score,
                          risk_score: payload.risk_score,
                          severity: payload.severity,
                        }
                      : m
                  )
                )
              }
              break
            case "factory.summary":
              if (payload) setFactorySummary(payload)
              break
            case "alert.created":
            case "alert.updated":
              if (payload) {
                setActiveAlerts((prev) => {
                  const filtered = prev.filter((a) => a.id !== payload.id)
                  if (payload.status === "active") {
                    return [payload, ...filtered]
                  }
                  return filtered
                })
              }
              break
            default:
              break
          }
        } catch {
          // ignore malformed websocket message
        }
      }

      ws.onerror = () => {
        startClientSimStream()
      }

      ws.onclose = () => {
        startClientSimStream()
        wsRef.current = null
        scheduleReconnect()
      }
    } catch {
      startClientSimStream()
      scheduleReconnect()
    }
  }

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    reconnectTimeoutRef.current = setTimeout(() => {
      connectWebSocket()
    }, 5000)

    // Fallback polling while disconnected
    if (!pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(loadInitialData, 5000)
    }
  }

  useEffect(() => {
    loadInitialData()
    connectWebSocket()

    return () => {
      if (wsRef.current) wsRef.current.close()
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      if (simTickerRef.current) clearInterval(simTickerRef.current)
    }
  }, [])

  // Emergency Alarm monitor: triggers alarm if any active alert is Emergency and unacknowledged
  useEffect(() => {
    const hasEmergency = activeAlerts.some(
      (a) => a.severity === "Emergency" && a.status === "active" && !a.acknowledged_at
    )
    if (hasEmergency) {
      alarmEngine.startAlarm()
    } else {
      alarmEngine.stopAlarm()
    }
  }, [activeAlerts])

  return (
    <LiveDataContext.Provider
      value={{
        connectionStatus,
        machines,
        factorySummary,
        activeAlerts,
        latestTelemetry,
        latestAnalysis,
        refreshData: loadInitialData,
      }}
    >
      {children}
    </LiveDataContext.Provider>
  )
}

export function useLiveData() {
  const context = useContext(LiveDataContext)
  if (!context) {
    throw new Error("useLiveData must be used within a LiveDataProvider")
  }
  return context
}
