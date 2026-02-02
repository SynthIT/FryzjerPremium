"use client"

import * as React from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { Breadcrumbs } from "./_breadcrumbs"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="min-h-dvh">
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr]">
        <Sidebar />
        <main className="min-w-0 px-3 pb-10 pt-4 sm:px-4 md:px-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0 overflow-y-auto">
          <div className="flex h-full flex-col">
            <Sidebar onClose={() => setMobileMenuOpen(false)} mobile />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}


