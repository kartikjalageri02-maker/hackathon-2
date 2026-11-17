import React from "react"
import { BrowserRouter } from "react-router-dom"
import { DemoRoleProvider } from "./providers/DemoRoleProvider"
import { SelectedMachineProvider } from "./providers/SelectedMachineProvider"
import { LiveDataProvider } from "./providers/LiveDataProvider"
import { AppRoutes } from "./routes"
import { Toaster } from "sonner"

export default function App() {
  return (
    <BrowserRouter>
      <DemoRoleProvider>
        <SelectedMachineProvider>
          <LiveDataProvider>
            <AppRoutes />
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#181818",
                  border: "1px solid #313131",
                  color: "#FFFFFF",
                  fontFamily: "Geist Variable, sans-serif",
                },
              }}
            />
          </LiveDataProvider>
        </SelectedMachineProvider>
      </DemoRoleProvider>
    </BrowserRouter>
  )
}
