import { getMockEndpoint } from "./mockBackend"

const API_BASE_URL = import.meta.env.VITE_API_URL || ""

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const demoRole = localStorage.getItem("factory_demo_role") || "Viewer"

  const headers = {
    "Content-Type": "application/json",
    "X-Demo-Role": demoRole,
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const mock = getMockEndpoint(endpoint)
      if (mock !== null) return mock

      let errorDetail = "An unexpected error occurred"
      try {
        const errJson = await response.json()
        errorDetail = errJson.error?.message || errJson.detail || JSON.stringify(errJson)
      } catch {
        errorDetail = response.statusText
      }
      throw new Error(errorDetail)
    }

    return response.json()
  } catch (err) {
    const mock = getMockEndpoint(endpoint)
    if (mock !== null) return mock
    throw err
  }
}

// Factory
export const getFactorySummary = () => fetchApi("/api/factory/summary")
export const getFactoryLayout = () => fetchApi("/api/factory/layout")
export const getMachines = () => fetchApi("/api/machines")
export const getMachine = (id) => fetchApi(`/api/machines/${id}`)

// Sensors
export const getLatestSensors = (id) => fetchApi(`/api/machines/${id}/sensors/latest`)
export const getSensorHistory = (id, minutes = 15, sensors = "") =>
  fetchApi(`/api/machines/${id}/sensors/history?minutes=${minutes}${sensors ? `&sensors=${sensors}` : ""}`)
export const getMachineThresholds = (id) => fetchApi(`/api/machines/${id}/thresholds`)

// Analysis
export const getMachineAnalysis = (id) => fetchApi(`/api/machines/${id}/analysis`)
export const getMachineAnalysisHistory = (id) => fetchApi(`/api/machines/${id}/analysis/history`)

// Maintenance
export const getMachineComponents = (id) => fetchApi(`/api/machines/${id}/components`)
export const getMachineMaintenanceHistory = (id) => fetchApi(`/api/machines/${id}/maintenance/history`)
export const getMaintenanceOverview = () => fetchApi("/api/maintenance/overview")

// Dependencies
export const getDependencyGraph = () => fetchApi("/api/dependencies/graph")
export const getDependencyImpact = () => fetchApi("/api/dependencies/impact")

// Alerts
export const getAlerts = (status = "", severity = "", machineId = "") => {
  const params = new URLSearchParams()
  if (status) params.append("status", status)
  if (severity) params.append("severity", severity)
  if (machineId) params.append("machine_id", machineId)
  const qs = params.toString()
  return fetchApi(`/api/alerts${qs ? `?${qs}` : ""}`)
}
export const acknowledgeAlert = (id) => fetchApi(`/api/alerts/${id}/acknowledge`, { method: "POST" })
export const resolveAlert = (id) => fetchApi(`/api/alerts/${id}/resolve`, { method: "POST" })
export const getAlertEvents = (id) => fetchApi(`/api/alerts/${id}/events`)

// Resources
export const getSpareParts = () => fetchApi("/api/resources/spare-parts")
export const getTechnicians = () => fetchApi("/api/resources/technicians")
export const getMaintenanceTasks = () => fetchApi("/api/maintenance/tasks")
export const getRecommendations = (machineId = "") =>
  fetchApi(`/api/recommendations${machineId ? `?machine_id=${machineId}` : ""}`)
export const approveRecommendation = (id) => fetchApi(`/api/recommendations/${id}/approve`, { method: "POST" })

// Simulation
export const getSimulationScenarios = () => fetchApi("/api/simulation/scenarios")
export const getSimulationState = () => fetchApi("/api/simulation/state")
export const startSimulationScenario = (scenario, data = {}) =>
  fetchApi(`/api/simulation/scenarios/${scenario}/start`, {
    method: "POST",
    body: JSON.stringify(data),
  })
export const triggerAbnormalEvent = (data) =>
  fetchApi("/api/simulation/events", {
    method: "POST",
    body: JSON.stringify(data),
  })
export const resetSimulation = () => fetchApi("/api/simulation/reset", { method: "POST" })
