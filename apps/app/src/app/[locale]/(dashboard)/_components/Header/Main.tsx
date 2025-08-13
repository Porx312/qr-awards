"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@v1/ui/button"
import { Menu, Sparkles, LogOut, Settings, X, SidebarOpen } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@v1/ui/dropdown-menu"
import { DashboardSidebar } from "./DashboardSidebar"

const mockUser = {
  name: "Usuario Demo",
  email: "demo@stampme.com",
  avatarUrl: null,
}

export default function DashboardPage({
  children,
}: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = () => {
    console.log("Sign out clicked")
  }

  const handleSettingsClick = () => {
    console.log("Settings clicked")
  }

  const user = mockUser

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Integrated Header */}
      <header className="sticky top-0 z-50 w-full md:bg-white bg-transparent ">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Mobile Menu Button + Logo */}
          <div className="flex items-center space-x-3">
            {sidebarOpen ? (
  // Si el sidebar está abierto, mostramos el botón de cerrar
  <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
    <X className="h-5 w-5" />
  </Button>
) : (
  // Si está cerrado, mostramos el botón de abrir
  <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
    <Menu className="h-5 w-5" />
  </Button>
)}

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">StampMe</span>
            </Link>
          </div>

          {/* Page Title - Hidden on mobile */}
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-gray-900">dashboard</h1>
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center space-x-3">
            {/* Pro Badge - Hidden on small screens */}
            <Link
              href="/#pricing"
              className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-lg border border-amber-500/50 hover:border-amber-800/70 bg-gradient-to-r from-amber-500/20 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-500 hover:text-amber-400">Pro</span>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                  {user.avatarUrl ? (
                    <img
                      className="min-h-8 min-w-8 rounded-full object-cover"
                      alt={user.name ?? user.email}
                      src={user.avatarUrl || "/placeholder.svg"}
                    />
                  ) : (
                    <span className="min-h-8 min-w-8 rounded-full bg-gradient-to-br from-lime-400 from-10% via-cyan-300 to-blue-500" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56 bg-card p-2">
                <DropdownMenuItem className="group flex-col items-start focus:bg-transparent">
                  <p className="text-sm font-medium text-primary/80 group-hover:text-primary group-focus:text-primary">
                    {user?.name || ""}
                  </p>
                  <p className="text-sm text-primary/60">{user?.email}</p>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="group h-9 w-full cursor-pointer justify-between rounded-md px-2"
                  onClick={handleSettingsClick}
                >
                  <span className="text-sm text-primary/60 group-hover:text-primary group-focus:text-primary">
                    Settings
                  </span>
                  <Settings className="h-[18px] w-[18px] stroke-[1.5px] text-primary/60 group-hover:text-primary group-focus:text-primary" />
                </DropdownMenuItem>

                <DropdownMenuSeparator className="mx-0 my-2" />
                <DropdownMenuItem
                  className="group h-9 w-full cursor-pointer justify-between rounded-md px-2"
                  onClick={handleSignOut}
                >
                  <span className="text-sm text-primary/60 group-hover:text-primary group-focus:text-primary">
                    Log Out
                  </span>
                  <LogOut className="h-[18px] w-[18px] stroke-[1.5px] text-primary/60 group-hover:text-primary group-focus:text-primary" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden  lg:block">
          <DashboardSidebar />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-64 bg-white">
              <DashboardSidebar mobile onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {children}
        </div>
      </div>
    </div>
  )
}
