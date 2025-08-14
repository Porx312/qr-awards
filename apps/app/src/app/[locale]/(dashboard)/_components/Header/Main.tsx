"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@v1/ui/button"
import { Menu, Sparkles, LogOut, Settings, X} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@v1/ui/dropdown-menu"
import { DashboardSidebar } from "./DashboardSidebar"
import { Avatar } from "./Avatar"



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
              <Avatar/>
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
