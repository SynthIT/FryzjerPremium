import * as React from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { Breadcrumbs } from "./_breadcrumbs"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 md:grid-cols-[auto_1fr]">
        <Sidebar />
        <main className="px-4 pb-10 pt-4 md:px-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  )
}


