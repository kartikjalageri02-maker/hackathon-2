import React, { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { MobileMenu } from "./MobileMenu"
import { ConnectionBanner } from "./ConnectionBanner"

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#000000] text-white">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <TopBar
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
        />
        <ConnectionBanner />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div key={location.pathname} className="animate-page-fade">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Full-height Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  )
}
