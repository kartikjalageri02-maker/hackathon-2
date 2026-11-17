import React, { createContext, useContext, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

const SelectedMachineContext = createContext(null)

export function SelectedMachineProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialMachine = searchParams.get("machine") || "MCH001"
  const [selectedMachineId, setSelectedMachineId] = useState(initialMachine)

  useEffect(() => {
    const urlMachine = searchParams.get("machine")
    if (urlMachine && urlMachine !== selectedMachineId) {
      setSelectedMachineId(urlMachine)
    } else if (!urlMachine) {
      // Keep URL synced with default machine
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set("machine", selectedMachineId)
        return next
      }, { replace: true })
    }
  }, [searchParams])

  const selectMachine = (id) => {
    setSelectedMachineId(id)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("machine", id)
      return next
    })
  }

  return (
    <SelectedMachineContext.Provider value={{ selectedMachineId, selectMachine }}>
      {children}
    </SelectedMachineContext.Provider>
  )
}

export function useSelectedMachine() {
  const context = useContext(SelectedMachineContext)
  if (!context) {
    throw new Error("useSelectedMachine must be used within a SelectedMachineProvider")
  }
  return context
}
