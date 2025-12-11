"use client"

import * as React from "react"
import Link from "next/link"
import { Bell, Settings, User2, LogOut, User, Sun, Moon, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center justify-between px-3 sm:px-4 md:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            aria-label="Otwórz menu"
            className="rounded p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring active:scale-95 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="inline-flex items-center gap-2">
            <span className="h-6 w-6 rounded bg-linear-to-br from-zinc-900 to-zinc-500 shadow-sm" />
            <span className="font-semibold tracking-tight text-sm sm:text-base">Panel Administracyjny</span>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <button aria-label="Przełącz motyw" onClick={toggleTheme} className="rounded p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring active:scale-95">
            {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link href="#" aria-label="Powiadomienia" className="rounded p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
            <Bell className="h-5 w-5" />
          </Link>
          <Link href="/admin/settings" aria-label="Ustawienia" className="rounded p-2 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
            <Settings className="h-5 w-5" />
          </Link>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button aria-label="Konto" className="ml-1 inline-flex items-center rounded-full border p-1 transition-all hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring data-[state=open]:scale-95">
                <User2 className="h-5 w-5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content sideOffset={8} className="min-w-[220px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md will-change-[transform,opacity] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
                <DropdownMenu.Label className="px-2 py-1.5 text-xs text-muted-foreground">Konto</DropdownMenu.Label>
                <DropdownMenu.Item asChild>
                  <Link href="/settings/account" className="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    <User className="h-4 w-4" />
                    Profil i ustawienia
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item asChild>
                  <button className="flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none transition-colors hover:bg-accent" onClick={() => alert("Wylogowano (placeholder)") }>
                    <LogOut className="h-4 w-4" />
                    Wyloguj
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  )
}


