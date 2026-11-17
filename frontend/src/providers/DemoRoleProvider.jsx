import React, { createContext, useContext, useState, useEffect } from "react"

const DemoRoleContext = createContext(null)

export function DemoRoleProvider({ children }) {
  const [role, setRoleState] = useState(() => {
    return localStorage.getItem("factory_demo_role") || "Viewer"
  })

  const setRole = (newRole) => {
    setRoleState(newRole)
    localStorage.setItem("factory_demo_role", newRole)
  }

  return (
    <DemoRoleContext.Provider value={{ role, setRole }}>
      {children}
    </DemoRoleContext.Provider>
  )
}

export function useDemoRole() {
  const context = useContext(DemoRoleContext)
  if (!context) {
    throw new Error("useDemoRole must be used within a DemoRoleProvider")
  }
  return context
}
