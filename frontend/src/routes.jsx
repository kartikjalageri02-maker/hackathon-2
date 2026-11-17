import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { AppShell } from "./components/layout/AppShell"
import { OverviewPage } from "./pages/OverviewPage"
import { Factory3DPage } from "./pages/Factory3DPage"
import { SensorsPage } from "./pages/SensorsPage"
import { IntelligencePage } from "./pages/IntelligencePage"
import MaintenancePage from "./pages/MaintenancePage"
import DependenciesPage from "./pages/DependenciesPage"
import AlertsPage from "./pages/AlertsPage"
import ResourcesPage from "./pages/ResourcesPage"
import SimulationPage from "./pages/SimulationPage"
import LandingPage from "./pages/LandingPage"
import { NotFoundPage } from "./pages/NotFoundPage"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="/app/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="factory" element={<Factory3DPage />} />
        <Route path="sensors" element={<SensorsPage />} />
        <Route path="intelligence" element={<IntelligencePage />} />
        <Route path="dependencies" element={<DependenciesPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="simulation" element={<SimulationPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
